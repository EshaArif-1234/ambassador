import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { signToken, attachCookie } from '@/utils/jwt.util';
import { MANAGER_EMAIL, isDashboardStaff } from '@/utils/dashboardRoles';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 422 }
      );
    }

    // Explicitly select password (marked select: false in schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (user.authProvider === 'google') {
      return NextResponse.json(
        {
          success: false,
          message: 'This account uses Google sign-in. Click "Continue with Google" below.',
        },
        { status: 401 }
      );
    }

    if (!(await user.comparePassword(password))) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { success: false, message: 'Email not verified. Please verify your account first.' },
        { status: 403 }
      );
    }

    if (user.isDisabled) {
      return NextResponse.json(
        { success: false, message: 'Your account has been disabled. Please contact support.' },
        { status: 403 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail === MANAGER_EMAIL && !isDashboardStaff(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'This email is not configured for dashboard access. Ask an administrator to run create:manager.',
        },
        { status: 403 },
      );
    }

    // Track last login time
    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const token = signToken(String(user._id));
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged in successfully.',
        data: { token, user: user.toSafeObject() },
      },
      { status: 200 }
    );

    attachCookie(response, token);
    return response;
  } catch (error) {
    console.error('[login]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
