import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';
import SubCategory from '@/backend/models/SubCategory.model';
import { migrateLegacySubcategoryParents } from '@/backend/lib/migrateSubCategoryParents';
import { requireAdmin } from '@/backend/lib/adminAuth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** PATCH /api/admin/categories/[id] — update title, image, or status */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    const { title, image, imagePublicId, status, metaTitle } = await req.json();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
    }

    if (title !== undefined) {
      const duplicate = await Category.findOne({
        _id: { $ne: id },
        title: { $regex: `^${title.trim()}$`, $options: 'i' },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: 'Another category with this title already exists.' },
          { status: 409 }
        );
      }
      category.title = title.trim();
    }

    // If a new image is uploaded, delete the old one from Cloudinary
    if (image !== undefined && image !== category.image) {
      if (category.imagePublicId) {
        try { await cloudinary.uploader.destroy(category.imagePublicId); } catch { /* ignore */ }
      }
      category.image         = image;
      category.imagePublicId = imagePublicId ?? '';
    }

    if (status !== undefined) {
      const s = String(status).toLowerCase();
      category.status = s === 'inactive' ? 'inactive' : 'active';
    }
    if (metaTitle !== undefined) category.metaTitle = metaTitle?.trim() ?? '';

    await category.save();

    return NextResponse.json(
      { success: true, message: 'Category updated.', data: category },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/admin/categories/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** DELETE /api/admin/categories/[id] — delete category; unlink or remove subcategories that referenced it */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
    }

    // Delete the category image from Cloudinary
    if (category.imagePublicId) {
      try { await cloudinary.uploader.destroy(category.imagePublicId); } catch { /* ignore */ }
    }

    const subs = await SubCategory.find({ categoryIds: id });
    for (const sub of subs) {
      const nextIds = sub.categoryIds.filter((cid) => String(cid) !== String(id));
      if (nextIds.length === 0) {
        if (sub.imagePublicId) {
          try {
            await cloudinary.uploader.destroy(sub.imagePublicId);
          } catch {
            /* ignore */
          }
        }
        await SubCategory.findByIdAndDelete(sub._id);
      } else {
        sub.categoryIds = nextIds;
        await sub.save();
      }
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Category deleted. Shared subcategories were unlinked from it.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/categories/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
