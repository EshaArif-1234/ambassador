import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';
import SubCategory from '@/backend/models/SubCategory.model';
import { migrateLegacySubcategoryParents } from '@/backend/lib/migrateSubCategoryParents';
import { requireAdmin } from '@/backend/lib/adminAuth';

function resolveParentCategoryIds(body: {
  categoryIds?: unknown;
  categoryId?: unknown;
}): string[] | null {
  if (Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
    const ids = [...new Set(body.categoryIds.map(String).filter(Boolean))];
    return ids.length ? ids : null;
  }
  if (body.categoryId != null && String(body.categoryId).trim() !== '') {
    return [String(body.categoryId)];
  }
  return null;
}

/** GET /api/admin/subcategories — list all subcategories, optionally filtered */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    await migrateLegacySubcategoryParents(SubCategory.collection);

    const { searchParams } = new URL(req.url);
    const search     = searchParams.get('search')     ?? '';
    const status     = searchParams.get('status')     ?? 'all';
    const categoryId = searchParams.get('categoryId') ?? '';

    const filter: Record<string, unknown> = {};
    if (search)     filter.title      = { $regex: search, $options: 'i' };
    if (status !== 'all') filter.status = status;
    if (categoryId) {
      filter.$or = [{ categoryIds: categoryId }, { categoryId }];
    }

    const subcategories = await SubCategory.find(filter)
      .populate('categoryIds', 'title')
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
    await migrateLegacySubcategoryParents(SubCategory.collection);
    const body = await req.json();
    const { title, image, imagePublicId, status, metaTitle } = body;
    const parentIds = resolveParentCategoryIds(body);

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Subcategory title is required.' },
        { status: 400 }
      );
    }

    if (!parentIds) {
      return NextResponse.json(
        { success: false, message: 'At least one parent category is required.' },
        { status: 400 }
      );
    }

    const parents = await Category.find({ _id: { $in: parentIds } }).select('_id').lean();
    if (parents.length !== parentIds.length) {
      return NextResponse.json(
        { success: false, message: 'One or more parent categories were not found.' },
        { status: 404 }
      );
    }

    const subcategory = await SubCategory.create({
      title:           title.trim(),
      image:           image           ?? '',
      imagePublicId:   imagePublicId   ?? '',
      categoryIds:     parentIds,
      status:          status          ?? 'active',
      metaTitle: metaTitle?.trim() ?? '',
    });

    const populated = await subcategory.populate('categoryIds', 'title');

    return NextResponse.json(
      { success: true, message: 'Subcategory created successfully.', data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/admin/subcategories]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
