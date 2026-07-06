import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Product from '@/backend/models/Product.model';
import Review from '@/backend/models/Review.model';
import {
  resolveProductCategoryIds,
  validateProductTaxonomy,
  toObjectIdArray,
} from '@/backend/lib/productTaxonomy';
import {
  sanitizeProductFeatures,
  sanitizeProductBrands,
} from '@/backend/lib/productMarketingFields';
import { requireAdmin } from '@/backend/lib/adminAuth';
import mongoose from 'mongoose';

const ADMIN_PAGE_LIMIT = 10;

// Fields needed by the admin product listing table
const ADMIN_LIST_PROJECTION = {
  name: 1, slug: 1, price: 1, originalPrice: 1,
  stock: 1, status: 1, brands: 1, features: 1,
  categories: 1, images: { $slice: 1 }, createdAt: 1,
};

/** GET /api/admin/products?page=1&limit=10&search=...&status=...&category=...&stock=... */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search     = searchParams.get('search')   ?? '';
    const status     = searchParams.get('status')   ?? 'all';
    const stock      = searchParams.get('stock')    ?? 'all';
    const categoryId = searchParams.get('category') ?? '';
    const page       = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10));
    const limit      = Math.min(50, parseInt(searchParams.get('limit') ?? String(ADMIN_PAGE_LIMIT), 10));
    const skip       = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      const orConditions: Record<string, unknown>[] = [
        { name: { $regex: trimmedSearch, $options: 'i' } },
        { slug: { $regex: trimmedSearch, $options: 'i' } },
      ];

      if (
        mongoose.Types.ObjectId.isValid(trimmedSearch) &&
        String(new mongoose.Types.ObjectId(trimmedSearch)) === trimmedSearch
      ) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(trimmedSearch) });
      } else if (/^[a-f0-9]{4,24}$/i.test(trimmedSearch)) {
        orConditions.push({
          $expr: {
            $regexMatch: {
              input: { $toString: '$_id' },
              regex: trimmedSearch,
              options: 'i',
            },
          },
        });
      }

      filter.$or = orConditions;
    }
    if (status !== 'all') filter.status = status;
    if (categoryId) filter.categories = categoryId;
    if (stock === 'in_stock') filter.stock = { $gt: 0 };
    if (stock === 'out_of_stock') filter.stock = { $lte: 0 };

    // Fetch products, total count, and ratings all in parallel
    const [products, total, ratings] = await Promise.all([
      Product.find(filter, ADMIN_LIST_PROJECTION)
        .populate('categories', 'title')
        .sort({ createdAt: -1 })
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

    const enriched = products.map((p) => ({
      ...p,
      avgRating:   +(ratingMap[String(p._id)]?.avgRating   ?? 0).toFixed(1),
      reviewCount:   ratingMap[String(p._id)]?.reviewCount ?? 0,
    }));

    return NextResponse.json(
      { success: true, data: enriched, total, page, totalPages: Math.ceil(total / limit) },
      { status: 200 }
    );
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
      name,
      price,
      originalPrice,
      stock,
      status,
      about,
      images,
      imagePublicIds,
      videos,
      videoPublicIds,
      specifications,
      specificationOrder,
      metaTitle,
      metaDescription,
      features,
      brands,
    } = body;

    const categoryIds = resolveProductCategoryIds(body);

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'Product name is required.' }, { status: 400 });
    }
    if (!categoryIds) {
      return NextResponse.json({ success: false, message: 'At least one category is required.' }, { status: 400 });
    }

    const tax = await validateProductTaxonomy(categoryIds);
    if (!tax.ok) {
      return NextResponse.json({ success: false, message: tax.message }, { status: tax.status });
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
      name: name.trim(),
      categories: toObjectIdArray(categoryIds),
      ...(price ? { price: Number(price) } : {}),
      originalPrice: Number(originalPrice),
      stock: Number(stock ?? 0),
      status: status ?? 'active',
      about: about?.trim() ?? '',
      images: images ?? [],
      imagePublicIds: imagePublicIds ?? [],
      videos: videos ?? [],
      videoPublicIds: videoPublicIds ?? [],
      specifications: specifications ?? {},
      specificationOrder: Array.isArray(specificationOrder)
        ? specificationOrder.map((k: unknown) => String(k).trim()).filter(Boolean)
        : [],
      metaTitle: metaTitle?.trim() ?? '',
      metaDescription: metaDescription?.trim() ?? '',
      features: sanitizeProductFeatures(features),
      brands: sanitizeProductBrands(brands),
    });

    const populated = await product.populate([{ path: 'categories', select: 'title' }]);

    return NextResponse.json(
      { success: true, message: 'Product created successfully.', data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/admin/products]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
