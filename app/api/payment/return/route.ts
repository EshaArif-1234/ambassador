import { NextRequest, NextResponse } from 'next/server';
import {
  extractOrderRefFromAlfalahReturn,
  extractOrderRefFromCallback,
  parseAlfalahCallbackBody,
  resolveAlfalahReturnUrl,
} from '@/lib/alfaPayment';
import { processAlfalahReturn } from '@/lib/processAlfalahPayment';

function resolveOrderRef(req: NextRequest, body: Record<string, string>): string | null {
  return (
    extractOrderRefFromAlfalahReturn(req.nextUrl.searchParams) ??
    extractOrderRefFromCallback(body)
  );
}

function redirectToSuccess(req: NextRequest, orderRef: string, status: string) {
  const url = new URL(resolveAlfalahReturnUrl(req));
  url.searchParams.set('order', orderRef);
  url.searchParams.set('status', status);
  return NextResponse.redirect(url.toString(), 303);
}

function mergeReturnParams(req: NextRequest, body: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams(req.nextUrl.searchParams);
  for (const [key, value] of Object.entries(body)) {
    if (value && !params.has(key)) params.set(key, value);
  }
  return params;
}

function redirectToSuccessPending(req: NextRequest) {
  const url = new URL(resolveAlfalahReturnUrl(req));
  url.searchParams.set('status', 'pending');
  return NextResponse.redirect(url.toString(), 303);
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/payment/return — internal handler for Alfalah Return URL POST.
 * Middleware rewrites POST /order-success → here (Return URL stays /order-success in APG portal).
 */
export async function GET(req: NextRequest) {
  try {
    const orderRef = extractOrderRefFromAlfalahReturn(req.nextUrl.searchParams);
    if (!orderRef) {
      return redirectToSuccessPending(req);
    }

    const result = await processAlfalahReturn(orderRef, req.nextUrl.searchParams);
    return redirectToSuccess(req, orderRef, result.status);
  } catch (err) {
    console.error('[GET /api/payment/return]', err);
    return redirectToSuccessPending(req);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseAlfalahCallbackBody(req);
    const orderRef = resolveOrderRef(req, body);

    if (!orderRef) {
      return redirectToSuccessPending(req);
    }

    const result = await processAlfalahReturn(orderRef, mergeReturnParams(req, body));
    return redirectToSuccess(req, orderRef, result.status);
  } catch (err) {
    console.error('[POST /api/payment/return]', err);
    return redirectToSuccessPending(req);
  }
}
