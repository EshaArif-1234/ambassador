import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import { requireFullAdmin } from '@/backend/lib/adminAuth';
import {
  buildDateBuckets,
  findBucketIndex,
  getMonthBucketIndex,
  getOverallRangeStart,
  getRangeDescription,
  getRangeLabel,
  parseChartRange,
} from '@/lib/adminChartRanges';

type ChartPoint = { label: string; sales: number; orders: number };

const ORDER_MATCH = { status: { $nin: ['cancelled'] } };

/** GET /api/admin/sales-chart?range=daily|weekly|monthly|yearly */
export async function GET(req: NextRequest) {
  const authError = await requireFullAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = parseChartRange(searchParams.get('range'), 'monthly');
    const now = new Date();
    const buckets = buildDateBuckets(range, now);
    const result: ChartPoint[] = buckets.map((bucket) => ({
      label: bucket.label,
      sales: 0,
      orders: 0,
    }));

    const rangeStart = getOverallRangeStart(buckets);

    if (range === 'yearly') {
      const rows = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: rangeStart, $lte: now },
            ...ORDER_MATCH,
          },
        },
        {
          $group: {
            _id: { month: { $month: '$createdAt' } },
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.month': 1 } },
      ]);

      const startYear = now.getFullYear();
      for (const row of rows) {
        const idx = getMonthBucketIndex(startYear, row._id.month, startYear, 0);
        if (idx >= 0 && idx < result.length) {
          result[idx].sales = Number(row.sales) || 0;
          result[idx].orders = Number(row.orders) || 0;
        }
      }
    } else {
      const orders = await Order.find({
        createdAt: { $gte: rangeStart, $lte: now },
        ...ORDER_MATCH,
      })
        .select('totalAmount createdAt')
        .lean();

      for (const order of orders) {
        const idx = findBucketIndex(new Date(order.createdAt), buckets);
        if (idx >= 0) {
          result[idx].sales += Number(order.totalAmount) || 0;
          result[idx].orders += 1;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      range,
      rangeLabel: getRangeLabel(buckets),
      description: getRangeDescription(range, now),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch sales chart.';
    console.error('[GET /api/admin/sales-chart]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
