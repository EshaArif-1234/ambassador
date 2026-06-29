import jwt, { SignOptions } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

/** Default session length for admin and user logins. */
export const DEFAULT_SESSION_SECONDS = 2 * 60 * 60; // 2 hours

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not defined.');
  return s;
};

const expiresIn = () => process.env.JWT_EXPIRES_IN ?? '2h';

/** Parse JWT_EXPIRES_IN (e.g. 2h, 30m, 7d) into cookie maxAge seconds. */
export function sessionMaxAgeSeconds(): number {
  const raw = expiresIn().trim();
  const match = raw.match(/^(\d+)\s*([smhdw])?$/i);
  if (!match) return DEFAULT_SESSION_SECONDS;

  const value = parseInt(match[1], 10);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_SESSION_SECONDS;

  switch ((match[2] ?? 's').toLowerCase()) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    case 'w':
      return value * 7 * 24 * 60 * 60;
    default:
      return DEFAULT_SESSION_SECONDS;
  }
}

export const signToken = (userId: string): string => {
  return jwt.sign({ id: userId }, secret(), {
    expiresIn: expiresIn() as SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, secret()) as jwt.JwtPayload;
};

/** Production-safe Secure flag (set COOKIE_SECURE=false only for local HTTP testing). */
export function authCookieSecure(): boolean {
  if (process.env.COOKIE_SECURE === 'false') return false;
  if (process.env.COOKIE_SECURE === 'true') return true;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL;
  if (siteUrl) {
    const href = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
    try {
      return new URL(href).protocol === 'https:';
    } catch {
      /* fall through */
    }
  }
  return process.env.NODE_ENV === 'production';
}

export function authCookieOptions(maxAge: number) {
  const opts: Parameters<NextResponse['cookies']['set']>[2] = {
    httpOnly: true,
    secure: authCookieSecure(),
    sameSite: 'lax',
    maxAge,
    path: '/',
  };
  const domain = process.env.COOKIE_DOMAIN?.trim();
  if (domain) opts.domain = domain;
  return opts;
}

/** Attach a signed JWT as an httpOnly cookie on a NextResponse. */
export const attachCookie = (response: NextResponse, token: string): void => {
  response.cookies.set('token', token, authCookieOptions(sessionMaxAgeSeconds()));
};

/** Clear the JWT cookie on a NextResponse. */
export const clearCookie = (response: NextResponse): void => {
  response.cookies.set('token', '', authCookieOptions(0));
};

/**
 * Extract JWT from the request.
 * Priority: Authorization: Bearer <token>  →  httpOnly cookie
 */
export const extractToken = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return req.cookies.get('token')?.value ?? null;
};
