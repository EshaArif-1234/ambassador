import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import User from '@/backend/models/User.model';
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

type TrafficPoint = { label: string; orders: number; users: number };

const ORDER_MATCH = { status: { $nin: ['cancelled'] } };
const USER_MATCH = { role: { $ne: 'admin' } };

/** GET /api/admin/traffic?range=daily|weekly|monthly|yearly */
export async function GET(req: NextRequest) {
  const authError = await requireFullAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = parseChartRange(searchParams.get('range'), 'weekly');
    const now = new Date();
    const buckets = buildDateBuckets(range, now);
    const result: TrafficPoint[] = buckets.map((bucket) => ({
      label: bucket.label,
      orders: 0,
      users: 0,
    }));

    const rangeStart = getOverallRangeStart(buckets);

    if (range === 'yearly') {
      const startYear = now.getFullYear();
      const [orderRows, userRows] = await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: rangeStart, $lte: now }, ...ORDER_MATCH } },
          { $group: { _id: { month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: rangeStart, $lte: now }, ...USER_MATCH } },
          { $group: { _id: { month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        ]),
      ]);

      for (const row of orderRows) {
        const idx = getMonthBucketIndex(startYear, row._id.month, startYear, 0);
        if (idx >= 0 && idx < result.length) result[idx].orders = Number(row.count) || 0;
      }
      for (const row of userRows) {
        const idx = getMonthBucketIndex(startYear, row._id.month, startYear, 0);
        if (idx >= 0 && idx < result.length) result[idx].users = Number(row.count) || 0;
      }
    } else {
      const [orders, users] = await Promise.all([
        Order.find({ createdAt: { $gte: rangeStart, $lte: now }, ...ORDER_MATCH })
          .select('createdAt')
          .lean(),
        User.find({ createdAt: { $gte: rangeStart, $lte: now }, ...USER_MATCH })
          .select('createdAt')
          .lean(),
      ]);

      for (const order of orders) {
        const idx = findBucketIndex(new Date(order.createdAt), buckets);
        if (idx >= 0) result[idx].orders += 1;
      }
      for (const user of users) {
        const idx = findBucketIndex(new Date(user.createdAt), buckets);
        if (idx >= 0) result[idx].users += 1;
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
    const message = err instanceof Error ? err.message : 'Failed to fetch traffic data.';
    console.error('[GET /api/admin/traffic]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
