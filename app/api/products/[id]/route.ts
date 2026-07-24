import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Review from '@/backend/models/Review.model';
import {
  findActiveProductByIdentifier,
  findInactiveProductByIdentifier,
} from '@/backend/lib/findPublicProduct';
import { resolveProductImages, resolveProductVideos } from '@/utils/productMedia.util';
import { orderProductSpecifications } from '@/lib/productSpecifications';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

/** GET /api/products/[id] — single active product by Mongo _id or slug */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Product not found.', code: 'not_found' },
        { status: 404, headers: NO_STORE }
      );
    }

    await connectDB();

    const product = await findActiveProductByIdentifier(id);
    if (!product) {
      const inactive = await findInactiveProductByIdentifier(id);
      if (inactive) {
        return NextResponse.json(
          {
            success: false,
            message: 'This product is no longer available.',
            code: 'unavailable',
          },
          { status: 404, headers: NO_STORE }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Product not found.', code: 'not_found' },
        { status: 404, headers: NO_STORE }
      );
    }

    const productId = String(product._id);

    const reviews = await Review.find({ productId, status: 'approved' })
      .sort({ createdAt: -1 })
      .select('reviewerName rating comment createdAt')
      .lean();

    const agg = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
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

    const specifications = orderProductSpecifications(
      (product.specifications as Record<string, string>) ?? {},
      Array.isArray(product.specificationOrder) ? product.specificationOrder : undefined,
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          product: {
            ...product,
            _id: productId,
            images,
            videos,
            specifications,
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
      { status: 200, headers: NO_STORE }
    );
  } catch (error) {
    console.error('[GET /api/products/[id]]', error);
    return NextResponse.json(
      { success: false, message: 'Server error.' },
      { status: 500, headers: NO_STORE }
    );
  }
}
