import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import { requireAdmin } from '@/backend/lib/adminAuth';
import { getDateRangeBounds, type OrderDateRange } from '@/utils/orderDateRange.util';
import { isValidWorkflowTransition } from '@/utils/orderWorkflow.util';

/** GET /api/admin/orders — list all orders with optional filters */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const status = searchParams.get('status') ?? 'all';
    const paymentStatus = searchParams.get('paymentStatus') ?? 'all';
    const dateRange = searchParams.get('dateRange') ?? 'all';

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { paymentId: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { 'items.productName': { $regex: search, $options: 'i' } },
      ];
    }

    if (status !== 'all') filter.status = status;
    if (paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

    if (dateRange !== 'all') {
      const { from, to } = getDateRangeBounds(dateRange as OrderDateRange);
      if (from && to) {
        filter.createdAt = { $gte: from, $lte: to };
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: orders });
  } catch (err: any) {
    console.error('[GET /api/admin/orders]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}

/** PATCH /api/admin/orders — update order status or notes */
export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await req.json();
    const { id, status, paymentStatus, notes, failedReason, deliveryDate } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Order id is required.' }, { status: 400 });
    }

    const existing = await Order.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    if (status !== undefined && !isValidWorkflowTransition(existing.status, status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid status change. Orders must advance one step at a time.',
        },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = {};
    if (status !== undefined) update.status = status;
    if (paymentStatus !== undefined) update.paymentStatus = paymentStatus;
    if (notes !== undefined) update.notes = notes;
    if (failedReason !== undefined) update.failedReason = failedReason;
    if (deliveryDate !== undefined) update.deliveryDate = deliveryDate ? new Date(deliveryDate) : undefined;

    const order = await Order.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    console.error('[PATCH /api/admin/orders]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update order.' },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/orders — delete an order by id */
export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Order id is required.' }, { status: 400 });
    }

    const order = await Order.findByIdAndDelete(id).lean();
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted.' });
  } catch (err: any) {
    console.error('[DELETE /api/admin/orders]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to delete order.' },
      { status: 500 }
    );
  }
}
