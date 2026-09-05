import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

export const GOOGLE_OAUTH_STATE_COOKIE = 'google_oauth_state';
export const GOOGLE_OAUTH_REDIRECT_COOKIE = 'google_oauth_redirect';

const SCOPES = ['openid', 'email', 'profile'];

type RequestLike = { headers: { get(name: string): string | null } };

/** Canonical app origin from env (production default). */
export function getAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

/** Use the incoming request host so OAuth works on localhost and production. */
export function getAppBaseUrlFromRequest(req: RequestLike): string {
  const host = req.headers.get('host');
  if (host) {
    const hostOnly = host.split(':')[0].toLowerCase();
    const proto = (
      req.headers.get('x-forwarded-proto') ??
      (hostOnly === 'localhost' || hostOnly === '127.0.0.1' ? 'http' : 'https')
    ).replace(/:$/, '');
    return `${proto}://${host}`.replace(/\/$/, '');
  }
  return getAppBaseUrl();
}

export function getGoogleRedirectUri(baseUrl?: string): string {
  return `${baseUrl ?? getAppBaseUrl()}/api/auth/google/callback`;
}

export function getGoogleOAuthClient(baseUrl?: string): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }
  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: getGoogleRedirectUri(baseUrl),
  });
}

export function createOAuthState(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getGoogleAuthUrl(state: string, baseUrl?: string): string {
  const client = getGoogleOAuthClient(baseUrl);
  return client.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES,
    include_granted_scopes: true,
    prompt: 'select_account',
    state,
  });
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
}

/** Exchange authorization code and verify ID token payload. */
export async function verifyGoogleAuthCode(code: string, baseUrl?: string): Promise<GoogleProfile> {
  const client = getGoogleOAuthClient(baseUrl);
  const { tokens } = await client.getToken(code);
  const idToken = tokens.id_token;
  if (!idToken) {
    throw new Error('Google did not return an ID token.');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error('Google profile is missing required fields.');
  }

  return {
    googleId: payload.sub,
    email: payload.email.trim().toLowerCase(),
    fullName: (payload.name || payload.email.split('@')[0] || 'User').trim(),
    emailVerified: payload.email_verified === true,
  };
}
