/**
 * Browser fetch for authenticated API routes (httpOnly cookie).
 * Uses cache: 'no-store' so production/CDN does not serve stale empty lists.
 */
export async function fetchAuthedJson<T = Record<string, unknown>>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; body: T }> {
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const body = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, body };
}
