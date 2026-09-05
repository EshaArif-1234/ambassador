import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import {
  isAlfaPaymentEnabled,
  isPaymentDemoMode,
  isPaymentGatewayConfigured,
  type PaymentErrorCode,
  type PaymentProcessResult,
} from '@/lib/paymentGateway';
import { enrichOrderItemsList, mapRawOrderItem } from '@/utils/orderItems.util';
import { syncUserContactFromCheckout } from '@/utils/syncUserContact.util';
import { sendOrderConfirmationEmail } from '@/utils/email.util';
import { validateCardPayment } from '@/utils/paymentCard.util';
import { getUserIdFromRequest } from '@/utils/authSession.util';
import type { IOrderItem } from '@/backend/models/Order.model';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function fail(
  code: PaymentErrorCode,
  message: string,
  extra?: { detail?: string; fieldErrors?: Record<string, string> },
  status = 400,
) {
  return NextResponse.json(
    { success: false, code, message, ...extra },
    { status },
  );
}

/** POST /api/payment/process — validate card and create paid order (demo mode when no gateway). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const card = body?.card ?? {};
    const paymentData = body?.paymentData;

    if (!paymentData?.orderId || !paymentData?.customerInfo || !paymentData?.orderItems?.length) {
      return fail(
        'MISSING_ORDER_DATA',
        'Checkout session expired or order data is missing.',
        {
          detail:
            'Go back to checkout, confirm your details again, then return to payment.',
        },
      );
    }

    const fieldErrors = validateCardPayment({
      cardNumber: typeof card.cardNumber === 'string' ? card.cardNumber : '',
      expiryMonth: typeof card.expiryMonth === 'string' ? card.expiryMonth : '',
      expiryYear: typeof card.expiryYear === 'string' ? card.expiryYear : '',
      cvv: typeof card.cvv === 'string' ? card.cvv : '',
      cardholderName: typeof card.cardholderName === 'string' ? card.cardholderName : '',
    });

    if (Object.keys(fieldErrors).length > 0) {
      return fail(
        'CARD_INVALID',
        'Your card details could not be verified. Please fix the highlighted fields.',
        { fieldErrors },
      );
    }

    const gatewayConfigured = isPaymentGatewayConfigured();
    const demoMode = isPaymentDemoMode();

    if (isAlfaPaymentEnabled()) {
      return fail(
        'GATEWAY_NOT_CONFIGURED',
        'Use Alfalah secure checkout instead of demo card entry.',
        {
          detail: 'This site uses Bank Alfalah APG. Go back to checkout and continue to payment.',
        },
        400,
      );
    }

    if (!gatewayConfigured && !demoMode) {
      return fail(
        'GATEWAY_NOT_CONFIGURED',
        'Online card payments are not active on this website yet.',
        {
          detail:
            'Ambassador has not connected a live payment gateway (JazzCash, EasyPaisa, or card processor). Please contact info@ambassador.pk or call 0333-1166925 to complete your order manually.',
        },
        503,
      );
    }

    if (gatewayConfigured && !demoMode) {
      // Placeholder until live gateway integration is wired — return an honest error instead of random failure.
      return fail(
        'GATEWAY_NOT_CONFIGURED',
        'Payment gateway credentials are set but processing is not implemented yet.',
        {
          detail:
            'The server cannot charge cards until the gateway API is fully connected. Contact the site administrator or email info@ambassador.pk for assistance.',
        },
        503,
      );
    }

    const {
      orderId,
      customerInfo,
      orderItems,
      orderData,
      amount,
    } = paymentData;

    await connectDB();

    const existing = await Order.findOne({ orderNumber: orderId }).select('_id').lean();
    if (existing) {
      return NextResponse.json({
        success: true,
        paymentId: `PAY-${orderId}`,
        orderId,
        dbOrderId: String(existing._id),
        demoMode: true,
        message: 'This order was already saved.',
      });
    }

    let items: IOrderItem[] = (orderItems as Record<string, unknown>[]).map((item) =>
      mapRawOrderItem(item),
    );
    items = await enrichOrderItemsList(items);

    const subtotal = orderData?.subtotal ?? items.reduce((s, i) => s + i.total, 0);
    const deliveryCharges = orderData?.deliveryCharges ?? 0;
    const totalAmount = orderData?.totalAmount ?? amount ?? subtotal + deliveryCharges;

    const rawAddress: string = orderData?.address ?? customerInfo.address ?? '';
    const city: string = orderData?.city ?? customerInfo.city ?? '';
    const street = rawAddress.includes(',') ? rawAddress.split(',')[0].trim() : rawAddress;

    const cardDigits = String(card.cardNumber).replace(/\D/g, '');
    const payId = `PAY-${Date.now()}`;
    const gatewayMethod = `Credit/Debit Card (•••• ${cardDigits.slice(-4)})`;

    const normalizedEmail =
      typeof customerInfo.email === 'string' ? customerInfo.email.trim().toLowerCase() : '';

    await syncUserContactFromCheckout(req, normalizedEmail, {
      phone: customerInfo.phone ?? '',
      city,
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
      paymentStatus: 'paid',
      paymentMethod: 'card',
      paymentId: payId,
      transactionId: payId,
      gatewayMethod,
      paidAt: new Date(),
      shippingAddress: {
        street: street || customerInfo.address || 'N/A',
        city: city || 'N/A',
        state: '',
        zipCode: '',
        country: 'Pakistan',
      },
      deliveryNotes: orderData?.deliveryNotes ?? '',
    });

    if (normalizedEmail) {
      try {
        await sendOrderConfirmationEmail({
          customerName: customerInfo.name,
          customerEmail: normalizedEmail,
          orderNumber: orderId,
          paymentId: payId,
          paidAt: new Date().toISOString(),
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
          paymentMethod: gatewayMethod,
        });
      } catch (emailErr) {
        console.error('[POST /api/payment/process] confirmation email failed:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: payId,
      orderId,
      dbOrderId: String(order._id),
      demoMode: true,
      message: demoMode
        ? 'Order saved in demo payment mode (no real card charge was made).'
        : 'Payment successful.',
    });
  } catch (err: unknown) {
    const mongoErr = err as { code?: number; message?: string };
    console.error('[POST /api/payment/process]', err);

    if (mongoErr.code === 11000) {
      return fail(
        'ORDER_SAVE_FAILED',
        'This order reference already exists in our system.',
        { detail: mongoErr.message ?? 'Duplicate order number.' },
        409,
      );
    }

    return fail(
      'SERVER_ERROR',
      'Something went wrong while saving your order.',
      {
        detail:
          mongoErr.message ??
          'The server could not complete payment. Try again or contact info@ambassador.pk.',
      },
      500,
    );
  }
}
