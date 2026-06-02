import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { verifyToken, extractToken } from '@/utils/jwt.util';

/** POST /api/auth/change-password — authenticated user changes their own password */
export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please log in.' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    const { oldPassword, newPassword } = await req.json().catch(() => ({}));

    const errors: Record<string, string> = {};
    if (!oldPassword) errors.oldPassword = 'Current password is required.';
    if (!newPassword) errors.newPassword = 'New password is required.';
    else if (newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(newPassword)) errors.newPassword = 'Password must contain at least one uppercase letter.';
    else if (!/[a-z]/.test(newPassword)) errors.newPassword = 'Password must contain at least one lowercase letter.';
    else if (!/[0-9]/.test(newPassword)) errors.newPassword = 'Password must contain at least one number.';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    await connectDB();

    // password has select:false — explicitly include it
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User no longer exists.' }, { status: 401 });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Your current password is incorrect.', errors: { oldPassword: 'Incorrect password.' } },
        { status: 400 }
      );
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from the current password.', errors: { newPassword: 'Choose a different password.' } },
        { status: 400 }
      );
    }

    user.password = newPassword; // pre-save hook hashes it
    await user.save();

    return NextResponse.json(
      { success: true, message: 'Password changed successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[change-password]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
