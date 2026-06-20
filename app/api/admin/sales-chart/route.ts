import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import { requireAdmin } from '@/backend/lib/adminAuth';

type ChartRange = 'daily' | 'weekly' | 'monthly' | 'yearly';
type ChartPoint = { label: string; sales: number; orders: number };

const VALID_RANGES: ChartRange[] = ['daily', 'weekly', 'monthly', 'yearly'];

function parseRange(value: string | null): ChartRange {
  if (value && VALID_RANGES.includes(value as ChartRange)) {
    return value as ChartRange;
  }
  return 'monthly';
}

function buildDailyBuckets(count: number, now: Date): ChartPoint[] {
  const buckets: ChartPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    buckets.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      sales: 0,
      orders: 0,
    });
  }
  return buckets;
}

function buildWeeklyBuckets(count: number, now: Date): ChartPoint[] {
  const buckets: ChartPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() - i * 7);

    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    buckets.push({ label, sales: 0, orders: 0 });
  }
  return buckets;
}

function buildMonthlyBuckets(count: number, now: Date): ChartPoint[] {
  const buckets: ChartPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      sales: 0,
      orders: 0,
    });
  }
  return buckets;
}

function buildYearlyBuckets(count: number, now: Date): ChartPoint[] {
  const buckets: ChartPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const year = now.getFullYear() - i;
    buckets.push({ label: String(year), sales: 0, orders: 0 });
  }
  return buckets;
}

function bucketOrdersByDay(
  orders: { totalAmount: number; createdAt: Date }[],
  rangeStart: Date,
  bucketCount: number
): ChartPoint[] {
  const buckets = buildDailyBuckets(bucketCount, new Date());
  for (const order of orders) {
    const created = new Date(order.createdAt);
    const daysDiff = Math.floor(
      (created.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000)
    );
    if (daysDiff >= 0 && daysDiff < bucketCount) {
      buckets[daysDiff].sales += Number(order.totalAmount) || 0;
      buckets[daysDiff].orders += 1;
    }
  }
  return buckets;
}

function bucketOrdersByWeek(
  orders: { totalAmount: number; createdAt: Date }[],
  rangeStart: Date,
  weekCount: number
): ChartPoint[] {
  const buckets = buildWeeklyBuckets(weekCount, new Date());
  for (const order of orders) {
    const created = new Date(order.createdAt);
    const daysDiff = Math.floor(
      (created.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000)
    );
    const bucketIdx = Math.min(Math.floor(daysDiff / 7), weekCount - 1);
    if (bucketIdx >= 0 && bucketIdx < buckets.length) {
      buckets[bucketIdx].sales += Number(order.totalAmount) || 0;
      buckets[bucketIdx].orders += 1;
    }
  }
  return buckets;
}

/** GET /api/admin/sales-chart?range=daily|weekly|monthly|yearly */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = parseRange(searchParams.get('range'));
    const now = new Date();

    if (range === 'daily') {
      const dayCount = 7;
      const rangeStart = new Date(now);
      rangeStart.setDate(rangeStart.getDate() - (dayCount - 1));
      rangeStart.setHours(0, 0, 0, 0);

      const orders = await Order.find({
        createdAt: { $gte: rangeStart },
        status: { $nin: ['cancelled'] },
      })
        .select('totalAmount createdAt')
        .lean();

      const buckets = bucketOrdersByDay(orders, rangeStart, dayCount);
      return NextResponse.json({ success: true, data: buckets, range });
    }

    if (range === 'weekly') {
      const weekCount = 4;
      const rangeStart = new Date(now);
      rangeStart.setDate(rangeStart.getDate() - (weekCount * 7 - 1));
      rangeStart.setHours(0, 0, 0, 0);

      const orders = await Order.find({
        createdAt: { $gte: rangeStart },
        status: { $nin: ['cancelled'] },
      })
        .select('totalAmount createdAt')
        .lean();

      const buckets = bucketOrdersByWeek(orders, rangeStart, weekCount);
      return NextResponse.json({ success: true, data: buckets, range });
    }

    if (range === 'monthly') {
      const monthCount = 6;
      const buckets = buildMonthlyBuckets(monthCount, now);
      const start = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);

      const rows = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start },
            status: { $nin: ['cancelled'] },
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

      for (const row of rows) {
        const idx =
          (row._id.year - start.getFullYear()) * 12 +
          (row._id.month - 1) -
          start.getMonth();
        if (idx >= 0 && idx < buckets.length) {
          buckets[idx].sales = Number(row.sales) || 0;
          buckets[idx].orders = Number(row.orders) || 0;
        }
      }

      return NextResponse.json({ success: true, data: buckets, range });
    }

    const yearCount = 5;
    const buckets = buildYearlyBuckets(yearCount, now);
    const startYear = now.getFullYear() - (yearCount - 1);
    const start = new Date(startYear, 0, 1);

    const rows = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start },
          status: { $nin: ['cancelled'] },
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
      const idx = row._id.year - startYear;
      if (idx >= 0 && idx < buckets.length) {
        buckets[idx].sales = Number(row.sales) || 0;
        buckets[idx].orders = Number(row.orders) || 0;
      }
    }

    return NextResponse.json({ success: true, data: buckets, range });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch sales chart.';
    console.error('[GET /api/admin/sales-chart]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
