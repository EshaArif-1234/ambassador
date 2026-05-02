import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import Review from '@/backend/models/Review.model';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type StarKey = 1 | 2 | 3 | 4 | 5;

interface RatingSummaryPayload {
  averageRating: number;
  reviewCount: number;
  byStar: Record<StarKey, number>;
}

/** GET /api/products/[id]/reviews — approved reviews aggregate (summary only) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    await connectDB();

    const rows = await Review.aggregate<{
      stat: { avg: number | null; total: number } | null;
      byStar: { _id: number; count: number }[];
    }>([
      { $match: { productId: new mongoose.Types.ObjectId(id), status: 'approved' } },
      {
        $facet: {
          overall: [
            { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } },
          ],
          byStar: [{ $group: { _id: '$rating', count: { $sum: 1 } } }],
        },
      },
      {
        $project: {
          stat: { $arrayElemAt: ['$overall', 0] },
          byStar: '$byStar',
        },
      },
    ]);

    const row = rows[0];
    const stat = row?.stat;
    const rawBy = (row?.byStar ?? []) as { _id: number; count: number }[];
    const byStar: Record<StarKey, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of rawBy) {
      const star = Math.min(5, Math.max(1, Math.round(Number(row._id)))) as StarKey;
      byStar[star] = (byStar[star] ?? 0) + row.count;
    }

    const total = Number(stat?.total ?? 0);
    const avgRaw = stat?.avg != null ? Number(stat.avg) : 0;
    const averageRating = total > 0 ? +avgRaw.toFixed(1) : 0;

    const data: RatingSummaryPayload = {
      averageRating,
      reviewCount: total,
      byStar,
    };

    return NextResponse.json(
      { success: true, data },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[GET /api/products/[id]/reviews]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
