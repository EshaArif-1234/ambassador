import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Product from '@/backend/models/Product.model';
import { requireAdmin } from '@/backend/lib/adminAuth';
import { MAIN_CATALOG_FILTER } from '@/backend/lib/productTypeFilters';

const EXPORT_PROJECTION = {
  name: 1,
  slug: 1,
  price: 1,
  originalPrice: 1,
  stock: 1,
  status: 1,
  categories: 1,
  images: 1,
  imagePublicIds: 1,
};

/** GET /api/admin/products/export?stock=in_stock|out_of_stock|all&ids=id1,id2 */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids')?.trim();
    const stock = searchParams.get('stock') ?? 'all';

    let filter: Record<string, unknown> = {};
    let orderIds: string[] | null = null;

    if (idsParam) {
      const ids = idsParam
        .split(',')
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id));

      if (ids.length === 0) {
        return NextResponse.json(
          { success: false, message: 'At least one valid product id is required.' },
          { status: 400 },
        );
      }

      orderIds = ids;
      filter._id = { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) };
    } else {
      if (stock !== 'in_stock' && stock !== 'out_of_stock' && stock !== 'all') {
        return NextResponse.json(
          { success: false, message: 'stock must be in_stock, out_of_stock, or all.' },
          { status: 400 },
        );
      }

      filter =
        stock === 'in_stock'
          ? { ...MAIN_CATALOG_FILTER, stock: { $gt: 0 } }
          : stock === 'out_of_stock'
            ? { ...MAIN_CATALOG_FILTER, stock: { $lte: 0 } }
            : { ...MAIN_CATALOG_FILTER };
    }

    const products = await Product.find(filter, EXPORT_PROJECTION)
      .populate('categories', 'title')
      .sort({ name: 1 })
      .lean();

    if (orderIds) {
      const orderMap = new Map(orderIds.map((id, index) => [id, index]));
      products.sort(
        (a, b) =>
          (orderMap.get(String(a._id)) ?? Number.MAX_SAFE_INTEGER) -
          (orderMap.get(String(b._id)) ?? Number.MAX_SAFE_INTEGER),
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: products,
        total: products.length,
        stock: idsParam ? 'selected' : stock,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[GET /api/admin/products/export]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
