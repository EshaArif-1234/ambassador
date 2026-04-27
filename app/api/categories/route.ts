import { NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';

/** GET /api/categories — public list of active categories (storefront) */
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ status: 'active' })
      .select('title slug image')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
