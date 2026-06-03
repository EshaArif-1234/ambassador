import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import { enrichOrderItemsList } from '@/utils/orderItems.util';
import { orderBelongsToUser, requireAuthUser } from '@/utils/authSession.util';
import type { IOrderItem } from '@/backend/models/Order.model';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    const auth = await requireAuthUser(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    await connectDB();

    const order = await Order.findById(id).lean();
    if (!order || !orderBelongsToUser(order, auth.user)) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const items = Array.isArray(order.items) ? (order.items as IOrderItem[]) : [];
    try {
      order.items = await enrichOrderItemsList(items);
    } catch (err) {
      console.error('[GET /api/orders/[id]] enrich failed:', err);
      order.items = items;
    }

    return NextResponse.json(
      { success: true, data: order },
      { headers: { 'Cache-Control': 'no-store, private' } }
    );
  } catch (err) {
    console.error('[GET /api/orders/[id]]', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch order.' }, { status: 500 });
  }
}
