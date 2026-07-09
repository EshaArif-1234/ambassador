import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { requireAuthUser, userIdFromJwtPayload } from '@/utils/authSession.util';
import { extractToken, verifyToken, sessionExpiresAtMs } from '@/utils/jwt.util';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please log in.' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token. Please log in again.' },
        { status: 401 }
      );
    }

    const userId = userIdFromJwtPayload(decoded);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid session token.' },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(userId);

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
        data: {
          user: user.toSafeObject(),
          sessionExpiresAt: sessionExpiresAtMs(decoded),
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store, private' } }
    );
  } catch (error) {
    console.error('[auth/me GET]', error);
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token. Please log in again.' },
      { status: 401 }
    );
  }
}

/** PATCH /api/auth/me — let the authenticated user update their own profile */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuthUser(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));

    await connectDB();
    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User no longer exists.' },
        { status: 401 }
      );
    }

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
