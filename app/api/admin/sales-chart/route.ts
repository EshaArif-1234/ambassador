import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import { requireAdmin } from '@/backend/lib/adminAuth';
import {
  buildDateBuckets,
  getDayBucketIndex,
  getMonthBucketIndex,
  getOverallRangeStart,
  getWeekBucketIndex,
  getYearBucketIndex,
  parseChartRange,
} from '@/lib/adminChartRanges';

type ChartPoint = { label: string; sales: number; orders: number };

const ORDER_MATCH = { status: { $nin: ['cancelled'] } };

function emptySalesBuckets(range: ReturnType<typeof parseChartRange>): ChartPoint[] {
  return buildDateBuckets(range).map((bucket) => ({
    label: bucket.label,
    sales: 0,
    orders: 0,
  }));
}

/** GET /api/admin/sales-chart?range=daily|weekly|monthly|yearly */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = parseChartRange(searchParams.get('range'), 'monthly');
    const now = new Date();
    const buckets = buildDateBuckets(range, now);
    const result = emptySalesBuckets(range);

    if (range === 'daily' || range === 'weekly') {
      const rangeStart = getOverallRangeStart(buckets);
      const orders = await Order.find({
        createdAt: { $gte: rangeStart, $lte: now },
        ...ORDER_MATCH,
      })
        .select('totalAmount createdAt')
        .lean();

      for (const order of orders) {
        const created = new Date(order.createdAt);
        const idx =
          range === 'daily'
            ? getDayBucketIndex(created, rangeStart, buckets.length)
            : getWeekBucketIndex(created, rangeStart, buckets.length);

        if (idx >= 0) {
          result[idx].sales += Number(order.totalAmount) || 0;
          result[idx].orders += 1;
        }
      }

      return NextResponse.json({ success: true, data: result, range });
    }

    if (range === 'monthly') {
      const rangeStart = getOverallRangeStart(buckets);
      const rows = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: rangeStart, $lte: now },
            ...ORDER_MATCH,
          },
        },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      const startYear = rangeStart.getFullYear();
      const startMonth = rangeStart.getMonth();

      for (const row of rows) {
        const idx = getMonthBucketIndex(row._id.year, row._id.month, startYear, startMonth);
        if (idx >= 0 && idx < result.length) {
          result[idx].sales = Number(row.sales) || 0;
          result[idx].orders = Number(row.orders) || 0;
        }
      }

      return NextResponse.json({ success: true, data: result, range });
    }

    const rangeStart = getOverallRangeStart(buckets);
    const startYear = rangeStart.getFullYear();
    const rows = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: rangeStart, $lte: now },
          ...ORDER_MATCH,
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1 } },
    ]);

    for (const row of rows) {
      const idx = getYearBucketIndex(row._id.year, startYear, buckets.length);
      if (idx >= 0) {
        result[idx].sales = Number(row.sales) || 0;
        result[idx].orders = Number(row.orders) || 0;
      }
    }

    return NextResponse.json({ success: true, data: result, range });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch sales chart.';
    console.error('[GET /api/admin/sales-chart]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
