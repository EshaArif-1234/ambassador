import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import Product from '@/backend/models/Product.model';
import Review from '@/backend/models/Review.model';
import { requireAuthUser } from '@/utils/authSession.util';
import { sortPopulatedCategories } from '@/lib/storefrontCategories';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function displayPrice(p: { price?: number; originalPrice: number }) {
  return p.price != null && p.price > 0 ? p.price : p.originalPrice;
}

/** GET /api/wishlist — list saved products for the authenticated user */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthUser(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    await connectDB();

    const user = await User.findById(auth.userId).select('wishlist').lean();
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 401 });
    }

    const ids = (user.wishlist ?? []).map((id) => String(id));
    if (!ids.length) {
      return NextResponse.json(
        { success: true, data: { productIds: [], items: [] } },
        { headers: { 'Cache-Control': 'no-store, private' } }
      );
    }

    const products = await Product.find({
      _id: { $in: ids },
      status: 'active',
    })
      .select('name price originalPrice stock images specifications categories brands features about')
      .populate('categories', 'title slug sortOrder')
      .lean();

    const orderMap = new Map(ids.map((id, i) => [id, i]));
    products.sort(
      (a, b) => (orderMap.get(String(a._id)) ?? 0) - (orderMap.get(String(b._id)) ?? 0)
    );

    const ratings = await Review.aggregate<{
      _id: mongoose.Types.ObjectId;
      avgRating: number;
      reviewCount: number;
    }>([
      { $match: { productId: { $in: products.map((p) => p._id) }, status: 'approved' } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);
    const ratingMap = Object.fromEntries(
      ratings.map((r) => [
        String(r._id),
        { avgRating: +(r.avgRating ?? 0).toFixed(1), reviewCount: r.reviewCount },
      ])
    );

    const items = products.map((p) => {
      const sortedCats = sortPopulatedCategories(
        Array.isArray(p.categories)
          ? (p.categories as { title?: string; sortOrder?: number }[])
          : [],
      );
      const cats = sortedCats
        .map((c) => (typeof c === 'object' && c && 'title' in c ? String(c.title ?? '') : ''))
        .filter(Boolean);
      const r = ratingMap[String(p._id)];
      return {
        _id: String(p._id),
        name: p.name,
        about: p.about ?? '',
        category: cats[0] ?? '',
        categories: cats,
        price: displayPrice(p),
        originalPrice: p.originalPrice,
        stock: p.stock ?? 0,
        image: p.images?.[0] ?? '',
        specifications: p.specifications ?? {},
        brands: Array.isArray(p.brands) ? p.brands : [],
        avgRating: r?.avgRating ?? 0,
        reviewCount: r?.reviewCount ?? 0,
      };
    });

    const activeIds = items.map((p) => p._id);

    return NextResponse.json(
      {
        success: true,
        data: { productIds: activeIds, items },
      },
      { headers: { 'Cache-Control': 'no-store, private' } }
    );
  } catch (err) {
    console.error('[GET /api/wishlist]', err);
    return NextResponse.json({ success: false, message: 'Failed to load wishlist.' }, { status: 500 });
  }
}

/** POST /api/wishlist — add product to wishlist { productId } */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthUser(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, message: 'Invalid product.' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findOne({ _id: productId, status: 'active' }).select('_id').lean();
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const user = await User.findById(auth.userId).select('wishlist');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 401 });
    }

    const exists = user.wishlist.some((id) => String(id) === productId);
    if (!exists) {
      user.wishlist.push(new mongoose.Types.ObjectId(productId));
      await user.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        added: true,
        productIds: user.wishlist.map((id) => String(id)),
      },
    });
  } catch (err) {
    console.error('[POST /api/wishlist]', err);
    return NextResponse.json({ success: false, message: 'Failed to update wishlist.' }, { status: 500 });
  }
}
