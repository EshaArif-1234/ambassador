import jwt, { SignOptions } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not defined.');
  return s;
};

const expiresIn = () => process.env.JWT_EXPIRES_IN ?? '7d';

export const signToken = (userId: string): string => {
  return jwt.sign({ id: userId }, secret(), {
    expiresIn: expiresIn() as SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, secret()) as jwt.JwtPayload;
};

/** Attach a signed JWT as an httpOnly cookie on a NextResponse. */
export const attachCookie = (response: NextResponse, token: string): void => {
  const days = parseInt(expiresIn(), 10) || 7;
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: days * 24 * 60 * 60,
    path: '/',
  });
};

/** Clear the JWT cookie on a NextResponse. */
export const clearCookie = (response: NextResponse): void => {
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
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
