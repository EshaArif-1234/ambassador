import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import CareerJob from '@/backend/models/CareerJob.model';
import { parseStringList, toCareerJob } from '@/backend/lib/careerJobs';
import { requireAdmin, requireFullAdmin, rejectManagerStatusChange } from '@/backend/lib/adminAuth';
import { JOB_TYPES, WORK_ENVIRONMENTS, type JobType, type WorkEnvironment } from '@/lib/careers.types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid id.' }, { status: 400 });
    }

    const doc = await CareerJob.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: toCareerJob(doc as never) });
  } catch (error) {
    console.error('[GET /api/admin/careers/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid id.' }, { status: 400 });
    }

    const body = await req.json();
    const deactivateError = await rejectManagerStatusChange(req, body);
    if (deactivateError) return deactivateError;

    const doc = await CareerJob.findById(id);
    if (!doc) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        return NextResponse.json({ success: false, message: 'Title cannot be empty.' }, { status: 400 });
      }
      doc.title = title;
    }
    if (body.department !== undefined) doc.department = String(body.department).trim();
    if (body.location !== undefined) doc.location = String(body.location).trim();
    if (body.city !== undefined) doc.city = String(body.city).trim();
    if (body.type !== undefined) {
      const type = String(body.type).trim();
      if (!JOB_TYPES.includes(type as JobType)) {
        return NextResponse.json({ success: false, message: 'Invalid position type.' }, { status: 400 });
      }
      doc.type = type as JobType;
    }
    if (body.workEnvironment !== undefined) {
      const env = String(body.workEnvironment).trim();
      if (!WORK_ENVIRONMENTS.includes(env as WorkEnvironment)) {
        return NextResponse.json({ success: false, message: 'Invalid work environment.' }, { status: 400 });
      }
      doc.workEnvironment = env as WorkEnvironment;
    }
    if (body.educationLevel !== undefined) doc.educationLevel = String(body.educationLevel).trim();
    if (body.summary !== undefined) doc.summary = String(body.summary).trim();
    if (body.description !== undefined) doc.description = String(body.description).trim();
    if (body.responsibilities !== undefined) doc.responsibilities = parseStringList(body.responsibilities);
    if (body.requirements !== undefined) doc.requirements = parseStringList(body.requirements);
    if (body.isHot !== undefined) doc.isHot = body.isHot === true;
    if (body.status !== undefined) doc.status = body.status === 'inactive' ? 'inactive' : 'active';

    await doc.save();

    return NextResponse.json(
      { success: true, message: 'Job updated.', data: toCareerJob(doc) },
      { status: 200 },
    );
  } catch (error) {
    console.error('[PATCH /api/admin/careers/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireFullAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid id.' }, { status: 400 });
    }

    const deleted = await CareerJob.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Job deleted.' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/admin/careers/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
