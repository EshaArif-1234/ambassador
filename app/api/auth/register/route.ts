import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { generateOtp, hashOtp, otpExpiry } from '@/utils/otp.util';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { fullName, email, phoneNumber, address, password, confirmPassword } = body;

    // ── Validation ────────────────────────────────────────────────────────
    const errors: Record<string, string> = {};

    if (!fullName?.trim()) errors.fullName = 'Full name is required.';
    if (!email?.trim()) errors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Invalid email address.';
    if (!phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(password)) errors.password = 'Password must contain at least one uppercase letter.';
    else if (!/[0-9]/.test(password)) errors.password = 'Password must contain at least one number.';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    // ── Check duplicate email ─────────────────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // ── Create user with hashed OTP ───────────────────────────────────────
    const plainOtp = generateOtp();
    const hashedOtp = await hashOtp(plainOtp);

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      address: address?.trim() ?? '',
      password,
      otp: hashedOtp,
      otpExpiry: otpExpiry(),
    });

    // In production: send plainOtp via email / SMS — do NOT return it.
    return NextResponse.json(
      {
        success: true,
        message: 'Account created. Please verify your email with the OTP.',
        data: {
          userId: user._id,
          email: user.email,
          otp: plainOtp, // ← REMOVE in production (send via email instead)
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
