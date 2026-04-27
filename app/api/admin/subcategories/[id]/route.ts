import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** PATCH /api/admin/subcategories/[id] — update title, image, categoryIds, or status */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    await migrateLegacySubcategoryParents(SubCategory.collection);
    const { id } = await params;
    const body = await req.json();
    const { title, image, imagePublicId, status, metaTitle } = body;

    const sub = await SubCategory.findById(id);
    if (!sub) {
      return NextResponse.json({ success: false, message: 'Subcategory not found.' }, { status: 404 });
    }

    if (title            !== undefined) sub.title            = title.trim();
    if (status           !== undefined) sub.status           = status;
    if (metaTitle !== undefined) sub.metaTitle = metaTitle?.trim() ?? '';

    if (body.categoryIds !== undefined || body.categoryId !== undefined) {
      const parentIds = resolveParentCategoryIds(body);
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
      sub.categoryIds = parentIds.map((cid) => new Types.ObjectId(cid));
    }

    // Replace image and delete old one from Cloudinary
    if (image !== undefined && image !== sub.image) {
      if (sub.imagePublicId) {
        try { await cloudinary.uploader.destroy(sub.imagePublicId); } catch { /* ignore */ }
      }
      sub.image         = image;
      sub.imagePublicId = imagePublicId ?? '';
    }

    await sub.save();
    const populated = await sub.populate('categoryIds', 'title');

    return NextResponse.json(
      { success: true, message: 'Subcategory updated.', data: populated },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/admin/subcategories/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** DELETE /api/admin/subcategories/[id] — delete subcategory */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;

    const sub = await SubCategory.findById(id);
    if (!sub) {
      return NextResponse.json({ success: false, message: 'Subcategory not found.' }, { status: 404 });
    }

    if (sub.imagePublicId) {
      try { await cloudinary.uploader.destroy(sub.imagePublicId); } catch { /* ignore */ }
    }

    await SubCategory.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Subcategory deleted.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/subcategories/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
