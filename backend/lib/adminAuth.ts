import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/utils/jwt.util';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';

/**
 * Verifies the request carries a valid JWT for an admin user.
 * Returns null if auth is OK, or a ready-to-return NextResponse on failure.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = extractToken(req);
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated.' },
      { status: 401 }
    );
  }

  try {
    const decoded = verifyToken(token);
    await connectDB();
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required.' },
        { status: 403 }
      );
    }
    return null;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token.' },
      { status: 401 }
    );
  }
}
