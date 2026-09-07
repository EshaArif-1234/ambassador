import { NextRequest, NextResponse } from 'next/server';
import {
  isMnpConfigured,
  mnpGetCitiesAllCached,
  MnpCourierError,
} from '@/lib/mnpCourier';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/shipping/mnp/cities — M&P Get_Cities_All (credentials stay server-side). */
export async function GET(req: NextRequest) {
  try {
    if (!isMnpConfigured()) {
      return NextResponse.json(
        {
          success: false,
          code: 'MNP_NOT_CONFIGURED',
          message:
            'M&P Courier is not configured. Add MNP_USERNAME, MNP_PASSWORD, and MNP_ACCOUNT_NO.',
        },
        { status: 503 },
      );
    }

    const forceRefresh = req.nextUrl.searchParams.get('refresh') === '1';
    const cities = await mnpGetCitiesAllCached(forceRefresh);

    return NextResponse.json(
      {
        success: true,
        source: 'mnp',
        data: cities,
        total: cities.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      },
    );
  } catch (err) {
    console.error('[GET /api/shipping/mnp/cities]', err);
    const message =
      err instanceof MnpCourierError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to load M&P cities.';
    const status = err instanceof MnpCourierError && err.statusCode ? err.statusCode : 502;
    return NextResponse.json({ success: false, message }, { status });
  }
}
