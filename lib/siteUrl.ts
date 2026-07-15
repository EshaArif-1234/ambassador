/** Canonical public site origin (no trailing slash). Prefer www for ambassador.pk. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'https://www.ambassador.pk';

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const origin = withProtocol.replace(/\/+$/, '');

  try {
    const url = new URL(origin);
    if (url.hostname === 'ambassador.pk') {
      url.hostname = 'www.ambassador.pk';
    }
    return url.origin;
  } catch {
    return origin;
  }
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

/** Build canonical metadata for a storefront path. */
export function canonicalMetadata(path: string) {
  const url = absoluteUrl(path);
  return {
    alternates: { canonical: url },
    openGraph: { url },
  };
}
