import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import { requireAdmin } from '@/backend/lib/adminAuth';
import {
  buildDateBuckets,
  getOverallRangeStart,
  getRangeDescription,
  getRangeLabel,
  parseChartRange,
} from '@/lib/adminChartRanges';
import {
  ORDER_FULFILLMENT_STATUSES,
  type OrderFulfillmentStatus,
} from '@/utils/orderWorkflow.util';

type StatusCounts = Record<OrderFulfillmentStatus, number>;

function emptyStatusCounts(): StatusCounts {
  return {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
}

/** GET /api/admin/order-status?range=daily|weekly|monthly|yearly */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = parseChartRange(searchParams.get('range'), 'monthly');
    const now = new Date();
    const buckets = buildDateBuckets(range, now);
    const rangeStart = getOverallRangeStart(buckets);

    const rows = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: rangeStart, $lte: now },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const byStatus = emptyStatusCounts();
    let total = 0;

    for (const row of rows) {
      const status = row._id as OrderFulfillmentStatus;
      if (ORDER_FULFILLMENT_STATUSES.includes(status)) {
        byStatus[status] = Number(row.count) || 0;
        total += byStatus[status];
      }
    }

    const rangeLabel = getRangeLabel(buckets);

    return NextResponse.json({
      success: true,
      data: {
        total,
        byStatus,
        range,
        rangeLabel,
        description: getRangeDescription(range, now),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch order status data.';
    console.error('[GET /api/admin/order-status]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
