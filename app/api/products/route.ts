import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import Product from '@/backend/models/Product.model';
import Category from '@/backend/models/Category.model';
import Review from '@/backend/models/Review.model';
import { migrateLegacyProductTaxonomy } from '@/backend/lib/migrateProductTaxonomy';

export const dynamic = 'force-dynamic';

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** GET /api/products — public catalog (active products only) */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Migration runs at most once per process (not on every request)
    await migrateLegacyProductTaxonomy(Product.collection);

    const { searchParams } = new URL(req.url);
    const search        = (searchParams.get('search')   ?? '').trim();
    const categoryTitle = (searchParams.get('category') ?? '').trim();

    const filter: Record<string, unknown> = { status: 'active' };

    if (search) {
      filter.name = { $regex: escapeRegex(search), $options: 'i' };
    }

    if (categoryTitle) {
      const cats = await Category.find({
        title: new RegExp(`^${escapeRegex(categoryTitle)}$`, 'i'),
        $nor: [{ status: { $regex: /^inactive$/i } }],
      }).select('_id').lean();

      if (!cats.length) {
        return NextResponse.json(
          { success: true, data: [] },
          { status: 200, headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
        );
      }
      filter.categories = { $in: cats.map((c) => c._id) };
    }

    // Run products fetch and ratings aggregation in parallel
    const [products, ratings] = await Promise.all([
      Product.find(filter)
        .populate('categories', 'title slug')
        .sort({ createdAt: -1 })
        .lean(),
      Review.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
      ]),
    ]);

    const ratingMap: Record<string, { avgRating: number; reviewCount: number }> = {};
    for (const r of ratings) {
      ratingMap[String(r._id)] = { avgRating: r.avgRating, reviewCount: r.reviewCount };
    }

    const enriched = products.map((p) => {
      const id = String(p._id);
      const r  = ratingMap[id];
      return {
        ...p,
        _id:         id,
        avgRating:   r ? +Number(r.avgRating).toFixed(1) : 0,
        reviewCount: r?.reviewCount ?? 0,
      };
    });

    return NextResponse.json(
      { success: true, data: enriched },
      {
        status: 200,
        headers: {
          // Cache for 30 s on CDN/browser; serve stale for up to 60 s while revalidating
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
