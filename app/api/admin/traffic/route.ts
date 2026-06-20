import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import User from '@/backend/models/User.model';
import { requireAdmin } from '@/backend/lib/adminAuth';
import {
  buildDateBuckets,
  findBucketIndex,
  getDayBucketIndex,
  getMonthBucketIndex,
  getOverallRangeStart,
  getWeekBucketIndex,
  getYearBucketIndex,
  parseChartRange,
} from '@/lib/adminChartRanges';

type TrafficPoint = { label: string; orders: number; users: number };

const ORDER_MATCH = { status: { $nin: ['cancelled'] } };
const USER_MATCH = { role: { $ne: 'admin' } };

function emptyBuckets(range: ReturnType<typeof parseChartRange>): TrafficPoint[] {
  return buildDateBuckets(range).map((bucket) => ({
    label: bucket.label,
    orders: 0,
    users: 0,
  }));
}

/** GET /api/admin/traffic?range=daily|weekly|monthly|yearly */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = parseChartRange(searchParams.get('range'), 'weekly');
    const now = new Date();
    const buckets = buildDateBuckets(range, now);
    const result = emptyBuckets(range);

    if (range === 'daily') {
      const rangeStart = getOverallRangeStart(buckets);
      const [orders, users] = await Promise.all([
        Order.find({ createdAt: { $gte: rangeStart, $lte: now }, ...ORDER_MATCH })
          .select('createdAt')
          .lean(),
        User.find({ createdAt: { $gte: rangeStart, $lte: now }, ...USER_MATCH })
          .select('createdAt')
          .lean(),
      ]);

      for (const order of orders) {
        const idx = getDayBucketIndex(new Date(order.createdAt), rangeStart, buckets.length);
        if (idx >= 0) result[idx].orders += 1;
      }
      for (const user of users) {
        const idx = getDayBucketIndex(new Date(user.createdAt), rangeStart, buckets.length);
        if (idx >= 0) result[idx].users += 1;
      }
    } else if (range === 'weekly') {
      const rangeStart = getOverallRangeStart(buckets);
      const [orders, users] = await Promise.all([
        Order.find({ createdAt: { $gte: rangeStart, $lte: now }, ...ORDER_MATCH })
          .select('createdAt')
          .lean(),
        User.find({ createdAt: { $gte: rangeStart, $lte: now }, ...USER_MATCH })
          .select('createdAt')
          .lean(),
      ]);

      for (const order of orders) {
        const idx = getWeekBucketIndex(new Date(order.createdAt), rangeStart, buckets.length);
        if (idx >= 0) result[idx].orders += 1;
      }
      for (const user of users) {
        const idx = getWeekBucketIndex(new Date(user.createdAt), rangeStart, buckets.length);
        if (idx >= 0) result[idx].users += 1;
      }
    } else if (range === 'monthly') {
      const rangeStart = getOverallRangeStart(buckets);
      const [orderRows, userRows] = await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: rangeStart, $lte: now }, ...ORDER_MATCH } },
          {
            $group: {
              _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: rangeStart, $lte: now }, ...USER_MATCH } },
          {
            $group: {
              _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const startYear = rangeStart.getFullYear();
      const startMonth = rangeStart.getMonth();

      for (const row of orderRows) {
        const idx = getMonthBucketIndex(row._id.year, row._id.month, startYear, startMonth);
        if (idx >= 0 && idx < result.length) result[idx].orders = Number(row.count) || 0;
      }
      for (const row of userRows) {
        const idx = getMonthBucketIndex(row._id.year, row._id.month, startYear, startMonth);
        if (idx >= 0 && idx < result.length) result[idx].users = Number(row.count) || 0;
      }
    } else {
      const rangeStart = getOverallRangeStart(buckets);
      const startYear = rangeStart.getFullYear();
      const [orderRows, userRows] = await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: rangeStart, $lte: now }, ...ORDER_MATCH } },
          {
            $group: {
              _id: { year: { $year: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: rangeStart, $lte: now }, ...USER_MATCH } },
          {
            $group: {
              _id: { year: { $year: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      for (const row of orderRows) {
        const idx = getYearBucketIndex(row._id.year, startYear, buckets.length);
        if (idx >= 0) result[idx].orders = Number(row.count) || 0;
      }
      for (const row of userRows) {
        const idx = getYearBucketIndex(row._id.year, startYear, buckets.length);
        if (idx >= 0) result[idx].users = Number(row.count) || 0;
      }
    }

    return NextResponse.json({ success: true, data: result, range });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch traffic data.';
    console.error('[GET /api/admin/traffic]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
