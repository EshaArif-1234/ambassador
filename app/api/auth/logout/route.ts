import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, clearCookie, extractToken } from '@/utils/jwt.util';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully.' },
      { status: 200 }
    );

    clearCookie(response);

    const token = extractToken(req);
    if (token) {
      try {
        verifyToken(token);
      } catch {
        // Cookie cleared even when token already expired
      }
    }

    return response;
  } catch {
    const response = NextResponse.json(
      { success: false, message: 'Logout failed.' },
      { status: 500 }
    );
    clearCookie(response);
    return response;
  }
}
