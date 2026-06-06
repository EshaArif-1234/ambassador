import { after, NextRequest, NextResponse } from 'next/server';
import {
  getContactInboxEmail,
  sendContactConfirmationEmail,
  sendContactInquiryEmail,
  type ContactFormPayload,
} from '@/utils/email.util';

export const dynamic = 'force-dynamic';

const ALLOWED_SUBJECTS = new Set([
  'product-inquiry',
  'technical-support',
  'sales',
  'service',
  'custom-kitchen',
  'showroom-visit',
  'other',
]);

const SUCCESS_MESSAGES: Record<string, string> = {
  'showroom-visit':
    'Your showroom visit request was sent to info@ambassador.pk. Our team will confirm your appointment shortly.',
  default: 'Thank you for reaching out! Our team at info@ambassador.pk will get back to you within 24 hours.',
};

function validatePayload(body: Record<string, unknown>): { data?: ContactFormPayload; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  let message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length < 2) errors.name = 'Please enter your full name.';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (!subject || !ALLOWED_SUBJECTS.has(subject)) errors.subject = 'Please select a valid subject.';

  if (subject === 'showroom-visit') {
    const visitBranch = typeof body.visitBranch === 'string' ? body.visitBranch.trim() : '';
    const visitDate = typeof body.visitDate === 'string' ? body.visitDate.trim() : '';
    const visitTimeSlot = typeof body.visitTimeSlot === 'string' ? body.visitTimeSlot.trim() : '';

    if (!visitBranch) errors.visitBranch = 'Please select a branch.';
    if (!visitDate) errors.visitDate = 'Please select a preferred date.';
    if (!visitTimeSlot) errors.visitTimeSlot = 'Please select a time slot.';

    if (visitBranch && visitDate && visitTimeSlot) {
      message = [
        'Showroom visit request.',
        '',
        `Preferred branch: ${visitBranch}`,
        `Preferred date: ${visitDate}`,
        `Preferred time: ${visitTimeSlot}`,
      ].join('\n');
    }
  } else if (!message || message.length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  }

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
      const firstError = Object.values(errors)[0] ?? 'Please check the form and try again.';
      console.warn('[contact] validation failed:', errors);
      return NextResponse.json(
        { success: false, message: firstError, errors },
        { status: 422 }
      );
    }

    // Only block on the inbox email — confirmation runs after the response is sent
    await sendContactInquiryEmail(data);

    after(async () => {
      try {
        await sendContactConfirmationEmail(data);
      } catch (confirmErr) {
        console.warn('[contact] confirmation email failed:', confirmErr);
      }
    });

    const inbox = getContactInboxEmail();
    const successMessage =
      SUCCESS_MESSAGES[data.subject] ?? SUCCESS_MESSAGES.default.replace('info@ambassador.pk', inbox);

    return NextResponse.json({ success: true, message: successMessage }, { status: 200 });
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
