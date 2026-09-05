import { NextRequest, NextResponse } from 'next/server';
import {
  extractIpnUrlFromListener,
  extractOrderRefFromAlfalahReturn,
  extractOrderRefFromCallback,
  parseAlfalahCallbackBody,
} from '@/lib/alfaPayment';
import { processAlfalahFromIpnUrl, processAlfalahOrder } from '@/lib/processAlfalahPayment';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /payments — Alfalah Listener URL (server IPN callback).
 * Registered in APG sandbox as: https://www.ambassador.pk/payments
 */
export async function POST(req: NextRequest) {
  try {
    const body = await parseAlfalahCallbackBody(req);
    const ipnUrl = extractIpnUrlFromListener(body, req.nextUrl.searchParams);

    if (ipnUrl) {
      const result = await processAlfalahFromIpnUrl(ipnUrl);
      console.info('[POST /payments] listener IPN processed', {
        orderRef: result.orderRef,
        status: result.status,
      });
      return new NextResponse('OK', { status: 200 });
    }

    const orderRef =
      extractOrderRefFromCallback(body) ??
      extractOrderRefFromAlfalahReturn(req.nextUrl.searchParams);

    if (!orderRef) {
      console.warn('[POST /payments] listener received callback without order reference', body);
      return new NextResponse('OK', { status: 200 });
    }

    const result = await processAlfalahOrder(orderRef);
    console.info('[POST /payments] listener order processed', {
      orderRef: result.orderRef,
      status: result.status,
    });
    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('[POST /payments]', err);
    return new NextResponse('ERROR', { status: 500 });
  }
}

/** Reject browser GET on webhook URL. */
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Alfalah payment listener endpoint. POST only.' },
    { status: 405 },
  );
}
