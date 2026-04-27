import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';
import SubCategory from '@/backend/models/SubCategory.model';
import { migrateLegacySubcategoryParents } from '@/backend/lib/migrateSubCategoryParents';
import { requireAdmin } from '@/backend/lib/adminAuth';

/** GET /api/admin/categories — list all categories with subcategory count */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    await migrateLegacySubcategoryParents(SubCategory.collection);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const status = searchParams.get('status') ?? 'all';

    const filter: Record<string, unknown> = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (status !== 'all') filter.status = status;

    const categories = await Category.find(filter).sort({ createdAt: -1 }).lean();

    // Attach subcategory count for each category
    const categoryIds = categories.map((c) => c._id);
    const counts = await SubCategory.aggregate([
      { $match: { categoryIds: { $in: categoryIds } } },
      { $unwind: '$categoryIds' },
      { $match: { categoryIds: { $in: categoryIds } } },
      { $group: { _id: '$categoryIds', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const result = categories.map((cat) => ({
      ...cat,
      subcategoryCount: countMap.get(String(cat._id)) ?? 0,
    }));

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/categories]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** POST /api/admin/categories — create a new category */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { title, image, imagePublicId, status, metaTitle } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category title is required.' },
        { status: 400 }
      );
    }

    const existing = await Category.findOne({ title: { $regex: `^${title.trim()}$`, $options: 'i' } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A category with this title already exists.' },
        { status: 409 }
      );
    }

    const category = await Category.create({
      title: title.trim(),
      image:           image           ?? '',
      imagePublicId:   imagePublicId   ?? '',
      status:          status          ?? 'active',
      metaTitle: metaTitle?.trim() ?? '',
    });

    return NextResponse.json(
      { success: true, message: 'Category created successfully.', data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/admin/categories]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
