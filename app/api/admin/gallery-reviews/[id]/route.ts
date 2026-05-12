import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import GalleryReview from '@/backend/models/GalleryReview.model';
import { requireAdmin } from '@/backend/lib/adminAuth';
import mongoose from 'mongoose';

/** GET /api/admin/gallery-reviews/[id] */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid id.' }, { status: 400 });
    }

    const doc = await GalleryReview.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: doc }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/gallery-reviews/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** PATCH /api/admin/gallery-reviews/[id] */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid id.' }, { status: 400 });
    }

    const body = await req.json();
    const doc = await GalleryReview.findById(id);
    if (!doc) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ success: false, message: 'Name cannot be empty.' }, { status: 400 });
      }
      doc.name = name;
    }
    if (body.role !== undefined) {
      const role = String(body.role).trim();
      if (!role) {
        return NextResponse.json({ success: false, message: 'Role cannot be empty.' }, { status: 400 });
      }
      doc.role = role;
    }
    if (body.review !== undefined) {
      doc.review = String(body.review).trim();
    }
    if (body.videoUrl !== undefined) {
      const videoUrl = String(body.videoUrl).trim();
      if (!videoUrl) {
        return NextResponse.json({ success: false, message: 'Video URL cannot be empty.' }, { status: 400 });
      }
      doc.videoUrl = videoUrl;
    }
    if (body.status !== undefined) {
      doc.status = body.status === 'inactive' ? 'inactive' : 'active';
    }

    await doc.save();

    return NextResponse.json(
      { success: true, message: 'Gallery review updated.', data: doc.toObject() },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/admin/gallery-reviews/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** DELETE /api/admin/gallery-reviews/[id] */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid id.' }, { status: 400 });
    }

    const deleted = await GalleryReview.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Gallery review deleted.' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/admin/gallery-reviews/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
