import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LEGACY_CATALOGUE_PATH,
  LEGACY_COLLECTION_PATH,
  LEGACY_PRODUCT_PATH,
  PRODUCTS_PATH,
} from '@/lib/siteRoutes';

/** Permanent redirect — tells Google the canonical URL has moved (fixes duplicate indexing). */
const PERMANENT = 308;

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url, PERMANENT);
}

function mapLegacyPrefix(request: NextRequest, from: string, to: string) {
  const { pathname } = request.nextUrl;
  if (pathname === from) {
    return redirectTo(request, to);
  }
  if (pathname.startsWith(`${from}/`)) {
    const rest = pathname.slice(from.length);
    return redirectTo(request, `${to}${rest}`);
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip trailing slashes (except root) — /products/deep-fryer/ → /products/deep-fryer
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return redirectTo(request, pathname.replace(/\/+$/, '') || '/');
  }

  // Legacy product URL prefixes → /products
  const legacy =
    mapLegacyPrefix(request, LEGACY_COLLECTION_PATH, PRODUCTS_PATH) ??
    mapLegacyPrefix(request, LEGACY_CATALOGUE_PATH, PRODUCTS_PATH) ??
    mapLegacyPrefix(request, LEGACY_PRODUCT_PATH, PRODUCTS_PATH);

  if (legacy) return legacy;

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
