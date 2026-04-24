import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { extractToken, verifyToken } from '@/utils/jwt.util';

/** Verify the request has a valid admin JWT. Returns the decoded payload or a 401/403 response. */
async function requireAdmin(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });

  try {
    const decoded = verifyToken(token);
    await connectDB();
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
    }
    return null; // authorised
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid or expired token.' }, { status: 401 });
  }
}

/** GET /api/admin/users — list all users with optional search & role filter */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role   = searchParams.get('role')   || 'all';
    const status = searchParams.get('status') || 'all';

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { fullName:    { $regex: search, $options: 'i' } },
        { email:       { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (role !== 'all') query.role = role;

    if (status === 'active')   query.isDisabled = false;
    if (status === 'inactive') query.isDisabled = true;

    const users = await User.find(query)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: { users } }, { status: 200 });
  } catch (error) {
    console.error('[admin/users GET]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
