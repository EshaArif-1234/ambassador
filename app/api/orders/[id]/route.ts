import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import User from '@/backend/models/User.model';
import { verifyToken, extractToken } from '@/utils/jwt.util';
import { enrichOrderItemsList } from '@/utils/orderItems.util';
import type { IOrderItem } from '@/backend/models/Order.model';

export const dynamic = 'force-dynamic';

/** GET /api/orders/[id] — single order for the authenticated owner */
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
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 401 });
    }

    const order = await Order.findById(id).lean();
    if (!order || order.customerEmail !== user.email) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const items = Array.isArray(order.items) ? (order.items as IOrderItem[]) : [];
    order.items = await enrichOrderItemsList(items);

    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to fetch order.' }, { status: 500 });
  }
}
