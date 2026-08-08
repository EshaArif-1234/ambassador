'use client';

import { useUser } from '@/contexts/UserContext';
import {
  canChangeStatusInDashboard,
  canDeleteInDashboard,
  dashboardHomePath,
  isFullAdmin,
  isManager,
} from '@/utils/dashboardRoles';

/** Client-side dashboard role helpers for admin UI. */
export function useDashboardPermissions() {
  const { user } = useUser();
  const role = user?.role;

  return {
    role,
    isAdmin: isFullAdmin(role),
    isManager: isManager(role),
    canDelete: canDeleteInDashboard(role),
    canChangeStatus: canChangeStatusInDashboard(role),
    /** @deprecated Use canChangeStatus */
    canDeactivate: canChangeStatusInDashboard(role),
    dashboardHome: dashboardHomePath(role),
  };
}
