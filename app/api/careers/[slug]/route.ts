import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import CareerJob from '@/backend/models/CareerJob.model';
import { toCareerJob } from '@/backend/lib/careerJobs';

export const dynamic = 'force-dynamic';

/** Public single job by slug (active only) */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await connectDB();
    const { slug } = await params;
    const clean = slug.trim().toLowerCase();
    if (!clean) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    const doc = await CareerJob.findOne({ slug: clean, status: 'active' }).lean();
    if (!doc) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: toCareerJob(doc as never) });
  } catch (error) {
    console.error('[GET /api/careers/[slug]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
