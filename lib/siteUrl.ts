/** Canonical public site origin (no trailing slash). Uses NEXT_PUBLIC_APP_URL exactly. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'https://ambassador.pk';

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, '');
}

export function getCanonicalHost(): string {
  try {
    return new URL(getSiteUrl()).hostname.toLowerCase();
  } catch {
    return 'ambassador.pk';
  }
}

/** Skip host/protocol redirects in local development. */
export function shouldSkipHostCanonicalization(host: string): boolean {
  const h = host.split(':')[0].toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local');
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
