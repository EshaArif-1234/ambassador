import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';
import SubCategory from '@/backend/models/SubCategory.model';
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
    const { title, image, imagePublicId, status } = await req.json();

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

    if (status !== undefined) category.status = status;

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

/** DELETE /api/admin/categories/[id] — delete category and all its subcategories */
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

    // Delete all subcategory images from Cloudinary and then the subcategories themselves
    const subs = await SubCategory.find({ categoryId: id });
    await Promise.allSettled(
      subs
        .filter((s) => s.imagePublicId)
        .map((s) => cloudinary.uploader.destroy(s.imagePublicId))
    );
    await SubCategory.deleteMany({ categoryId: id });

    await Category.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Category and its subcategories deleted.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/categories/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
