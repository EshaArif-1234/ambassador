import { NextRequest, NextResponse } from 'next/server';
import {
  sendContactConfirmationEmail,
  sendContactInquiryEmail,
  type ContactFormPayload,
} from '@/utils/email.util';

const ALLOWED_SUBJECTS = new Set([
  'product-inquiry',
  'technical-support',
  'sales',
  'service',
  'custom-kitchen',
  'other',
]);

function validatePayload(body: Record<string, unknown>): { data?: ContactFormPayload; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length < 2) errors.name = 'Please enter your full name.';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (!subject || !ALLOWED_SUBJECTS.has(subject)) errors.subject = 'Please select a subject.';
  if (!message || message.length < 10) errors.message = 'Message must be at least 10 characters.';

  if (Object.keys(errors).length > 0) return { errors };

  return {
    data: { name, email, phone, subject, message },
    errors,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, errors } = validatePayload(body);

    if (!data) {
      return NextResponse.json(
        { success: false, message: 'Please fix the errors below.', errors },
        { status: 422 }
      );
    }

    await sendContactInquiryEmail(data);

    try {
      await sendContactConfirmationEmail(data);
    } catch (confirmErr) {
      console.warn('[contact] confirmation email failed:', confirmErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for reaching out! Our team will get back to you within 24 hours.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[contact]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to send your message right now. Please try again or email us at info@ambassador.pk.',
      },
      { status: 500 }
    );
  }
}
