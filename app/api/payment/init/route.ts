import { NextRequest, NextResponse } from 'next/server';
import {
  alfaHandshake,
  buildAlfaSsoFields,
  isAlfaConfigured,
} from '@/lib/alfaPayment';
import { prepareCheckoutForPayment, type CheckoutPaymentPayload } from '@/lib/paymentOrderService';
import { isCheckoutEnabled } from '@/lib/checkoutEnabled';
import { isPaymentDemoMode } from '@/lib/paymentGateway';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** POST /api/payment/init — save checkout session and start Alfalah redirect (no Order until paid). */
export async function POST(req: NextRequest) {
  try {
    if (!isCheckoutEnabled()) {
      return NextResponse.json(
        {
          success: false,
          code: 'GATEWAY_NOT_CONFIGURED',
          message: 'Online checkout is not available yet.',
        },
        { status: 503 },
      );
    }

    const body = await req.json();
    const paymentData = body?.paymentData as CheckoutPaymentPayload | undefined;

    if (!paymentData?.orderId || !paymentData?.customerInfo || !paymentData?.orderItems?.length) {
      return NextResponse.json(
        {
          success: false,
          code: 'MISSING_ORDER_DATA',
          message: 'Checkout session expired or order data is missing.',
        },
        { status: 400 },
      );
    }

    if (!isAlfaConfigured()) {
      if (isPaymentDemoMode()) {
        return NextResponse.json(
          {
            success: false,
            code: 'GATEWAY_NOT_CONFIGURED',
            message: 'Alfalah credentials are incomplete. Use demo payment or finish APG setup.',
            detail:
              'Add ALFA_MERCHANT_ID, ALFA_STORE_ID, ALFA_KEY1, and ALFA_KEY2 from Integration → Page Redirection in the Alfalah merchant portal.',
          },
          { status: 503 },
        );
      }
      return NextResponse.json(
        {
          success: false,
          code: 'GATEWAY_NOT_CONFIGURED',
          message: 'Online payments are not configured.',
        },
        { status: 503 },
      );
    }

    const [checkout, handshake] = await Promise.all([
      prepareCheckoutForPayment(req, paymentData),
      alfaHandshake({ orderRef: paymentData.orderId, req }),
    ]);

    if (checkout.alreadyPaid) {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        orderId: checkout.orderNumber,
        dbOrderId: checkout.dbOrderId,
      });
    }
    const sso = buildAlfaSsoFields({
      handshake,
      orderRef: checkout.orderNumber,
      amount: checkout.totalAmount,
      email: paymentData.customerInfo.email,
      phone: paymentData.customerInfo.phone,
    });

    return NextResponse.json({
      success: true,
      orderId: checkout.orderNumber,
      actionUrl: sso.actionUrl,
      fields: sso.fields,
      gateway: 'alfalah',
    });
  } catch (err: unknown) {
    console.error('[POST /api/payment/init]', err);
    const message = err instanceof Error ? err.message : 'Payment initialization failed.';
    return NextResponse.json(
      {
        success: false,
        code: 'SERVER_ERROR',
        message,
      },
      { status: 500 },
    );
  }
}
