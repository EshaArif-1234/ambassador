import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import User from '@/backend/models/User.model';
import { requireAdmin } from '@/backend/lib/adminAuth';

/** GET /api/admin/traffic?range=daily|weekly|monthly */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const rawRange = searchParams.get('range');
    const range = rawRange === 'weekly' ? 'weekly' : rawRange === 'monthly' ? 'monthly' : 'daily';

    const now = new Date();
    const result: { label: string; orders: number; users: number }[] = [];

    if (range === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(start.getDate() - i);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        const [orders, users] = await Promise.all([
          Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          User.countDocuments({ createdAt: { $gte: start, $lte: end }, role: { $ne: 'admin' } }),
        ]);

        result.push({
          label: start.toLocaleDateString('en-US', { weekday: 'short' }),
          orders,
          users,
        });
      }
    } else if (range === 'weekly') {
      for (let i = 3; i >= 0; i--) {
        const end = new Date(now);
        end.setDate(end.getDate() - i * 7);
        end.setHours(23, 59, 59, 999);

        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);

        const [orders, users] = await Promise.all([
          Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          User.countDocuments({ createdAt: { $gte: start, $lte: end }, role: { $ne: 'admin' } }),
        ]);

        result.push({
          label: `Week ${4 - i}`,
          orders,
          users,
        });
      }
    } else {
      // Monthly — last 6 months
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
        const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

        const [orders, users] = await Promise.all([
          Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          User.countDocuments({ createdAt: { $gte: start, $lte: end }, role: { $ne: 'admin' } }),
        ]);

        result.push({
          label: start.toLocaleDateString('en-US', { month: 'short' }),
          orders,
          users,
        });
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('[GET /api/admin/traffic]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch traffic data.' },
      { status: 500 }
    );
  }
}
