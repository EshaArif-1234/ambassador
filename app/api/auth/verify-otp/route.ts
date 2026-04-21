import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { verifyOtp } from '@/utils/otp.util';
import { signToken, attachCookie } from '@/utils/jwt.util';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required.' },
        { status: 422 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+otp +otpExpiry'
    );

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json(
        { success: false, message: 'No OTP found. Please register again.' },
        { status: 400 }
      );
    }

    if (user.otpExpiry < new Date()) {
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const isValid = await verifyOtp(otp, user.otp);
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid OTP.' }, { status: 400 });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    const token = signToken(String(user._id));
    const response = NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully.',
        data: { token, user: user.toSafeObject() },
      },
      { status: 200 }
    );

    attachCookie(response, token);
    return response;
  } catch (error) {
    console.error('[verify-otp]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
