import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/backend/config/db';
import Product from '@/backend/models/Product.model';
import { requireAdmin } from '@/backend/lib/adminAuth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** PATCH /api/admin/products/[id] — update product or toggle status */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id }  = await params;
    const body    = await req.json();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const {
      name, category, subCategory,
      price, originalPrice, stock, status, about,
      images, imagePublicIds, videos, videoPublicIds,
      specifications, metaTitle, metaDescription,
    } = body;

    if (name             !== undefined) product.name            = name.trim();
    if (category         !== undefined) product.category        = category;
    if (subCategory      !== undefined) product.subCategory     = subCategory;
    if (price            !== undefined) product.price           = price === '' || price === null ? undefined : Number(price);
    if (originalPrice    !== undefined) product.originalPrice   = Number(originalPrice);
    if (stock            !== undefined) product.stock           = Number(stock);
    if (status           !== undefined) product.status          = status;
    if (about            !== undefined) product.about           = about.trim();
    if (specifications   !== undefined) product.specifications  = specifications;
    if (metaTitle        !== undefined) product.metaTitle       = metaTitle?.trim() ?? '';
    if (metaDescription  !== undefined) product.metaDescription = metaDescription?.trim() ?? '';

    // Replace images — delete removed ones from Cloudinary
    if (images !== undefined) {
      const oldIds: string[] = product.imagePublicIds ?? [];
      const newIds: string[] = imagePublicIds ?? [];
      const removed = oldIds.filter(pid => pid && !newIds.includes(pid));
      await Promise.allSettled(removed.map(pid => cloudinary.uploader.destroy(pid)));
      product.images         = images;
      product.imagePublicIds = newIds;
    }

    // Replace videos — delete removed ones from Cloudinary
    if (videos !== undefined) {
      const oldIds: string[] = product.videoPublicIds ?? [];
      const newIds: string[] = videoPublicIds ?? [];
      const removed = oldIds.filter(pid => pid && !newIds.includes(pid));
      await Promise.allSettled(removed.map(pid => cloudinary.uploader.destroy(pid, { resource_type: 'video' })));
      product.videos         = videos;
      product.videoPublicIds = newIds;
    }

    await product.save();
    const populated = await product.populate([
      { path: 'category',    select: 'title' },
      { path: 'subCategory', select: 'title' },
    ]);

    return NextResponse.json(
      { success: true, message: 'Product updated.', data: populated },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/admin/products/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** DELETE /api/admin/products/[id] — permanently delete a product */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    // Delete all product images and videos from Cloudinary
    const imageIds = (product.imagePublicIds ?? []).filter(Boolean);
    const videoIds = (product.videoPublicIds ?? []).filter(Boolean);
    await Promise.allSettled([
      ...imageIds.map(pid => cloudinary.uploader.destroy(pid)),
      ...videoIds.map(pid => cloudinary.uploader.destroy(pid, { resource_type: 'video' })),
    ]);

    await Product.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Product deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/products/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
