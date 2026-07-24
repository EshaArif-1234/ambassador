import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/backend/config/db';
import { requireAdmin } from '@/backend/lib/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function loadSparePartModel() {
  const { default: SparePart } = await import('@/backend/models/SparePart.model');
  return SparePart;
}

async function destroyCloudinaryAsset(publicId: string) {
  if (!publicId) return;
  try {
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('[admin/spareparts] Cloudinary destroy failed:', publicId, err);
  }
}

/** GET /api/admin/spareparts/[id] */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const SparePart = await loadSparePartModel();
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID.' }, { status: 400 });
    }
    const row = await SparePart.findById(id).lean();
    if (!row) {
      return NextResponse.json({ success: false, message: 'Spare part not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('[GET /api/admin/spareparts/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** PATCH /api/admin/spareparts/[id] */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const SparePart = await loadSparePartModel();
    const { parseSparePartPrice } = await import('@/backend/lib/adminSpareParts');
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
    if (body.description !== undefined) sparePart.description = String(body.description).trim();

    if (body.images !== undefined) {
      const images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];
      const imagePublicIds = Array.isArray(body.imagePublicIds) ? body.imagePublicIds.filter(Boolean) : [];
      if (!images.length) {
        return NextResponse.json({ success: false, message: 'Image is required.' }, { status: 400 });
      }
      const oldIds = sparePart.imagePublicIds ?? [];
      const removed = oldIds.filter((pid) => pid && !imagePublicIds.includes(pid));
      await Promise.allSettled(removed.map((pid) => destroyCloudinaryAsset(pid)));
      sparePart.images = images;
      sparePart.imagePublicIds = imagePublicIds;
    }

    await sparePart.save();

    const populated = await SparePart.findById(sparePart._id).lean();

    return NextResponse.json({ success: true, message: 'Spare part updated.', data: populated });
  } catch (error) {
    console.error('[PATCH /api/admin/spareparts/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** DELETE /api/admin/spareparts/[id] */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const SparePart = await loadSparePartModel();
    const { destroyProductMedia } = await import('@/backend/lib/destroyProductMedia');
    const { id } = await params;
    const sparePart = await SparePart.findById(id);
    if (!sparePart) {
      return NextResponse.json({ success: false, message: 'Spare part not found.' }, { status: 404 });
    }

    const imageIds = (sparePart.imagePublicIds ?? []).filter(Boolean);
    await Promise.allSettled(imageIds.map((pid) => destroyCloudinaryAsset(pid)));

    await SparePart.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Spare part deleted.' });
  } catch (error) {
    console.error('[DELETE /api/admin/spareparts/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
