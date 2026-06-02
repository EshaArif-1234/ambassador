import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import User from '@/backend/models/User.model';
import Review from '@/backend/models/Review.model';
import { verifyToken, extractToken } from '@/utils/jwt.util';

export const dynamic = 'force-dynamic';

/** GET /api/orders/[id]/review-status — per-line review state for delivered orders */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
    }
    const decoded = verifyToken(token);

    await connectDB();

    const user = await User.findById(decoded.id).select('email').lean();
    if (!user?.email) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 401 });
    }

    const order = await Order.findById(id).select('customerEmail status items.productId').lean();
    if (!order || order.customerEmail !== user.email) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const canReview = order.status === 'delivered';
    const productIds = [
      ...new Set(
        (order.items ?? [])
          .map((it) => (it as { productId?: string }).productId)
          .filter((pid): pid is string => Boolean(pid && mongoose.Types.ObjectId.isValid(pid)))
      ),
    ];

    if (!canReview || !productIds.length) {
      return NextResponse.json({
        success: true,
        data: { canReview: false, items: {} as Record<string, { hasReview: boolean; reviewId?: string }> },
      });
    }

    const reviews = await Review.find({
      reviewerEmail: user.email,
      productId: { $in: productIds },
    })
      .select('productId')
      .lean();

    const reviewByProduct: Record<string, { hasReview: boolean; reviewId?: string }> = {};
    for (const pid of productIds) {
      const hit = reviews.find((r) => String(r.productId) === pid);
      reviewByProduct[pid] = hit
        ? { hasReview: true, reviewId: String(hit._id) }
        : { hasReview: false };
    }

    return NextResponse.json({
      success: true,
      data: { canReview: true, items: reviewByProduct },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to load review status.' }, { status: 500 });
  }
}
