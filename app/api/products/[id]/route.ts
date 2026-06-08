import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Product from '@/backend/models/Product.model';
import Review from '@/backend/models/Review.model';
import { resolveProductImages, resolveProductVideos } from '@/utils/productMedia.util';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** GET /api/products/[id] — single active product + approved reviews */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    await connectDB();

    const product = await Product.findOne({ _id: id, status: 'active' })
      .populate('categories', 'title slug')
      .lean();

    if (!product) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    const reviews = await Review.find({ productId: id, status: 'approved' })
      .sort({ createdAt: -1 })
      .select('reviewerName rating comment createdAt')
      .lean();

    const agg = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(id), status: 'approved' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);
    const avgRating = agg[0] ? +Number(agg[0].avgRating).toFixed(1) : 0;
    const reviewCount = agg[0]?.reviewCount ?? 0;

    const images = resolveProductImages({
      images: product.images,
      imagePublicIds: product.imagePublicIds,
    });
    const videos = resolveProductVideos({
      videos: product.videos,
      videoPublicIds: product.videoPublicIds,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          product: {
            ...product,
            _id: String(product._id),
            images,
            videos,
            imagePublicIds: product.imagePublicIds ?? [],
            videoPublicIds: product.videoPublicIds ?? [],
            avgRating,
            reviewCount,
          },
          reviews: reviews.map((r) => ({
            _id: String(r._id),
            name: r.reviewerName,
            rating: r.rating,
            comment: r.comment,
            date: r.createdAt,
          })),
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[GET /api/products/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
