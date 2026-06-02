import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Review from '@/backend/models/Review.model';
import Product from '@/backend/models/Product.model';
import User from '@/backend/models/User.model';
import { verifyToken, extractToken } from '@/utils/jwt.util';

export const dynamic = 'force-dynamic';

/** GET /api/reviews/my — returns all reviews submitted by the authenticated user */
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    await connectDB();

    const user = await User.findById(decoded.id).select('email').lean();
    if (!user || !user.email) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 401 });
    }

    const reviews = await Review.find({ reviewerEmail: user.email })
      .sort({ createdAt: -1 })
      .lean();

    // Attach product names in one batch query
    const productIds = [...new Set(reviews.map(r => String(r.productId)))];
    const products = await Product.find({ _id: { $in: productIds } })
      .select('name')
      .lean();
    const nameMap = Object.fromEntries(products.map(p => [String(p._id), p.name]));

    const data = reviews.map(r => ({
      ...r,
      productName: nameMap[String(r.productId)] ?? 'Product',
    }));

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to fetch reviews.' }, { status: 500 });
  }
}
