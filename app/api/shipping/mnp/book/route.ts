import { NextRequest, NextResponse } from 'next/server';
import { requireFullAdmin } from '@/backend/lib/adminAuth';
import { bookMnpShipmentForOrder, MnpCourierError, ShippingQuoteError } from '@/lib/mnpBookOrder';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** POST /api/shipping/mnp/book — book M&P shipment for a paid order. */
export async function POST(req: NextRequest) {
  const authError = await requireFullAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'orderId is required.' }, { status: 400 });
    }

    const result = await bookMnpShipmentForOrder(orderId, { fallbackKgPerItem: 1 });
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[POST /api/shipping/mnp/book]', err);
    if (err instanceof MnpCourierError || err instanceof ShippingQuoteError) {
      return NextResponse.json(
        {
          success: false,
          code: err instanceof ShippingQuoteError ? err.code : 'MNP_BOOKING_FAILED',
          message: err.message,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: 'M&P booking failed.' },
      { status: 500 },
    );
  }
}
