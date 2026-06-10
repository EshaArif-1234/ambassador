import { NextResponse } from 'next/server';
import { PAKISTAN_CITIES, PAKISTAN_CITIES_BY_PROVINCE } from '@/data/pakistanCities';

export const dynamic = 'force-dynamic';

/** GET /api/cities — all cities of Pakistan (optional ?grouped=1 for province map) */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const grouped = searchParams.get('grouped') === '1';

    return NextResponse.json(
      {
        success: true,
        data: grouped ? PAKISTAN_CITIES_BY_PROVINCE : PAKISTAN_CITIES,
        total: PAKISTAN_CITIES.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/cities]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
