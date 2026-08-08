'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useAdminSessionTimeout } from '@/hooks/useAdminSessionTimeout';
import PageLoader from '@/components/ui/PageLoader';
import { isDashboardStaff, isManagerBlockedPath } from '@/utils/dashboardRoles';

interface AdminProtectionProps {
  children: React.ReactNode;
}

const AdminProtection: React.FC<AdminProtectionProps> = ({ children }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const hasDashboardAccess = Boolean(user && isDashboardStaff(user.role));
  useAdminSessionTimeout(hasDashboardAccess);

  useEffect(() => {
    if (isLoading) return;

    if (!user || !isDashboardStaff(user.role)) {
      router.push('/login');
      return;
    }

    if (user.role === 'manager' && isManagerBlockedPath(pathname)) {
      router.replace('/product-management');
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user || !isDashboardStaff(user.role)) {
    return (
      <PageLoader
        message={isLoading ? 'Loading user data...' : 'Redirecting to login...'}
      />
    );
  }

  if (user.role === 'manager' && isManagerBlockedPath(pathname)) {
    return <PageLoader message="Redirecting..." />;
  }

  return <>{children}</>;
};

export default AdminProtection;
