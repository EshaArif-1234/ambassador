import { NextResponse } from 'next/server';
import { authCookieOptions } from '@/utils/jwt.util';
import {
  createOAuthState,
  getAppBaseUrl,
  getGoogleAuthUrl,
  GOOGLE_OAUTH_STATE_COOKIE,
} from '@/utils/googleAuth.util';

export async function GET() {
  try {
    const state = createOAuthState();
    const response = NextResponse.redirect(getGoogleAuthUrl(state));
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, authCookieOptions(600));
    return response;
  } catch (error) {
    console.error('[auth/google]', error);
    const base = getAppBaseUrl();
    return NextResponse.redirect(`${base}/login?error=google_not_configured`);
  }
}
