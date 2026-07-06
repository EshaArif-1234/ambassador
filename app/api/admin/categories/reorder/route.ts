import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';
import { requireAdmin } from '@/backend/lib/adminAuth';
import { ensureCategorySortOrders } from '@/backend/lib/categoryOrder';

/** PATCH /api/admin/categories/reorder — save drag-and-drop order */
export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    await ensureCategorySortOrders();

    const body = await req.json();
    const orderedIds = body?.orderedIds;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'orderedIds array is required.' },
        { status: 400 },
      );
    }

    const ids = orderedIds.map((id: unknown) => String(id).trim()).filter(Boolean);
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      return NextResponse.json(
        { success: false, message: 'Duplicate category ids in order list.' },
        { status: 400 },
      );
    }

    const existing = await Category.find({ _id: { $in: ids } }).select('_id').lean();
    if (existing.length !== ids.length) {
      return NextResponse.json(
        { success: false, message: 'One or more categories were not found.' },
        { status: 400 },
      );
    }

    await Promise.all(
      ids.map((id, index) => Category.updateOne({ _id: id }, { $set: { sortOrder: index + 1 } })),
    );

    return NextResponse.json(
      { success: true, message: 'Category order saved.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('[PATCH /api/admin/categories/reorder]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
