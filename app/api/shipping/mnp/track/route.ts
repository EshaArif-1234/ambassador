import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/backend/lib/adminAuth';
import { isMnpConfigured, mnpTrackConsignment, MnpCourierError } from '@/lib/mnpCourier';
import { syncMnpTrackingForOrder } from '@/lib/mnpSyncTracking';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/shipping/mnp/track?consignment=...&orderId=... — M&P CN tracking (read-only sync). */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    if (!isMnpConfigured()) {
      return NextResponse.json(
        { success: false, message: 'M&P Courier is not configured.' },
        { status: 503 },
      );
    }

    const { searchParams } = req.nextUrl;
    const consignmentParam = searchParams.get('consignment')?.trim() ?? '';
    const orderId = searchParams.get('orderId')?.trim() ?? '';

    if (orderId) {
      const { tracking } = await syncMnpTrackingForOrder(orderId);
      if (!tracking) {
        return NextResponse.json(
          { success: false, message: 'No M&P consignment found for this order.' },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: tracking });
    }

    if (consignmentParam) {
      const tracking = await mnpTrackConsignment(consignmentParam);
      return NextResponse.json({ success: true, data: tracking });
    }

    return NextResponse.json(
      { success: false, message: 'consignment or orderId is required.' },
      { status: 400 },
    );
  } catch (err) {
    console.error('[GET /api/shipping/mnp/track]', err);
    const message = err instanceof MnpCourierError ? err.message : 'M&P tracking failed.';
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
