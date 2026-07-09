'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useAdminSessionTimeout } from '@/hooks/useAdminSessionTimeout';
import PageLoader from '@/components/ui/PageLoader';

interface AdminProtectionProps {
  children: React.ReactNode;
}

const AdminProtection: React.FC<AdminProtectionProps> = ({ children }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const isAdmin = Boolean(user && user.role === 'admin');
  useAdminSessionTimeout(isAdmin);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <PageLoader
        message={isLoading ? 'Loading user data...' : 'Redirecting to login...'}
      />
    );
  }

  return <>{children}</>;
};

export default AdminProtection;
