import { NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';
import { categoryListSort, ensureCategorySortOrders } from '@/backend/lib/categoryOrder';

export const dynamic = 'force-dynamic';

/** GET /api/categories — public list of active categories */
export async function GET() {
  try {
    await connectDB();
    await ensureCategorySortOrders();

    const categories = await Category.find({
      $nor: [{ status: { $regex: /^inactive$/i } }],
    })
      .select('title slug image sortOrder')
      .sort(categoryListSort)
      .lean();

    return NextResponse.json(
      { success: true, data: categories },
      {
        status: 200,
        headers: {
          // Order can change from admin drag-and-drop — do not cache stale lists
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
