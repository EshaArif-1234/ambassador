import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import CareerJob from '@/backend/models/CareerJob.model';
import { toCareerJob } from '@/backend/lib/careerJobs';

export const dynamic = 'force-dynamic';

/** Public list of active job openings */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() ?? '';
    const city = searchParams.get('city')?.trim() ?? '';
    const department = searchParams.get('department')?.trim() ?? '';
    const type = searchParams.get('type')?.trim() ?? '';
    const workEnvironment = searchParams.get('workEnvironment')?.trim() ?? '';
    const education = searchParams.get('education')?.trim() ?? '';
    const hotOnly = searchParams.get('hot') === '1';

    const filter: Record<string, unknown> = { status: 'active' };

    if (city) filter.city = city;
    if (department) filter.department = department;
    if (type) filter.type = type;
    if (workEnvironment) filter.workEnvironment = workEnvironment;
    if (education) filter.educationLevel = education;
    if (hotOnly) filter.isHot = true;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const docs = await CareerJob.find(filter).sort({ isHot: -1, createdAt: -1 }).lean();
    const jobs = docs.map((d) => toCareerJob(d as never));

    const cities = [...new Set(jobs.map((j) => j.city))].sort();
    const departments = [...new Set(jobs.map((j) => j.department))].sort();
    const educationLevels = [...new Set(jobs.map((j) => j.educationLevel))].sort();

    return NextResponse.json({
      success: true,
      data: jobs,
      filters: { cities, departments, educationLevels },
    });
  } catch (error) {
    console.error('[GET /api/careers]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
