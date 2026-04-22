import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { generateOtp, hashOtp, otpExpiry } from '@/utils/otp.util';
import { sendVerificationEmail } from '@/utils/email.util';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { fullName, email, phoneNumber, address, password } = body;

    // ── Validation ────────────────────────────────────────────────────────
    // confirmPassword is validated on the frontend only — backend just validates the password itself
    const errors: Record<string, string> = {};

    if (!fullName?.trim()) errors.fullName = 'Full name is required.';
    if (!email?.trim()) errors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Invalid email address.';
    if (!phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(password)) errors.password = 'Password must contain at least one uppercase letter.';
    else if (!/[0-9]/.test(password)) errors.password = 'Password must contain at least one number.';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    // ── Check duplicate email ─────────────────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing?.isVerified) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // ── Create or update user ─────────────────────────────────────────────
    // Using save() so the pre-save hook runs and hashes the password correctly.
    // findOneAndUpdate bypasses Mongoose middleware, which would store plain-text passwords.
    const plainOtp = generateOtp();
    const hashedOtp = await hashOtp(plainOtp);

    let user = existing; // existing unverified user

    if (user) {
      // Refresh fields on existing unverified account
      user.fullName    = fullName.trim();
      user.phoneNumber = phoneNumber.trim();
      user.address     = address?.trim() ?? '';
      user.password    = password; // pre-save hook will hash this
      user.otp         = hashedOtp;
      user.otpExpiry   = otpExpiry();
      user.isVerified  = false;
    } else {
      // Brand-new account
      user = new User({
        fullName:    fullName.trim(),
        email:       email.toLowerCase().trim(),
        phoneNumber: phoneNumber.trim(),
        address:     address?.trim() ?? '',
        password,    // pre-save hook will hash this
        otp:         hashedOtp,
        otpExpiry:   otpExpiry(),
      });
    }

    await user.save();

    // Send OTP to user's email
    await sendVerificationEmail(user.email, user.fullName, plainOtp);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created. A verification code has been sent to your email.',
        data: {
          userId: user._id,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
