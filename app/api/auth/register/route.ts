import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { generateOtp, hashOtp, otpExpiry } from '@/utils/otp.util';
import { sendVerificationEmail } from '@/utils/email.util';
import {
  validateFullName,
  validateEmail,
  validatePasswordForApi,
  validateConfirmPassword,
} from '@/utils/authValidation.util';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const fullName = typeof body.fullName === 'string' ? body.fullName : '';
    const email = typeof body.email === 'string' ? body.email : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

    const errors: Record<string, string> = {};

    const fullNameErr = validateFullName(fullName);
    if (fullNameErr) errors.fullName = fullNameErr.endsWith('.') ? fullNameErr : `${fullNameErr}.`;

    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr.endsWith('.') ? emailErr : `${emailErr}.`;

    const passwordErr = validatePasswordForApi(password);
    if (passwordErr) errors.password = passwordErr;

    const confirmErr = validateConfirmPassword(password, confirmPassword);
    if (confirmErr) errors.confirmPassword = confirmErr.endsWith('.') ? confirmErr : `${confirmErr}.`;

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing?.isVerified) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const plainOtp = generateOtp();
    const hashedOtp = await hashOtp(plainOtp);

    let user = existing;

    if (user) {
      user.fullName = fullName.trim();
      user.password = password;
      user.otp = hashedOtp;
      user.otpExpiry = otpExpiry();
      user.isVerified = false;
    } else {
      user = new User({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        otp: hashedOtp,
        otpExpiry: otpExpiry(),
      });
    }

    await user.save();
    await sendVerificationEmail(user.email, user.fullName, plainOtp);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created. A verification code has been sent to your email.',
        data: { userId: user._id, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
