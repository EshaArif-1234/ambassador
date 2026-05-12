import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Product from '@/backend/models/Product.model';
import Review from '@/backend/models/Review.model';
import { sendReviewThankYouEmail } from '@/utils/email.util';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type StarKey = 1 | 2 | 3 | 4 | 5;

interface RatingSummaryPayload {
  averageRating: number;
  reviewCount: number;
  byStar: Record<StarKey, number>;
}

/** GET /api/products/[id]/reviews — approved reviews aggregate (summary only) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    await connectDB();

    const rows = await Review.aggregate<{
      stat: { avg: number | null; total: number } | null;
      byStar: { _id: number; count: number }[];
    }>([
      { $match: { productId: new mongoose.Types.ObjectId(id), status: 'approved' } },
      {
        $facet: {
          overall: [
            { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } },
          ],
          byStar: [{ $group: { _id: '$rating', count: { $sum: 1 } } }],
        },
      },
      {
        $project: {
          stat: { $arrayElemAt: ['$overall', 0] },
          byStar: '$byStar',
        },
      },
    ]);

    const row = rows[0];
    const stat = row?.stat;
    const rawBy = (row?.byStar ?? []) as { _id: number; count: number }[];
    const byStar: Record<StarKey, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of rawBy) {
      const star = Math.min(5, Math.max(1, Math.round(Number(row._id)))) as StarKey;
      byStar[star] = (byStar[star] ?? 0) + row.count;
    }

    const total = Number(stat?.total ?? 0);
    const avgRaw = stat?.avg != null ? Number(stat.avg) : 0;
    const averageRating = total > 0 ? +avgRaw.toFixed(1) : 0;

    const data: RatingSummaryPayload = {
      averageRating,
      reviewCount: total,
      byStar,
    };

    return NextResponse.json(
      { success: true, data },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[GET /api/products/[id]/reviews]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

const REVIEW_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /api/products/[id]/reviews — customer submits review (pending moderation) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 });
    }

    const reviewerName =
      typeof body.reviewerName === 'string' ? body.reviewerName.trim() : '';
    const reviewerEmailRaw =
      typeof body.reviewerEmail === 'string' ? body.reviewerEmail.trim().toLowerCase() : '';
    const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 1000) : '';
    const ratingNum = Number(body.rating);

    if (!reviewerName) {
      return NextResponse.json({ success: false, message: 'Name is required.' }, { status: 400 });
    }
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5.' },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findOne({ _id: id, status: 'active' }).select('name').lean();
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const review = await Review.create({
      productId: id,
      reviewerName,
      reviewerEmail: reviewerEmailRaw,
      rating: ratingNum,
      comment,
      status: 'pending',
    });

    if (reviewerEmailRaw && REVIEW_EMAIL_RE.test(reviewerEmailRaw)) {
      await sendReviewThankYouEmail(reviewerEmailRaw, {
        reviewerName,
        productName: String(product.name ?? ''),
        rating: ratingNum,
        moderationStatus: 'pending',
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thanks! Your review was submitted and will appear after a quick check.',
        data: { _id: String(review._id) },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/products/[id]/reviews]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
