import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/utils/jwt.util';
import connectDB from '@/backend/config/db';
import User, { IUser } from '@/backend/models/User.model';
import {
  isDashboardStaff,
  isManagerStatusChangeBlocked,
  isFullAdmin,
} from '@/utils/dashboardRoles';

export async function getAuthUser(req: NextRequest): Promise<IUser | null> {
  const token = extractToken(req);
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    await connectDB();
    return User.findById(decoded.id);
  } catch {
    return null;
  }
}

/** Admin or manager — read/write dashboard (subject to further checks). */
export async function requireDashboardStaff(req: NextRequest): Promise<NextResponse | null> {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated.' },
      { status: 401 },
    );
  }
  if (!isDashboardStaff(user.role)) {
    return NextResponse.json(
      { success: false, message: 'Dashboard access required.' },
      { status: 403 },
    );
  }
  return null;
}

/** Full admin only — delete, deactivate, user management, overview stats, settings. */
export async function requireFullAdmin(req: NextRequest): Promise<NextResponse | null> {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated.' },
      { status: 401 },
    );
  }
  if (!isFullAdmin(user.role)) {
    return NextResponse.json(
      { success: false, message: 'Admin access required.' },
      { status: 403 },
    );
  }
  return null;
}

/**
 * Block managers from changing active/inactive status (any toggle or status field on update).
 * Call after parsing the request body.
 */
export async function rejectManagerStatusChange(
  req: NextRequest,
  body: Record<string, unknown>,
  options?: { isCreate?: boolean },
): Promise<NextResponse | null> {
  if (!isManagerStatusChangeBlocked(body, options)) return null;
  return requireFullAdmin(req);
}

/** @deprecated Use rejectManagerStatusChange */
export async function rejectManagerDeactivation(
  req: NextRequest,
  body: Record<string, unknown>,
): Promise<NextResponse | null> {
  return rejectManagerStatusChange(req, body);
}

/**
 * Verifies the request carries a valid JWT for dashboard staff (admin or manager).
 * Returns null if auth is OK, or a ready-to-return NextResponse on failure.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  return requireDashboardStaff(req);
}
