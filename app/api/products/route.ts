import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Product from '@/backend/models/Product.model';
import Category from '@/backend/models/Category.model';
import Review from '@/backend/models/Review.model';

export const dynamic = 'force-dynamic';

const PAGE_LIMIT = 12; // products per page

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Only fields needed by the product listing cards
const LISTING_PROJECTION = {
  name: 1, slug: 1, price: 1, originalPrice: 1,
  stock: 1, status: 1, brands: 1, features: 1,
  categories: 1, images: { $slice: 1 }, createdAt: 1,
  about: 1,
};

/** GET /api/products?page=1&limit=12&search=...&category=... */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search        = (searchParams.get('search')   ?? '').trim();
    const categoryTitle = (searchParams.get('category') ?? '').trim();
    const page          = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10));
    const limit         = Math.min(50, parseInt(searchParams.get('limit') ?? String(PAGE_LIMIT), 10));
    const skip          = (page - 1) * limit;

    const minPrice  = parseFloat(searchParams.get('minPrice') ?? '0')  || 0;
    const maxPrice  = parseFloat(searchParams.get('maxPrice') ?? '0')  || 0;
    const brandsRaw = (searchParams.get('brands')   ?? '').trim();
    const featsRaw  = (searchParams.get('features') ?? '').trim();
    const sortBy    = searchParams.get('sort') ?? 'newest';
    const excludeId = (searchParams.get('exclude') ?? '').trim();

    const filter: Record<string, unknown> = { status: 'active' };

    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: excludeId };
    }

    if (search) {
      // Find categories whose title partially matches the search term
      const matchingCats = await Category.find({
        title: { $regex: escapeRegex(search), $options: 'i' },
        $nor: [{ status: { $regex: /^inactive$/i } }],
      }).select('_id').lean();

      const nameCondition = { name: { $regex: escapeRegex(search), $options: 'i' } };

      if (matchingCats.length > 0) {
        // Search matches both product name AND category name — use $or so either qualifies
        filter.$or = [
          nameCondition,
          { categories: { $in: matchingCats.map((c) => c._id) } },
        ];
      } else if (search.length >= 2) {
        // No category match — use fast text index on product name
        filter.$text = { $search: search };
      } else {
        filter.name = nameCondition.name;
      }
    }

    if (categoryTitle) {
      const cats = await Category.find({
        title: new RegExp(`^${escapeRegex(categoryTitle)}$`, 'i'),
        $nor: [{ status: { $regex: /^inactive$/i } }],
      }).select('_id').lean();

      if (!cats.length) {
        return NextResponse.json(
          { success: true, data: [], total: 0, page, totalPages: 0 },
          { status: 200, headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
        );
      }
      filter.categories = { $in: cats.map((c) => c._id) };
    }

    if (minPrice > 0 || maxPrice > 0) {
      const priceField: Record<string, number> = {};
      if (minPrice > 0) priceField.$gte = minPrice;
      if (maxPrice > 0) priceField.$lte = maxPrice;
      filter.originalPrice = priceField;
    }

    if (brandsRaw) {
      filter.brands = { $in: brandsRaw.split(',').map((b) => b.trim()).filter(Boolean) };
    }

    if (featsRaw) {
      // AND logic — product must have every selected feature, not just one
      filter.features = { $all: featsRaw.split(',').map((f) => f.trim()).filter(Boolean) };
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt:  1 },
      price_asc:  { originalPrice:  1 },
      price_desc: { originalPrice: -1 },
      name_asc:   { name:  1 },
      name_desc:  { name: -1 },
    };
    const sortOrder = sortMap[sortBy] ?? sortMap.newest;

    // Fetch page of products, total count, and ratings — all in parallel
    const [products, total, ratings] = await Promise.all([
      Product.find(filter, LISTING_PROJECTION)
        .populate('categories', 'title slug')
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
      Review.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
      ]),
    ]);

    const ratingMap: Record<string, { avgRating: number; reviewCount: number }> = {};
    for (const r of ratings) ratingMap[String(r._id)] = { avgRating: r.avgRating, reviewCount: r.reviewCount };

    const enriched = products.map((p) => {
      const id = String(p._id);
      const r  = ratingMap[id];
      return {
        ...p, _id: id,
        avgRating:   r ? +Number(r.avgRating).toFixed(1) : 0,
        reviewCount: r?.reviewCount ?? 0,
      };
    });

    return NextResponse.json(
      { success: true, data: enriched, total, page, totalPages: Math.ceil(total / limit) },
      { status: 200, headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
