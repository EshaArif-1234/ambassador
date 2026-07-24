import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import { listActiveSpareParts } from '@/backend/lib/spareParts';

export const dynamic = 'force-dynamic';

/** GET /api/spare-parts — public storefront listing */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(48, parseInt(searchParams.get('limit') ?? '12', 10));

    const result = await listActiveSpareParts({ search, page, limit });

    return NextResponse.json(
      { success: true, ...result },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[GET /api/spare-parts]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
