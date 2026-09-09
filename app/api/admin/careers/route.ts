import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import CareerJob from '@/backend/models/CareerJob.model';
import { parseStringList, toCareerJob } from '@/backend/lib/careerJobs';
import { requireAdmin, rejectManagerStatusChange } from '@/backend/lib/adminAuth';
import { JOB_TYPES, WORK_ENVIRONMENTS, type JobType, type WorkEnvironment } from '@/lib/careers.types';

function validateJobBody(body: Record<string, unknown>, isCreate: boolean) {
  const errors: Record<string, string> = {};

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const department = typeof body.department === 'string' ? body.department.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  const type = typeof body.type === 'string' ? body.type.trim() : '';
  const workEnvironment = typeof body.workEnvironment === 'string' ? body.workEnvironment.trim() : '';
  const educationLevel = typeof body.educationLevel === 'string' ? body.educationLevel.trim() : '';
  const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const responsibilities = parseStringList(body.responsibilities);
  const requirements = parseStringList(body.requirements);
  const isHot = body.isHot === true;
  const status = body.status === 'inactive' ? 'inactive' : 'active';

  if (isCreate && !title) errors.title = 'Job title is required.';
  if (isCreate && !department) errors.department = 'Department is required.';
  if (isCreate && !location) errors.location = 'Location is required.';
  if (isCreate && !city) errors.city = 'City is required.';
  if (isCreate && !JOB_TYPES.includes(type as JobType)) errors.type = 'Valid position type is required.';
  if (isCreate && !WORK_ENVIRONMENTS.includes(workEnvironment as WorkEnvironment)) {
    errors.workEnvironment = 'Valid work environment is required.';
  }
  if (isCreate && !educationLevel) errors.educationLevel = 'Education level is required.';
  if (isCreate && !summary) errors.summary = 'Summary is required.';
  if (isCreate && !description) errors.description = 'Description is required.';
  if (isCreate && responsibilities.length === 0) {
    errors.responsibilities = 'Add at least one responsibility.';
  }
  if (isCreate && requirements.length === 0) {
    errors.requirements = 'Add at least one requirement.';
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    data: {
      title,
      department,
      location,
      city,
      type: type as JobType,
      workEnvironment: workEnvironment as WorkEnvironment,
      educationLevel,
      summary,
      description,
      responsibilities,
      requirements,
      isHot,
      status,
    },
    errors,
  };
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() ?? '';

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const docs = await CareerJob.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: docs.map((d) => toCareerJob(d as never)) });
  } catch (error) {
    console.error('[GET /api/admin/careers]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await req.json();
    const deactivateError = await rejectManagerStatusChange(req, body, { isCreate: true });
    if (deactivateError) return deactivateError;

    const { data, errors } = validateJobBody(body, true);
    if (!data) {
      const firstError = Object.values(errors)[0] ?? 'Please check the form.';
      return NextResponse.json({ success: false, message: firstError, errors }, { status: 422 });
    }

    const doc = await CareerJob.create(data);
    return NextResponse.json(
      { success: true, message: 'Job created.', data: toCareerJob(doc) },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/admin/careers]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
