import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, clearCookie, extractToken } from '@/utils/jwt.util';

export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    verifyToken(token); // throws if invalid/expired

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully.' },
      { status: 200 }
    );

    clearCookie(response);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token.' },
      { status: 401 }
    );
  }
}
