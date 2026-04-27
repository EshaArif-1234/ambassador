import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Product from '@/backend/models/Product.model';
import Review from '@/backend/models/Review.model';
import { requireAdmin } from '@/backend/lib/adminAuth';

/** GET /api/admin/products — list all products with optional filters */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search     = searchParams.get('search')   ?? '';
    const status     = searchParams.get('status')   ?? 'all';
    const categoryId = searchParams.get('category') ?? '';

    const filter: Record<string, unknown> = {};
    if (search)              filter.name     = { $regex: search, $options: 'i' };
    if (status !== 'all')    filter.status   = status;
    if (categoryId)          filter.category = categoryId;

    const products = await Product.find(filter)
      .populate('category',    'title')
      .populate('subCategory', 'title')
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate average rating + count per product
    const ratings = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);
    const ratingMap: Record<string, { avgRating: number; reviewCount: number }> = {};
    ratings.forEach(r => { ratingMap[String(r._id)] = { avgRating: r.avgRating, reviewCount: r.reviewCount }; });

    const enriched = products.map(p => ({
      ...p,
      avgRating:   +(ratingMap[String(p._id)]?.avgRating  ?? 0).toFixed(1),
      reviewCount:   ratingMap[String(p._id)]?.reviewCount ?? 0,
    }));

    return NextResponse.json({ success: true, data: enriched }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/products]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** POST /api/admin/products — create a new product */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await req.json();
    const {
      name, category, subCategory,
      price, originalPrice, stock, status, about,
      images, imagePublicIds, videos, videoPublicIds,
      specifications, metaTitle, metaDescription,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'Product name is required.' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category is required.' }, { status: 400 });
    }
    if (!subCategory) {
      return NextResponse.json({ success: false, message: 'Subcategory is required.' }, { status: 400 });
    }
    if (!originalPrice || Number(originalPrice) <= 0) {
      return NextResponse.json({ success: false, message: 'A valid original price is required.' }, { status: 400 });
    }
    if (price && Number(price) > Number(originalPrice)) {
      return NextResponse.json(
        { success: false, message: 'Discounted price cannot exceed original price.' },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name:            name.trim(),
      category,
      subCategory,
      ...(price ? { price: Number(price) } : {}),
      originalPrice:   Number(originalPrice),
      stock:           Number(stock ?? 0),
      status:          status ?? 'active',
      about:           about?.trim() ?? '',
      images:          images         ?? [],
      imagePublicIds:  imagePublicIds ?? [],
      videos:          videos         ?? [],
      videoPublicIds:  videoPublicIds ?? [],
      specifications:  specifications ?? {},
      metaTitle:       metaTitle?.trim()       ?? '',
      metaDescription: metaDescription?.trim() ?? '',
    });

    const populated = await product.populate([
      { path: 'category',    select: 'title' },
      { path: 'subCategory', select: 'title' },
    ]);

    return NextResponse.json(
      { success: true, message: 'Product created successfully.', data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/admin/products]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
