import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import User from '@/backend/models/User.model';
import { verifyToken, extractToken } from '@/utils/jwt.util';
import { enrichOrderItemsList, mapRawOrderItem } from '@/utils/orderItems.util';
import { syncUserContactFromCheckout } from '@/utils/syncUserContact.util';
import type { IOrderItem } from '@/backend/models/Order.model';

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

/** GET /api/orders — return orders for the authenticated user (matched by email). Optional ?status=cancelled */
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    await connectDB();

    const user = await User.findById(decoded.id).select('email').lean();
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 401 });
    }

    const statusParam = new URL(req.url).searchParams.get('status')?.trim().toLowerCase();
    const filter: Record<string, unknown> = { customerEmail: user.email };
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
      order.items = await enrichOrderItemsList((order.items ?? []) as IOrderItem[]);
    }

    return NextResponse.json({ success: true, data: orders });
  } catch {
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

    // Map cart items — fall back to orderData.products if orderItems lack fields
    const rawItems =
      Array.isArray(orderItems) && orderItems.length
        ? orderItems
        : Array.isArray(orderData?.products)
          ? orderData.products
          : [];

    let items: IOrderItem[] = rawItems.map((item: Record<string, unknown>) =>
      mapRawOrderItem(item)
    );

    items = await enrichOrderItemsList(items);

    const subtotal = orderData?.subtotal ?? items.reduce((s: number, i: any) => s + i.total, 0);
    const deliveryCharges = orderData?.deliveryCharges ?? 0;
    const totalAmount = orderData?.totalAmount ?? subtotal + deliveryCharges;

    // Build shipping address from orderData
    const rawAddress: string = orderData?.address ?? `${orderData?.city ?? ''}`;
    const city: string = orderData?.city ?? customerInfo.city ?? '';
    const street = rawAddress.includes(',') ? rawAddress.split(',')[0].trim() : rawAddress;

    const methodLabel =
      paymentType?.includes('jazzcash') ? `JazzCash (${walletNumber ?? ''})` :
      paymentType?.includes('easypaisa') ? `EasyPaisa (${walletNumber ?? ''})` :
      paymentMethod === 'bank' ? 'Bank Transfer' :
      paymentMethod === 'card' ? 'Credit/Debit Card' :
      paymentMethod ?? 'Online';

    const customerEmail =
      typeof customerInfo.email === 'string' ? customerInfo.email : '';
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

    await syncUserContactFromCheckout(req, customerEmail, {
      phone: contactPhone,
      city: contactCity,
      address: street,
    });

    const order = await Order.create({
      orderNumber: orderId,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      items,
      subtotal,
      deliveryCharges,
      totalAmount,
      currency: 'PKR',
      status: 'pending',
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

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/orders]', err);
    // Duplicate order number — order already saved
    if (err.code === 11000) {
      return NextResponse.json({ success: true, message: 'Order already saved.' }, { status: 200 });
    }
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to create order.' },
      { status: 500 }
    );
  }
}
