import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { verifyToken, extractToken } from '@/utils/jwt.util';

export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please log in.' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User no longer exists.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Authenticated user retrieved.',
        data: { user: user.toSafeObject() },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token. Please log in again.' },
      { status: 401 }
    );
  }
}

/** PATCH /api/auth/me — let the authenticated user update their own profile */
export async function PATCH(req: NextRequest) {
  try {
    const token = extractToken(req);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please log in.' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    const body = await req.json().catch(() => ({}));

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User no longer exists.' },
        { status: 401 }
      );
    }

    // Only allow self-editable fields
    if (typeof body.fullName === 'string' && body.fullName.trim()) {
      user.fullName = body.fullName.trim();
    }
    if (typeof body.phoneNumber === 'string') {
      user.phoneNumber = body.phoneNumber.trim();
    }
    if (typeof body.city === 'string') {
      user.city = body.city.trim();
    }
    if (typeof body.address === 'string') {
      user.address = body.address.trim();
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully.',
        data: { user: user.toSafeObject() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[auth/me PATCH]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
