import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/utils/jwt.util';
import connectDB from '../config/db';
import User from '../models/User.model';

type RouteHandler = (
  req: NextRequest,
  context?: unknown
) => Promise<NextResponse>;

/**
 * Higher-order function that wraps a route handler with JWT authentication.
 * Reads the token from Authorization: Bearer header (fallback: httpOnly cookie),
 * verifies it, loads the user, and injects it into the request as req.user.
 *
 * Usage:
 *   export const GET = protect(async (req) => { ... req.user ... });
 */
export const protect = (handler: RouteHandler): RouteHandler => {
  return async (req: NextRequest, context?: unknown) => {
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

      (req as NextRequest & { user: typeof user }).user = user;

      return handler(req, context);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token. Please log in again.' },
        { status: 401 }
      );
    }
  };
};
