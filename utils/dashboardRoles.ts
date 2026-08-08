/** Dashboard manager account — view/create/edit only; no delete or deactivation. */
export const MANAGER_EMAIL = 'halogix.seo@gmail.com';

export type AppRole = 'user' | 'admin' | 'manager';

export function isDashboardStaff(role?: string | null): boolean {
  return role === 'admin' || role === 'manager';
}

export function isFullAdmin(role?: string | null): boolean {
  return role === 'admin';
}

export function isManager(role?: string | null): boolean {
  return role === 'manager';
}

export function canDeleteInDashboard(role?: string | null): boolean {
  return isFullAdmin(role);
}

export function canChangeStatusInDashboard(role?: string | null): boolean {
  return isFullAdmin(role);
}

/** @deprecated Use canChangeStatusInDashboard */
export function canDeactivateInDashboard(role?: string | null): boolean {
  return canChangeStatusInDashboard(role);
}

export function dashboardHomePath(role?: string | null): string {
  if (role === 'manager') return '/product-management';
  if (role === 'admin') return '/admin';
  return '/';
}

/** Pages a manager may open in the dashboard. */
export const MANAGER_ALLOWED_PATHS = [
  '/product-management',
  '/category-management',
  '/spare-parts-management',
  '/gallery-management',
] as const;

export function isManagerAllowedPath(pathname: string): boolean {
  return MANAGER_ALLOWED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isManagerBlockedPath(pathname: string): boolean {
  return !isManagerAllowedPath(pathname);
}

/** Managers cannot change active/inactive status (create as active is allowed). */
export function isManagerStatusChangeBlocked(
  body: Record<string, unknown>,
  options?: { isCreate?: boolean },
): boolean {
  if (body.isDisabled === true) return true;
  if (body.status === undefined) return false;
  if (options?.isCreate && body.status === 'active') return false;
  return true;
}

/** @deprecated Use isManagerStatusChangeBlocked */
export function isDeactivationPayload(body: Record<string, unknown>): boolean {
  return isManagerStatusChangeBlocked(body);
}
