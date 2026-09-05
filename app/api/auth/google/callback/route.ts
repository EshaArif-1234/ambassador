import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import Order from '@/backend/models/Order.model';
import { signToken, attachCookie, authCookieOptions } from '@/utils/jwt.util';
import {
  getAppBaseUrlFromRequest,
  GOOGLE_OAUTH_REDIRECT_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  verifyGoogleAuthCode,
} from '@/utils/googleAuth.util';
import { dashboardHomePath, isDashboardStaff } from '@/utils/dashboardRoles';
import { getSafeRedirectPath } from '@/utils/safeRedirect.util';

function redirectTo(base: string, path: string, query?: Record<string, string>) {
  const url = new URL(path, base);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }
  return NextResponse.redirect(url.toString());
}

function clearOAuthStateCookie(response: NextResponse) {
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, '', authCookieOptions(0));
  response.cookies.set(GOOGLE_OAUTH_REDIRECT_COOKIE, '', authCookieOptions(0));
}

export async function GET(req: NextRequest) {
  const baseUrl = getAppBaseUrlFromRequest(req);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const cookieState = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    const res = redirectTo(baseUrl, '/login', { error: 'google_state_mismatch' });
    clearOAuthStateCookie(res);
    return res;
  }

  try {
    const profile = await verifyGoogleAuthCode(code, baseUrl);
    await connectDB();

    let user = await User.findOne({ googleId: profile.googleId });

    if (!user) {
      user = await User.findOne({ email: profile.email });
    }

    if (user) {
      if (user.role === 'admin' || user.role === 'manager') {
        const res = redirectTo(baseUrl, '/login', { error: 'google_admin_blocked' });
        clearOAuthStateCookie(res);
        return res;
      }

      if (user.isDisabled) {
        const res = redirectTo(baseUrl, '/login', { error: 'account_disabled' });
        clearOAuthStateCookie(res);
        return res;
      }

      user.googleId = profile.googleId;
      if (user.authProvider === 'local') {
        user.authProvider = 'both';
      } else if (user.authProvider !== 'both') {
        user.authProvider = 'google';
      }
      user.isVerified = true;
      user.lastLoginAt = new Date();
      if (!user.fullName?.trim()) {
        user.fullName = profile.fullName;
      }
      await user.save();
    } else {
      if (!profile.emailVerified) {
        const res = redirectTo(baseUrl, '/login', { error: 'google_email_unverified' });
        clearOAuthStateCookie(res);
        return res;
      }

      user = await User.create({
        fullName: profile.fullName,
        email: profile.email,
        googleId: profile.googleId,
        authProvider: 'google',
        isVerified: true,
        role: 'user',
      });
    }

    const token = signToken(String(user._id));
    await Order.updateMany(
      {
        customerEmail: user.email.trim().toLowerCase(),
        $or: [{ userId: { $exists: false } }, { userId: null }],
      },
      { $set: { userId: user._id } },
    );
    const redirectPath = getSafeRedirectPath(req.cookies.get(GOOGLE_OAUTH_REDIRECT_COOKIE)?.value);
    const destination =
      redirectPath ?? (isDashboardStaff(user.role) ? dashboardHomePath(user.role) : '/');
    const response = redirectTo(baseUrl, destination);
    attachCookie(response, token);
    clearOAuthStateCookie(response);
    return response;
  } catch (error) {
    console.error('[auth/google/callback]', error);
    const res = redirectTo(baseUrl, '/login', { error: 'google_auth_failed' });
    clearOAuthStateCookie(res);
    return res;
  }
}
