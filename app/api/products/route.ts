import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Product from '@/backend/models/Product.model';
import Category from '@/backend/models/Category.model';
import Review from '@/backend/models/Review.model';
import { shuffleWithSeed } from '@/utils/seededShuffle.util';
import { resolveProductImages } from '@/utils/productMedia.util';
import { sortPopulatedCategories } from '@/lib/storefrontCategories';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;
const PAGE_LIMIT = 12; // products per page

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Only fields needed by the product listing cards
const LISTING_PROJECTION = {
  name: 1, slug: 1, price: 1, originalPrice: 1,
  stock: 1, status: 1, brands: 1, features: 1,
  categories: 1, images: 1, imagePublicIds: 1, createdAt: 1,
  about: 1,
};

function enrichListingProduct<T extends { images?: unknown; imagePublicIds?: unknown; categories?: unknown }>(p: T) {
  const resolved = resolveProductImages({
    images: p.images,
    imagePublicIds: p.imagePublicIds,
  });
  return {
    ...p,
    images: resolved.length ? [resolved[0]] : [],
    categories: sortPopulatedCategories(
      Array.isArray(p.categories) ? (p.categories as { sortOrder?: number; title?: string }[]) : [],
    ),
  };
}

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
    const onSale      = searchParams.get('sale') === '1';
    const sortBy    = searchParams.get('sort') ?? 'newest';
    const excludeId = (searchParams.get('exclude') ?? '').trim();

    const filter: Record<string, unknown> = { status: 'active' };

    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: excludeId };
    }

    // Text search and category browse are separate modes (not combined).
    if (search) {
      const nameCondition = { name: { $regex: escapeRegex(search), $options: 'i' } };

      const matchingCats = await Category.find({
        title: { $regex: escapeRegex(search), $options: 'i' },
        $nor: [{ status: { $regex: /^inactive$/i } }],
      }).select('_id').lean();

      if (matchingCats.length > 0) {
        filter.$or = [
          nameCondition,
          { categories: { $in: matchingCats.map((c) => c._id) } },
        ];
      } else {
        filter.name = nameCondition.name;
      }
    } else if (categoryTitle) {
      const cats = await Category.find({
        title: new RegExp(`^${escapeRegex(categoryTitle)}$`, 'i'),
        $nor: [{ status: { $regex: /^inactive$/i } }],
      }).select('_id').lean();

      if (!cats.length) {
        return NextResponse.json(
          { success: true, data: [], total: 0, page, totalPages: 0 },
          { status: 200, headers: NO_STORE }
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

    if (onSale) {
      filter.$or = [
        { features: 'on_sale' },
        {
          price: { $exists: true, $gt: 0 },
          $expr: { $lt: ['$price', '$originalPrice'] },
        },
      ];
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
    const usePriceSort = sortBy === 'price_asc' || sortBy === 'price_desc';
    const useNameCollation = sortBy === 'name_asc' || sortBy === 'name_desc';

    const ratingsPromise = Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);

    if (sortBy === 'random') {
      const seedRaw = parseInt(searchParams.get('seed') ?? '', 10);
      const seed = Number.isFinite(seedRaw) ? seedRaw : Date.now();

      const [idRows, totalCount, ratings] = await Promise.all([
        Product.find(filter).select('_id').lean(),
        Product.countDocuments(filter),
        ratingsPromise,
      ]);

      const total = totalCount;
      const orderedIds = shuffleWithSeed(
        idRows.map((row) => String(row._id)),
        seed
      ).slice(skip, skip + limit);

      const products =
        orderedIds.length === 0
          ? []
          : await (async () => {
              const rows = await Product.find({ _id: { $in: orderedIds } }, LISTING_PROJECTION)
                .populate('categories', 'title slug sortOrder')
                .lean();
              const order = new Map(orderedIds.map((id, index) => [id, index]));
              return [...rows].sort(
                (a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0)
              );
            })();

      const ratingMap: Record<string, { avgRating: number; reviewCount: number }> = {};
      for (const r of ratings) ratingMap[String(r._id)] = { avgRating: r.avgRating, reviewCount: r.reviewCount };

      const enriched = products.map((p) => {
        const id = String(p._id);
        const r = ratingMap[id];
        return enrichListingProduct({
          ...p,
          _id: id,
          avgRating: r ? +Number(r.avgRating).toFixed(1) : 0,
          reviewCount: r?.reviewCount ?? 0,
        });
      });

      return NextResponse.json(
        { success: true, data: enriched, total, page, totalPages: Math.ceil(total / limit) },
        { status: 200, headers: NO_STORE }
      );
    }

    // Fetch page of products, total count, and ratings — all in parallel
    const productsPromise = usePriceSort
      ? Product.aggregate([
          { $match: filter },
          {
            $addFields: {
              sortPrice: {
                $cond: [{ $gt: [{ $ifNull: ['$price', 0] }, 0] }, '$price', '$originalPrice'],
              },
            },
          },
          { $sort: { sortPrice: sortBy === 'price_desc' ? -1 : 1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'categories',
              localField: 'categories',
              foreignField: '_id',
              as: 'categoryDocs',
            },
          },
          {
            $project: {
              ...LISTING_PROJECTION,
              categories: {
                $map: {
                  input: '$categoryDocs',
                  as: 'c',
                  in: { title: '$$c.title', slug: '$$c.slug', sortOrder: { $ifNull: ['$$c.sortOrder', 0] } },
                },
              },
            },
          },
        ])
      : (() => {
          let query = Product.find(filter, LISTING_PROJECTION)
            .populate('categories', 'title slug sortOrder')
            .sort(sortOrder)
            .skip(skip)
            .limit(limit);
          if (useNameCollation) {
            query = query.collation({ locale: 'en', strength: 2 });
          }
          return query.lean();
        })();

    const [productsResult, totalResult, ratings] = await Promise.all([
      productsPromise,
      Product.countDocuments(filter),
      ratingsPromise,
    ]);

    const total = totalResult;

    const ratingMap: Record<string, { avgRating: number; reviewCount: number }> = {};
    for (const r of ratings) ratingMap[String(r._id)] = { avgRating: r.avgRating, reviewCount: r.reviewCount };

    const enriched = productsResult.map((p) => {
      const id = String(p._id);
      const r  = ratingMap[id];
      return enrichListingProduct({
        ...p,
        _id: id,
        avgRating: r ? +Number(r.avgRating).toFixed(1) : 0,
        reviewCount: r?.reviewCount ?? 0,
      });
    });

    return NextResponse.json(
      { success: true, data: enriched, total, page, totalPages: Math.ceil(total / limit) },
      { status: 200, headers: NO_STORE }
    );
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
