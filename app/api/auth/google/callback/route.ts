import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import User from '@/backend/models/User.model';
import { signToken, attachCookie, authCookieOptions } from '@/utils/jwt.util';
import {
  getAppBaseUrl,
  GOOGLE_OAUTH_STATE_COOKIE,
  verifyGoogleAuthCode,
} from '@/utils/googleAuth.util';

function redirectTo(path: string, query?: Record<string, string>) {
  const base = getAppBaseUrl();
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
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const cookieState = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    const res = redirectTo('/login', { error: 'google_state_mismatch' });
    clearOAuthStateCookie(res);
    return res;
  }

  try {
    const profile = await verifyGoogleAuthCode(code);
    await connectDB();

    let user = await User.findOne({ googleId: profile.googleId });

    if (!user) {
      user = await User.findOne({ email: profile.email });
    }

    if (user) {
      if (user.role === 'admin') {
        const res = redirectTo('/login', { error: 'google_admin_blocked' });
        clearOAuthStateCookie(res);
        return res;
      }

      if (user.isDisabled) {
        const res = redirectTo('/login', { error: 'account_disabled' });
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
        const res = redirectTo('/login', { error: 'google_email_unverified' });
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
    const destination = user.role === 'admin' ? '/admin' : '/';
    const response = redirectTo(destination);
    attachCookie(response, token);
    clearOAuthStateCookie(response);
    return response;
  } catch (error) {
    console.error('[auth/google/callback]', error);
    const res = redirectTo('/login', { error: 'google_auth_failed' });
    clearOAuthStateCookie(res);
    return res;
  }
}
