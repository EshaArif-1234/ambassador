import { NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import GalleryReview from '@/backend/models/GalleryReview.model';

/** Public GET — active gallery testimonials for the storefront */
export async function GET() {
  try {
    await connectDB();
    const items = await GalleryReview.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .select('name role review videoUrl')
      .lean();

    const data = items.map((d) => ({
      _id: String(d._id),
      name: d.name,
      role: d.role,
      review: d.review ?? '',
      videoUrl: d.videoUrl ?? '',
    }));

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/gallery-reviews]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
