import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Review from '@/backend/models/Review.model';
import Product from '@/backend/models/Product.model';
import { requireAdmin } from '@/backend/lib/adminAuth';

/** GET /api/admin/reviews — list all reviews with optional filters */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search    = searchParams.get('search')    ?? '';
    const productId = searchParams.get('productId') ?? '';
    const status    = searchParams.get('status')    ?? 'all';
    const rating    = searchParams.get('rating')    ?? 'all';

    const filter: Record<string, unknown> = {};
    if (productId)       filter.productId = productId;
    if (status !== 'all') filter.status   = status;
    if (rating !== 'all') filter.rating   = Number(rating);
    if (search) {
      filter.$or = [
        { reviewerName: { $regex: search, $options: 'i' } },
        { comment:      { $regex: search, $options: 'i' } },
      ];
    }

    const reviews = await Review.find(filter)
      .populate('productId', 'name images slug')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: reviews }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/reviews]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** POST /api/admin/reviews — create a review */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { productId, reviewerName, reviewerEmail, rating, comment, status } = await req.json();

    if (!productId)          return NextResponse.json({ success: false, message: 'Product is required.' },       { status: 400 });
    if (!reviewerName?.trim()) return NextResponse.json({ success: false, message: 'Reviewer name is required.' }, { status: 400 });
    if (!rating || rating < 1 || rating > 5)
      return NextResponse.json({ success: false, message: 'Rating must be between 1 and 5.' }, { status: 400 });

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });

    const review = await Review.create({
      productId,
      reviewerName: reviewerName.trim(),
      reviewerEmail: reviewerEmail?.trim().toLowerCase() ?? '',
      rating:  Number(rating),
      comment: comment?.trim() ?? '',
      status:  status ?? 'approved',
    });

    const populated = await review.populate('productId', 'name images slug');

    return NextResponse.json(
      { success: true, message: 'Review added successfully.', data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/admin/reviews]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
