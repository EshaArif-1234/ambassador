import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Product from '@/backend/models/Product.model';
import { requireAdmin } from '@/backend/lib/adminAuth';

const EXPORT_PROJECTION = {
  name: 1,
  slug: 1,
  price: 1,
  originalPrice: 1,
  stock: 1,
  status: 1,
  categories: 1,
};

/** GET /api/admin/products/export?stock=in_stock|out_of_stock */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const stock = searchParams.get('stock');

    if (stock !== 'in_stock' && stock !== 'out_of_stock') {
      return NextResponse.json(
        { success: false, message: 'stock must be in_stock or out_of_stock.' },
        { status: 400 }
      );
    }

    const filter: Record<string, unknown> =
      stock === 'in_stock' ? { stock: { $gt: 0 } } : { stock: { $lte: 0 } };

    const products = await Product.find(filter, EXPORT_PROJECTION)
      .populate('categories', 'title')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      { success: true, data: products, total: products.length, stock },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/admin/products/export]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
