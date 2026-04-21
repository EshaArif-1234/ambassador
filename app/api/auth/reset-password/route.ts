import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { verifyOtp } from '@/utils/otp.util';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, otp, newPassword } = await req.json();

    const errors: Record<string, string> = {};
    if (!email) errors.email = 'Email is required.';
    if (!otp) errors.otp = 'OTP is required.';
    if (!newPassword) errors.newPassword = 'New password is required.';
    else if (newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(newPassword)) errors.newPassword = 'Password must contain at least one uppercase letter.';
    else if (!/[0-9]/.test(newPassword)) errors.newPassword = 'Password must contain at least one number.';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+otp +otpExpiry'
    );

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json(
        { success: false, message: 'No reset request found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (user.otpExpiry < new Date()) {
      return NextResponse.json({ success: false, message: 'OTP has expired.' }, { status: 400 });
    }

    const isValid = await verifyOtp(otp, user.otp);
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid OTP.' }, { status: 400 });
    }

    user.password = newPassword; // pre-save hook hashes it
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { success: true, message: 'Password reset successfully. Please log in.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[reset-password]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
