import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

export const GOOGLE_OAUTH_STATE_COOKIE = 'google_oauth_state';

const SCOPES = ['openid', 'email', 'profile'];

export function getAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

export function getGoogleRedirectUri(): string {
  return `${getAppBaseUrl()}/api/auth/google/callback`;
}

export function getGoogleOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }
  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: getGoogleRedirectUri(),
  });
}

export function createOAuthState(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getGoogleAuthUrl(state: string): string {
  const client = getGoogleOAuthClient();
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
export async function verifyGoogleAuthCode(code: string): Promise<GoogleProfile> {
  const client = getGoogleOAuthClient();
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
