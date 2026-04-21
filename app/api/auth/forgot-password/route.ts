import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { generateOtp, hashOtp, otpExpiry } from '@/utils/otp.util';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required.' },
        { status: 422 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Generic response — do not reveal whether the email exists
      return NextResponse.json(
        { success: true, message: 'If that email exists, a reset OTP has been sent.' },
        { status: 200 }
      );
    }

    const plainOtp = generateOtp();
    user.otp = await hashOtp(plainOtp);
    user.otpExpiry = otpExpiry();
    await user.save({ validateBeforeSave: false });

    // In production: send plainOtp via email / SMS — do NOT return it.
    return NextResponse.json(
      {
        success: true,
        message: 'Password reset OTP generated.',
        data: { otp: plainOtp }, // ← REMOVE in production
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[forgot-password]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
