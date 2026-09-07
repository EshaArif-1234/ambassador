import { NextResponse } from 'next/server';
import { PAKISTAN_CITIES, PAKISTAN_CITIES_BY_PROVINCE } from '@/data/pakistanCities';
import { isMnpConfigured, mnpGetCitiesAllCached, MnpCourierError } from '@/lib/mnpCourier';

export const dynamic = 'force-dynamic';

/** GET /api/cities — M&P delivery cities when configured, else static Pakistan list. */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const grouped = searchParams.get('grouped') === '1';

    if (grouped) {
      return NextResponse.json(
        {
          success: true,
          source: 'static',
          data: PAKISTAN_CITIES_BY_PROVINCE,
          total: PAKISTAN_CITIES.length,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        },
      );
    }

    if (isMnpConfigured()) {
      try {
        const cities = await mnpGetCitiesAllCached();
        return NextResponse.json(
          {
            success: true,
            source: 'mnp',
            data: cities,
            total: cities.length,
          },
          {
            status: 200,
            headers: {
              'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
            },
          },
        );
      } catch (err) {
        console.error('[GET /api/cities] M&P fallback to static list:', err);
        if (!(err instanceof MnpCourierError)) throw err;
      }
    }

    return NextResponse.json(
      {
        success: true,
        source: 'static',
        data: PAKISTAN_CITIES,
        total: PAKISTAN_CITIES.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      },
    );
  } catch (error) {
    console.error('[GET /api/cities]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
