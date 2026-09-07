import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/backend/lib/adminAuth';
import { isMnpConfigured, mnpGetLocations, MnpCourierError } from '@/lib/mnpCourier';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/shipping/mnp/locations — pickup locations from M&P portal. */
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

    const locations = await mnpGetLocations();
    return NextResponse.json({ success: true, data: locations, total: locations.length });
  } catch (err) {
    console.error('[GET /api/shipping/mnp/locations]', err);
    const message = err instanceof MnpCourierError ? err.message : 'Failed to load M&P locations.';
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
