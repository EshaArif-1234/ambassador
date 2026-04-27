import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Review from '@/backend/models/Review.model';
import { requireAdmin } from '@/backend/lib/adminAuth';

/** PATCH /api/admin/reviews/[id] — update status or fields */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id }   = await params;
    const { status, reviewerName, reviewerEmail, rating, comment } = await req.json();

    const review = await Review.findById(id);
    if (!review) return NextResponse.json({ success: false, message: 'Review not found.' }, { status: 404 });

    if (status        !== undefined) review.status        = status;
    if (reviewerName  !== undefined) review.reviewerName  = reviewerName.trim();
    if (reviewerEmail !== undefined) review.reviewerEmail = reviewerEmail.trim().toLowerCase();
    if (rating        !== undefined) review.rating        = Number(rating);
    if (comment       !== undefined) review.comment       = comment.trim();

    await review.save();
    const populated = await review.populate('productId', 'name images slug');

    return NextResponse.json({ success: true, message: 'Review updated.', data: populated }, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/admin/reviews/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** DELETE /api/admin/reviews/[id] */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return NextResponse.json({ success: false, message: 'Review not found.' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Review deleted.' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/admin/reviews/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
