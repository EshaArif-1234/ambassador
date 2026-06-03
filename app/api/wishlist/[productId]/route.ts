import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { requireAuthUser } from '@/utils/authSession.util';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    const auth = await requireAuthUser(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    await connectDB();

    const user = await User.findById(auth.userId).select('wishlist');
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
