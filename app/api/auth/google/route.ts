import { NextRequest, NextResponse } from 'next/server';
import { authCookieOptions } from '@/utils/jwt.util';
import {
  createOAuthState,
  getAppBaseUrl,
  getAppBaseUrlFromRequest,
  getGoogleAuthUrl,
  GOOGLE_OAUTH_REDIRECT_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
} from '@/utils/googleAuth.util';
import { getSafeRedirectPath } from '@/utils/safeRedirect.util';

export async function GET(req: NextRequest) {
  try {
    const baseUrl = getAppBaseUrlFromRequest(req);
    const state = createOAuthState();
    const redirectPath = getSafeRedirectPath(new URL(req.url).searchParams.get('redirect'));
    const response = NextResponse.redirect(getGoogleAuthUrl(state, baseUrl));
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, authCookieOptions(600));
    if (redirectPath) {
      response.cookies.set(GOOGLE_OAUTH_REDIRECT_COOKIE, redirectPath, authCookieOptions(600));
    }
    return response;
  } catch (error) {
    console.error('[auth/google]', error);
    const base = getAppBaseUrl();
    return NextResponse.redirect(`${base}/login?error=google_not_configured`);
  }
}
