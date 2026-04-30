import { NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';

/** Fresh on every request — storefront must not serve stale lists after admin toggles status */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** GET /api/categories — public list of categories that are not inactive (storefront) */
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
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
