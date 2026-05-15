import { NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';

export const dynamic = 'force-dynamic';

/** GET /api/categories — public list of active categories */
export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({
      $nor: [{ status: { $regex: /^inactive$/i } }],
    })
      .select('title slug image')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, data: categories },
      {
        status: 200,
        headers: {
          // Categories change rarely — cache for 60 s, serve stale for up to 120 s
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
