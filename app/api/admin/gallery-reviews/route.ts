import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import GalleryReview from '@/backend/models/GalleryReview.model';
import { requireAdmin } from '@/backend/lib/adminAuth';

/** GET /api/admin/gallery-reviews — list testimonials for gallery management */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() ?? '';

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { review: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await GalleryReview.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/gallery-reviews]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** POST /api/admin/gallery-reviews — create */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const role = typeof body.role === 'string' ? body.role.trim() : '';
    const review = typeof body.review === 'string' ? body.review.trim() : '';
    const videoUrl = typeof body.videoUrl === 'string' ? body.videoUrl.trim() : '';
    const status =
      body.status === 'inactive' ? 'inactive' : ('active' as const);

    if (!name) {
      return NextResponse.json({ success: false, message: 'Name is required.' }, { status: 400 });
    }
    if (!role) {
      return NextResponse.json({ success: false, message: 'Role is required.' }, { status: 400 });
    }
    if (!videoUrl) {
      return NextResponse.json(
        { success: false, message: 'Video URL is required (upload file or paste link).' },
        { status: 400 }
      );
    }

    const doc = await GalleryReview.create({
      name,
      role,
      review,
      videoUrl,
      status,
    });

    return NextResponse.json(
      { success: true, message: 'Gallery review created.', data: doc.toObject() },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/admin/gallery-reviews]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
