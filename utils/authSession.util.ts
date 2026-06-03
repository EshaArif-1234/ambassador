import type { NextRequest } from 'next/server';
import type { JwtPayload } from 'jsonwebtoken';
import connectDB from '@/backend/config/db';
import User, { type IUser } from '@/backend/models/User.model';
import { extractToken, verifyToken } from '@/utils/jwt.util';

export type AuthUserLean = Pick<IUser, '_id' | 'email' | 'fullName' | 'role'> & {
  _id: IUser['_id'];
};

/** Read user id from JWT payload (supports legacy `sub` claims). */
export function userIdFromJwtPayload(decoded: JwtPayload): string | null {
  if (typeof decoded.id === 'string' && decoded.id.trim()) return decoded.id.trim();
  if (typeof decoded.sub === 'string' && decoded.sub.trim()) return decoded.sub.trim();
  return null;
}

export function getUserIdFromRequest(req: NextRequest): string | null {
  const token = extractToken(req);
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    return userIdFromJwtPayload(decoded);
  } catch {
    return null;
  }
}

export type RequireAuthResult =
  | { ok: true; userId: string; user: AuthUserLean }
  | { ok: false; status: 401 | 403; message: string };

/** Load authenticated user from cookie / Bearer token. */
export async function requireAuthUser(req: NextRequest): Promise<RequireAuthResult> {
  const token = extractToken(req);
  if (!token) {
    return { ok: false, status: 401, message: 'Not authenticated.' };
  }

  let decoded: JwtPayload;
  try {
    decoded = verifyToken(token);
  } catch {
    return { ok: false, status: 401, message: 'Invalid or expired session. Please log in again.' };
  }

  const userId = userIdFromJwtPayload(decoded);
  if (!userId) {
    return { ok: false, status: 401, message: 'Invalid session token.' };
  }

  await connectDB();
  const user = await User.findById(userId).select('email fullName role isDisabled').lean();
  if (!user) {
    return { ok: false, status: 401, message: 'User not found.' };
  }

  if ('isDisabled' in user && user.isDisabled) {
    return { ok: false, status: 403, message: 'Your account has been disabled.' };
  }

  return { ok: true, userId, user: user as AuthUserLean };
}

/** Mongo filter: orders belonging to this account (email + optional userId link). */
export function ordersFilterForUser(user: { _id: unknown; email: string }) {
  const email = user.email.trim().toLowerCase();
  const clauses: Record<string, unknown>[] = [{ customerEmail: email }];
  if (user._id) {
    clauses.push({ userId: user._id });
  }
  return clauses.length === 1 ? clauses[0] : { $or: clauses };
}

export function orderBelongsToUser(
  order: { customerEmail?: string; userId?: unknown },
  user: { _id: unknown; email: string }
): boolean {
  const email = user.email.trim().toLowerCase();
  if (order.customerEmail?.trim().toLowerCase() === email) return true;
  if (order.userId && user._id && String(order.userId) === String(user._id)) return true;
  return false;
}
