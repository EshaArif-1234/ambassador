/** Allow only same-site relative paths after login (blocks open redirects). */
export function getSafeRedirectPath(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;

  const path = value.trim();
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  if (path.startsWith('/login') || path.startsWith('/signup')) return null;

  return path;
}
