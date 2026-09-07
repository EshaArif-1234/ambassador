import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import { isMnpConfigured, MnpCourierError } from '@/lib/mnpCourier';
import { syncMnpTrackingForOrder } from '@/lib/mnpSyncTracking';
import { orderBelongsToUser, requireAuthUser } from '@/utils/authSession.util';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/orders/[id]/mnp-tracking — live M&P status for the order owner. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const order = await Order.findById(id)
      .select(
        'userId customerEmail mnpConsignmentNumber mnpOrderReferenceId mnpTrackingStatus mnpBookedAt status',
      )
      .lean();

    if (!order || !orderBelongsToUser(order, auth.user)) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const consignment = order.mnpConsignmentNumber ?? order.mnpOrderReferenceId;
    if (!consignment) {
      return NextResponse.json({
        success: true,
        data: {
          hasShipment: false,
          trackingStatus: null,
          consignmentNumber: null,
          events: [],
          message: 'Shipment has not been booked with M&P yet.',
        },
      });
    }

    if (!isMnpConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          hasShipment: true,
          trackingStatus: order.mnpTrackingStatus ?? 'Booked with M&P',
          consignmentNumber: consignment,
          events: [],
          message: 'Tracking is temporarily unavailable.',
        },
      });
    }

    const { tracking, patch } = await syncMnpTrackingForOrder(id);

    return NextResponse.json({
      success: true,
      data: {
        hasShipment: true,
        trackingStatus:
          patch.mnpTrackingStatus ??
          tracking?.trackingStatus ??
          order.mnpTrackingStatus ??
          'Booked with M&P',
        consignmentNumber: tracking?.consignmentNumber ?? consignment,
        destinationCity: tracking?.destinationCity,
        originCity: tracking?.originCity,
        events: tracking?.events ?? [],
        orderStatus: patch.status ?? order.status,
        message: tracking?.message,
      },
    });
  } catch (err) {
    console.error('[GET /api/orders/[id]/mnp-tracking]', err);
    const message = err instanceof MnpCourierError ? err.message : 'Failed to load M&P tracking.';
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
