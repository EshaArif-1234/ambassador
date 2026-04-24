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

/** PATCH /api/admin/subcategories/[id] — update title, image, categoryId, or status */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    const { title, image, imagePublicId, categoryId, status } = await req.json();

    const sub = await SubCategory.findById(id);
    if (!sub) {
      return NextResponse.json({ success: false, message: 'Subcategory not found.' }, { status: 404 });
    }

    if (title      !== undefined) sub.title  = title.trim();
    if (status     !== undefined) sub.status = status;

    if (categoryId !== undefined) {
      const parentExists = await Category.findById(categoryId);
      if (!parentExists) {
        return NextResponse.json(
          { success: false, message: 'Parent category not found.' },
          { status: 404 }
        );
      }
      sub.categoryId = categoryId;
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
    const populated = await sub.populate('categoryId', 'title');

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
