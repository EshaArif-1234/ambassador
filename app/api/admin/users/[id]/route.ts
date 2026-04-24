import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { extractToken, verifyToken } from '@/utils/jwt.util';
import { sendAccountDisabledEmail, sendAccountEnabledEmail } from '@/utils/email.util';

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
    return null;
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid or expired token.' }, { status: 401 });
  }
}

/** PATCH /api/admin/users/[id] — disable or enable a user */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { isDisabled, disableReason, disableDescription } = body;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin accounts cannot be disabled.' },
        { status: 403 }
      );
    }

    // Use strict boolean so documents missing the field (undefined) are treated as not disabled
    const wasAlreadyDisabled = user.isDisabled === true;
    const beingEnabled       = isDisabled === false && wasAlreadyDisabled;
    const beingDisabled      = isDisabled === true  && !wasAlreadyDisabled;

    user.isDisabled         = typeof isDisabled === 'boolean' ? isDisabled : user.isDisabled;
    user.disableReason      = isDisabled ? (disableReason ?? '') : '';
    user.disableDescription = isDisabled ? (disableDescription ?? '') : '';
    await user.save({ validateBeforeSave: false });

    // Send notification email — never fail the request if email fails
    try {
      if (beingDisabled) {
        console.log('[admin/users PATCH] sending account-disabled email to', user.email);
        await sendAccountDisabledEmail(
          user.email,
          user.fullName,
          disableReason ?? 'other',
          disableDescription
        );
        console.log('[admin/users PATCH] account-disabled email sent');
      } else if (beingEnabled) {
        console.log('[admin/users PATCH] sending account-enabled email to', user.email);
        await sendAccountEnabledEmail(user.email, user.fullName);
        console.log('[admin/users PATCH] account-enabled email sent');
      } else {
        console.log('[admin/users PATCH] no email needed — wasAlreadyDisabled:', wasAlreadyDisabled, '| incomingIsDisabled:', isDisabled);
      }
    } catch (emailErr) {
      console.error('[admin/users PATCH] email send failed:', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: isDisabled
          ? 'User disabled and notified by email.'
          : 'User enabled and notified by email.',
        data: { user: user.toSafeObject() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[admin/users PATCH]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

/** DELETE /api/admin/users/[id] — permanently delete a user */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin accounts cannot be deleted.' },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'User deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[admin/users DELETE]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
