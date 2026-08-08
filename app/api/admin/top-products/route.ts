import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import Product from '@/backend/models/Product.model';
import { requireFullAdmin } from '@/backend/lib/adminAuth';
import { PRODUCT_PLACEHOLDER, resolveProductImages } from '@/utils/productMedia.util';

function lineItemRevenueExpr(whenCondition: Record<string, unknown>) {
  return {
    $sum: {
      $cond: [
        whenCondition,
        {
          $cond: [
            {
              $and: [
                { $ne: ['$items.total', null] },
                { $gt: ['$items.total', 0] },
              ],
            },
            '$items.total',
            {
              $multiply: [
                { $ifNull: ['$items.price', 0] },
                { $ifNull: ['$items.quantity', 0] },
              ],
            },
          ],
        },
        0,
      ],
    },
  };
}

function catalogDisplayPrice(price?: number, originalPrice?: number): number {
  if (price != null && price > 0) return price;
  return Number(originalPrice) || 0;
}

/** GET /api/admin/top-products?limit=5&days=30 — best sellers from order line items */
export async function GET(req: NextRequest) {
  const authError = await requireFullAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') ?? '5', 10)));
    const days = Math.min(90, Math.max(7, parseInt(searchParams.get('days') ?? '30', 10)));

    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

    const rows = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: prevStart },
          status: { $nin: ['cancelled'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            $cond: [
              {
                $and: [
                  { $ne: ['$items.productId', null] },
                  { $ne: ['$items.productId', ''] },
                ],
              },
              '$items.productId',
              '$items.productName',
            ],
          },
          productId: { $first: '$items.productId' },
          productName: { $first: '$items.productName' },
          productImage: { $first: '$items.productImage' },
          currentUnits: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', periodStart] }, '$items.quantity', 0],
            },
          },
          previousUnits: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$createdAt', prevStart] },
                    { $lt: ['$createdAt', periodStart] },
                  ],
                },
                '$items.quantity',
                0,
              ],
            },
          },
          revenue: lineItemRevenueExpr({ $gte: ['$createdAt', periodStart] }),
          orderCount: {
            $addToSet: {
              $cond: [{ $gte: ['$createdAt', periodStart] }, '$_id', '$$REMOVE'],
            },
          },
        },
      },
      { $match: { currentUnits: { $gt: 0 } } },
      { $sort: { currentUnits: -1 } },
      { $limit: limit },
    ]);

    const productIds = rows
      .map((r) => r.productId)
      .filter((id): id is string => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id));

    const products = productIds.length
      ? await Product.find({ _id: { $in: productIds } })
          .populate('categories', 'title')
          .select('name price originalPrice images imagePublicIds categories')
          .lean()
      : [];

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const data = rows.map((row) => {
      const pid = row.productId as string | undefined;
      const prod = pid ? productMap.get(String(pid)) : undefined;

      let image = typeof row.productImage === 'string' ? row.productImage.trim() : '';
      let category = 'Uncategorized';
      let name = String(row.productName ?? 'Unknown product');

      let unitPrice = 0;
      let originalPrice = 0;

      if (prod) {
        name = prod.name ?? name;
        originalPrice = Number(prod.originalPrice) || 0;
        unitPrice = catalogDisplayPrice(prod.price, prod.originalPrice);
        const resolved = resolveProductImages({
          images: prod.images,
          imagePublicIds: prod.imagePublicIds,
        });
        if (resolved[0]) image = resolved[0];
        const cats = prod.categories as Array<{ title?: string }> | undefined;
        if (cats?.[0]?.title) category = cats[0].title;
      }

      const currentUnits = Number(row.currentUnits) || 0;
      const previousUnits = Number(row.previousUnits) || 0;
      const revenue = Number(row.revenue) || 0;
      const orderCount = Array.isArray(row.orderCount) ? row.orderCount.length : 0;
      const avgSalePrice = currentUnits > 0 ? Math.round(revenue / currentUnits) : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (currentUnits > previousUnits) trend = 'up';
      else if (currentUnits < previousUnits) trend = 'down';

      const onSale =
        originalPrice > 0 && unitPrice > 0 && unitPrice < originalPrice;

      return {
        id: String(row._id),
        productId: pid ?? null,
        name,
        image: image || PRODUCT_PLACEHOLDER,
        category,
        sales: currentUnits,
        orderCount,
        revenue,
        unitPrice,
        originalPrice,
        avgSalePrice,
        onSale,
        trend,
      };
    });

    return NextResponse.json({ success: true, data, days });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch top products.';
    console.error('[GET /api/admin/top-products]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
