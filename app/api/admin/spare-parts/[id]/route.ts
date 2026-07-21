import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/backend/config/db';
import SparePart from '@/backend/models/SparePart.model';
import { destroyProductMedia } from '@/backend/lib/destroyProductMedia';
import { parseSparePartPrice, validateSparePartLinks } from '@/backend/lib/adminSpareParts';
import { requireAdmin } from '@/backend/lib/adminAuth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** GET /api/admin/spare-parts/[id] */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID.' }, { status: 400 });
    }
    const row = await SparePart.findById(id)
      .populate('linkedCategoryIds', 'title slug')
      .populate('linkedProductIds', 'name slug')
      .lean();
    if (!row) {
      return NextResponse.json({ success: false, message: 'Spare part not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('[GET /api/admin/spare-parts/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** PATCH /api/admin/spare-parts/[id] */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    const sparePart = await SparePart.findById(id);
    if (!sparePart) {
      return NextResponse.json({ success: false, message: 'Spare part not found.' }, { status: 404 });
    }

    const body = await req.json();

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ success: false, message: 'Title is required.' }, { status: 400 });
      }
      sparePart.name = name;
    }

    if (body.originalPrice !== undefined || body.price !== undefined) {
      const priceCheck = parseSparePartPrice({
        price: body.price ?? sparePart.price,
        originalPrice: body.originalPrice ?? body.price ?? sparePart.originalPrice,
      });
      if (!priceCheck.ok) {
        return NextResponse.json({ success: false, message: priceCheck.message }, { status: 400 });
      }
      sparePart.originalPrice = priceCheck.originalPrice;
      sparePart.price = priceCheck.price;
    }

    if (body.stock !== undefined) sparePart.stock = Math.max(0, Number(body.stock));
    if (body.status !== undefined) sparePart.status = body.status === 'inactive' ? 'inactive' : 'active';

    if (body.images !== undefined) {
      const images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];
      const imagePublicIds = Array.isArray(body.imagePublicIds) ? body.imagePublicIds.filter(Boolean) : [];
      if (!images.length) {
        return NextResponse.json({ success: false, message: 'Image is required.' }, { status: 400 });
      }
      const oldIds = sparePart.imagePublicIds ?? [];
      const removed = oldIds.filter((pid) => pid && !imagePublicIds.includes(pid));
      await Promise.allSettled(removed.map((pid) => cloudinary.uploader.destroy(pid)));
      sparePart.images = images;
      sparePart.imagePublicIds = imagePublicIds;
    }

    if (body.linkedCategoryIds !== undefined || body.linkedProductIds !== undefined) {
      const linkCheck = await validateSparePartLinks(
        body.linkedCategoryIds ?? sparePart.linkedCategoryIds,
        body.linkedProductIds ?? sparePart.linkedProductIds,
      );
      if (!linkCheck.ok) {
        return NextResponse.json({ success: false, message: linkCheck.message }, { status: 400 });
      }
      sparePart.linkedCategoryIds = linkCheck.linkedCategoryIds;
      sparePart.linkedProductIds = linkCheck.linkedProductIds;
    }

    await sparePart.save();

    const populated = await SparePart.findById(sparePart._id)
      .populate('linkedCategoryIds', 'title slug')
      .populate('linkedProductIds', 'name slug')
      .lean();

    return NextResponse.json({ success: true, message: 'Spare part updated.', data: populated });
  } catch (error) {
    console.error('[PATCH /api/admin/spare-parts/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** DELETE /api/admin/spare-parts/[id] */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    const sparePart = await SparePart.findById(id);
    if (!sparePart) {
      return NextResponse.json({ success: false, message: 'Spare part not found.' }, { status: 404 });
    }
    await destroyProductMedia(sparePart);
    await SparePart.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Spare part deleted.' });
  } catch (error) {
    console.error('[DELETE /api/admin/spare-parts/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
