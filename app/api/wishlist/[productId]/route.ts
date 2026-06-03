import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { verifyToken, extractToken } from '@/utils/jwt.util';

export const dynamic = 'force-dynamic';

/** DELETE /api/wishlist/[productId] — remove product from wishlist */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, message: 'Invalid product.' }, { status: 400 });
    }

    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
    }
    const decoded = verifyToken(token);

    await connectDB();

    const user = await User.findById(decoded.id).select('wishlist');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 401 });
    }

    user.wishlist = user.wishlist.filter((id) => String(id) !== productId);
    await user.save();

    return NextResponse.json({
      success: true,
      data: { productIds: user.wishlist.map((id) => String(id)) },
    });
  } catch (err) {
    console.error('[DELETE /api/wishlist/[productId]]', err);
    return NextResponse.json({ success: false, message: 'Failed to remove from wishlist.' }, { status: 500 });
  }
}
