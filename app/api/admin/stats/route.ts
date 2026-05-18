import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import Order from '@/backend/models/Order.model';
import { requireAdmin } from '@/backend/lib/adminAuth';

/** GET /api/admin/stats — real-time counts for dashboard */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    // Lazy-load Product model to avoid circular imports
    const { default: Product } = await import('@/backend/models/Product.model');

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments({}),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        ordersByStatus: {
          pending:    pendingOrders,
          confirmed:  confirmedOrders,
          processing: processingOrders,
          shipped:    shippedOrders,
          delivered:  deliveredOrders,
          cancelled:  cancelledOrders,
        },
      },
    });
  } catch (err: any) {
    console.error('[GET /api/admin/stats]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch stats.' },
      { status: 500 }
    );
  }
}
