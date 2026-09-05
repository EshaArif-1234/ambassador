import { NextRequest, NextResponse } from 'next/server';
import { isAlfaConfigured } from '@/lib/alfaPayment';
import { processAlfalahReturn } from '@/lib/processAlfalahPayment';
import { getPublicOrderSummary } from '@/lib/paymentOrderService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/payment/status?order=ORD-xxx — public order summary for success page. */
export async function GET(req: NextRequest) {
  try {
    const orderNumber =
      new URL(req.url).searchParams.get('order')?.trim() ??
      new URL(req.url).searchParams.get('orderNumber')?.trim();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Order reference is required.' },
        { status: 400 },
      );
    }

    const url = new URL(req.url);
    const sync = url.searchParams.get('sync') === '1';

    if (sync && isAlfaConfigured()) {
      const returnParams = new URLSearchParams();
      const rc = url.searchParams.get('rc') ?? url.searchParams.get('RC');
      if (rc) returnParams.set('RC', rc);

      const existing = await getPublicOrderSummary(orderNumber);
      if (!existing || existing.paymentStatus === 'pending') {
        const result = await processAlfalahReturn(orderNumber, returnParams);
        if (result.status === 'failed') {
          return NextResponse.json(
            {
              success: true,
              data: {
                orderId: orderNumber,
                paymentStatus: 'failed',
                failedReason: 'Payment was not completed.',
              },
            },
            { headers: { 'Cache-Control': 'no-store, private' } },
          );
        }
      }
    }

    const order = await getPublicOrderSummary(orderNumber);
    if (!order) {
      const rc = url.searchParams.get('rc') ?? url.searchParams.get('RC');
      const status = url.searchParams.get('status');
      if (status === 'failed' || (rc && rc !== '00')) {
        return NextResponse.json(
          {
            success: true,
            data: {
              orderId: orderNumber,
              paymentStatus: 'failed',
              failedReason: 'Payment was not completed.',
            },
          },
          { headers: { 'Cache-Control': 'no-store, private' } },
        );
      }

      return NextResponse.json(
        { success: false, message: 'Order not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: order },
      { headers: { 'Cache-Control': 'no-store, private' } },
    );
  } catch (err) {
    console.error('[GET /api/payment/status]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to load order status.' },
      { status: 500 },
    );
  }
}
