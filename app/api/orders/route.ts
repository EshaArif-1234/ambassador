import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/backend/config/db';

import Order from '@/backend/models/Order.model';

import {

  getUserIdFromRequest,

  ordersFilterForUser,

  requireAuthUser,

} from '@/utils/authSession.util';

import { enrichOrderItemsList, mapRawOrderItem } from '@/utils/orderItems.util';

import { syncUserContactFromCheckout } from '@/utils/syncUserContact.util';

import { sendOrderConfirmationEmail } from '@/utils/email.util';

import type { IOrderItem } from '@/backend/models/Order.model';

import mongoose from 'mongoose';



export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';



const ORDER_STATUSES = [

  'pending',

  'confirmed',

  'processing',

  'shipped',

  'delivered',

  'cancelled',

] as const;



async function safeEnrichItems(items: IOrderItem[]): Promise<IOrderItem[]> {

  try {

    return await enrichOrderItemsList(items);

  } catch (err) {

    console.error('[orders] enrich items failed:', err);

    return items;

  }

}



/** GET /api/orders — return orders for the authenticated user. Optional ?status=cancelled */

export async function GET(req: NextRequest) {

  try {

    const auth = await requireAuthUser(req);

    if (!auth.ok) {

      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

    }



    const statusParam = new URL(req.url).searchParams.get('status')?.trim().toLowerCase();

    const filter: Record<string, unknown> = {
      ...ordersFilterForUser(auth.user),
      paymentStatus: { $in: ['paid', 'refunded'] },
    };

    if (

      statusParam &&

      statusParam !== 'all' &&

      (ORDER_STATUSES as readonly string[]).includes(statusParam)

    ) {

      filter.status = statusParam;

    }



    const orders = await Order.find(filter)

      .sort({ updatedAt: -1 })

      .select(

        'orderNumber status createdAt updatedAt items subtotal deliveryCharges totalAmount shippingAddress paymentStatus paidAt deliveryDate notes failedReason'

      )

      .lean();



    for (const order of orders) {

      order.items = await safeEnrichItems((order.items ?? []) as IOrderItem[]);

    }



    return NextResponse.json(

      { success: true, data: orders },

      { headers: { 'Cache-Control': 'no-store, private' } }

    );

  } catch (err) {

    console.error('[GET /api/orders]', err);

    return NextResponse.json({ success: false, message: 'Failed to fetch orders.' }, { status: 500 });

  }

}



/** POST /api/orders — create a new order after successful payment */

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();



    const {

      orderId,

      customerInfo,

      orderItems,

      orderData,

      paymentMethod,

      paymentStatus,

      paymentId,

      transactionId,

      gatewayMethod,

      paidAt,

      paymentType,

      walletNumber,

    } = body;



    if (!orderId || !customerInfo || !orderItems?.length) {

      return NextResponse.json(

        { success: false, message: 'Missing required order fields.' },

        { status: 400 }

      );

    }



    await connectDB();



    const rawItems =

      Array.isArray(orderItems) && orderItems.length

        ? orderItems

        : Array.isArray(orderData?.products)

          ? orderData.products

          : [];



    let items: IOrderItem[] = rawItems.map((item: Record<string, unknown>) =>

      mapRawOrderItem(item)

    );



    items = await safeEnrichItems(items);



    const subtotal = orderData?.subtotal ?? items.reduce((s: number, i: IOrderItem) => s + i.total, 0);

    const deliveryCharges = orderData?.deliveryCharges ?? 0;

    const totalAmount = orderData?.totalAmount ?? subtotal + deliveryCharges;



    const rawAddress: string = orderData?.address ?? `${orderData?.city ?? ''}`;

    const city: string = orderData?.city ?? customerInfo.city ?? '';

    const street = rawAddress.includes(',') ? rawAddress.split(',')[0].trim() : rawAddress;



    const methodLabel =

      paymentType?.includes('jazzcash') ? `JazzCash (${walletNumber ?? ''})` :

      paymentType?.includes('easypaisa') ? `EasyPaisa (${walletNumber ?? ''})` :

      paymentMethod === 'bank' ? 'Bank Transfer' :

      paymentMethod === 'card' ? 'Credit/Debit Card' :

      paymentMethod ?? 'Online';



    const normalizedEmail =

      typeof customerInfo.email === 'string'

        ? customerInfo.email.trim().toLowerCase()

        : '';



    const contactPhone =

      typeof customerInfo.phone === 'string'

        ? customerInfo.phone

        : typeof orderData?.phone === 'string'

          ? orderData.phone

          : '';

    const contactCity =

      typeof orderData?.city === 'string'

        ? orderData.city

        : typeof customerInfo.city === 'string'

          ? customerInfo.city

          : city;



    await syncUserContactFromCheckout(req, normalizedEmail, {

      phone: contactPhone,

      city: contactCity,

      address: street,

    });



    const linkedUserId = getUserIdFromRequest(req);

    const orderUserId =

      linkedUserId && mongoose.Types.ObjectId.isValid(linkedUserId)

        ? new mongoose.Types.ObjectId(linkedUserId)

        : undefined;



    const order = await Order.create({

      orderNumber: orderId,

      userId: orderUserId,

      customerName: customerInfo.name,

      customerEmail: normalizedEmail,

      customerPhone: customerInfo.phone,

      items,

      subtotal,

      deliveryCharges,

      totalAmount,

      currency: 'PKR',

      status: 'processing',

      paymentStatus: paymentStatus === 'paid' ? 'paid' : 'pending',

      paymentMethod: paymentMethod ?? 'online',

      paymentId: paymentId ?? undefined,

      transactionId: transactionId ?? undefined,

      gatewayMethod: methodLabel,

      paidAt: paidAt ? new Date(paidAt) : undefined,

      shippingAddress: {

        street: street || customerInfo.address || 'N/A',

        city: city || 'N/A',

        state: '',

        zipCode: '',

        country: 'Pakistan',

      },

      deliveryNotes: orderData?.deliveryNotes ?? '',

    });



    if (paymentStatus === 'paid' && normalizedEmail) {

      try {

        const emailResult = await sendOrderConfirmationEmail({

          customerName: customerInfo.name,

          customerEmail: normalizedEmail,

          orderNumber: orderId,

          paymentId: paymentId ?? transactionId,

          paidAt: paidAt ?? new Date().toISOString(),

          items: items.map((item) => ({

            productName: item.productName,

            quantity: item.quantity,

            price: item.price,

            total: item.total,

          })),

          subtotal,

          deliveryCharges,

          totalAmount,

          shippingAddress: {

            street: street || customerInfo.address || 'N/A',

            city: city || 'N/A',

            country: 'Pakistan',

          },

          deliveryNotes: orderData?.deliveryNotes ?? '',

          paymentMethod: methodLabel,

        });

        if (!emailResult.ok) {

          console.error(

            `[POST /api/orders] confirmation email failed for ${normalizedEmail}: ${emailResult.error}`

          );

        }

      } catch (emailErr) {

        console.error('[POST /api/orders] confirmation email failed:', emailErr);

      }

    }



    return NextResponse.json({ success: true, data: order }, { status: 201 });

  } catch (err: unknown) {

    const mongoErr = err as { code?: number; message?: string };

    console.error('[POST /api/orders]', err);

    if (mongoErr.code === 11000) {

      return NextResponse.json({ success: true, message: 'Order already saved.' }, { status: 200 });

    }

    return NextResponse.json(

      { success: false, message: mongoErr.message || 'Failed to create order.' },

      { status: 500 }

    );

  }

}


