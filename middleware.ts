import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LEGACY_CATALOGUE_PATH,
  LEGACY_PRODUCT_PATH,
  PRODUCTS_PATH,
} from '@/lib/siteRoutes';
import { getCanonicalHost, getSiteUrl, shouldSkipHostCanonicalization } from '@/lib/siteUrl';

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

/** Force one canonical host + HTTPS (e.g. www → apex, http → https). */
function canonicalHostRedirect(request: NextRequest): NextResponse | null {
  const hostHeader = request.headers.get('host') ?? '';
  const host = hostHeader.split(':')[0].toLowerCase();
  if (!host || shouldSkipHostCanonicalization(host)) return null;

  const canonicalHost = getCanonicalHost();
  const proto = (
    request.headers.get('x-forwarded-proto') ??
    request.nextUrl.protocol.replace(':', '')
  ).toLowerCase();

  if (host === canonicalHost && proto === 'https') return null;

  // Build redirect from canonical origin — do not clone request.nextUrl (keeps internal :3000 behind proxy).
  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    `${getSiteUrl()}/`,
  );
  return NextResponse.redirect(destination, PERMANENT);
}

export function middleware(request: NextRequest) {
  const hostRedirect = canonicalHostRedirect(request);
  if (hostRedirect) return hostRedirect;

  const { pathname } = request.nextUrl;

  // Alfalah Return URL → internal return handler (page.tsx cannot accept POST)
  if (pathname === '/order-success') {
    const hasOrderParam = request.nextUrl.searchParams.has('order');
    const alfalahOrderRef =
      request.nextUrl.searchParams.get('O') ??
      request.nextUrl.searchParams.get('o') ??
      request.nextUrl.searchParams.get('TransactionReferenceNumber') ??
      request.nextUrl.searchParams.get('orderRef') ??
      request.nextUrl.searchParams.get('orderNumber');

    const hasCallbackParams = Boolean(
      alfalahOrderRef ||
        request.nextUrl.searchParams.has('RC') ||
        request.nextUrl.searchParams.has('ResponseCode'),
    );

    if (request.method === 'POST' || (request.method === 'GET' && !hasOrderParam && hasCallbackParams)) {
      const url = request.nextUrl.clone();
      url.pathname = '/api/payment/return';
      return NextResponse.rewrite(url);
    }
  }

  // Strip trailing slashes (except root) — /products/deep-fryer/ → /products/deep-fryer
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return redirectTo(request, pathname.replace(/\/+$/, '') || '/');
  }

  // Legacy indexed URLs (no App Router pages) — 308 to canonical /products
  const legacy =
    mapLegacyPrefix(request, LEGACY_CATALOGUE_PATH, PRODUCTS_PATH) ??
    mapLegacyPrefix(request, LEGACY_PRODUCT_PATH, PRODUCTS_PATH);

  if (legacy) return legacy;

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/order-success',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
