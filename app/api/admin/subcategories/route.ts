import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';
import SubCategory from '@/backend/models/SubCategory.model';
import { requireAdmin } from '@/backend/lib/adminAuth';

/** GET /api/admin/subcategories — list all subcategories, optionally filtered */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search     = searchParams.get('search')     ?? '';
    const status     = searchParams.get('status')     ?? 'all';
    const categoryId = searchParams.get('categoryId') ?? '';

    const filter: Record<string, unknown> = {};
    if (search)     filter.title      = { $regex: search, $options: 'i' };
    if (status !== 'all') filter.status = status;
    if (categoryId) filter.categoryId = categoryId;

    const subcategories = await SubCategory.find(filter)
      .populate('categoryId', 'title')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: subcategories }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/subcategories]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** POST /api/admin/subcategories — create a new subcategory */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { title, image, imagePublicId, categoryId, status } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Subcategory title is required.' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'Parent category is required.' },
        { status: 400 }
      );
    }

    const parentExists = await Category.findById(categoryId);
    if (!parentExists) {
      return NextResponse.json(
        { success: false, message: 'Parent category not found.' },
        { status: 404 }
      );
    }

    const subcategory = await SubCategory.create({
      title:         title.trim(),
      image:         image         ?? '',
      imagePublicId: imagePublicId ?? '',
      categoryId,
      status:        status        ?? 'active',
    });

    const populated = await subcategory.populate('categoryId', 'title');

    return NextResponse.json(
      { success: true, message: 'Subcategory created successfully.', data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/admin/subcategories]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
