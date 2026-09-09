import { after, NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import CareerJob from '@/backend/models/CareerJob.model';
import {
  getContactInboxEmail,
  sendJobApplicationConfirmationEmail,
  sendJobApplicationInquiryEmail,
  type JobApplicationPayload,
} from '@/utils/email.util';

export const dynamic = 'force-dynamic';

function validatePayload(body: Record<string, unknown>): {
  data?: JobApplicationPayload;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const jobSlug = typeof body.jobSlug === 'string' ? body.jobSlug.trim().toLowerCase() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  const experience = typeof body.experience === 'string' ? body.experience.trim() : '';
  const linkedIn = typeof body.linkedIn === 'string' ? body.linkedIn.trim() : '';
  const coverLetter = typeof body.coverLetter === 'string' ? body.coverLetter.trim() : '';

  if (!jobSlug) errors.jobSlug = 'Invalid job posting.';
  if (!name || name.length < 2) errors.name = 'Please enter your full name.';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (!phone || phone.length < 7) errors.phone = 'Please enter a valid phone number.';
  if (!city || city.length < 2) errors.city = 'Please enter your city.';
  if (!coverLetter || coverLetter.length < 20) {
    errors.coverLetter = 'Cover letter must be at least 20 characters.';
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    data: {
      jobId: typeof body.jobId === 'string' ? body.jobId : '',
      jobSlug,
      jobTitle: typeof body.jobTitle === 'string' ? body.jobTitle : '',
      jobDepartment: '',
      jobLocation: '',
      name,
      email,
      phone,
      city,
      experience: experience || undefined,
      linkedIn: linkedIn || undefined,
      coverLetter,
    },
    errors,
  };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { data, errors } = validatePayload(body);

    if (!data) {
      const firstError = Object.values(errors)[0] ?? 'Please check the form and try again.';
      return NextResponse.json({ success: false, message: firstError, errors }, { status: 422 });
    }

    const job = await CareerJob.findOne({ slug: data.jobSlug, status: 'active' }).lean();
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'This job is no longer available.' },
        { status: 404 },
      );
    }

    const payload: JobApplicationPayload = {
      ...data,
      jobId: String(job._id),
      jobTitle: job.title,
      jobDepartment: job.department,
      jobLocation: job.location,
    };

    await sendJobApplicationInquiryEmail(payload);

    after(async () => {
      try {
        await sendJobApplicationConfirmationEmail(payload);
      } catch (confirmErr) {
        console.warn('[careers/apply] confirmation email failed:', confirmErr);
      }
    });

    const inbox = getContactInboxEmail();
    return NextResponse.json(
      {
        success: true,
        message: `Your application for "${job.title}" was submitted successfully. Our HR team at ${inbox} will contact you soon.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[careers/apply]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to submit your application right now. Please try again or email info@ambassador.pk.',
      },
      { status: 500 },
    );
  }
}
