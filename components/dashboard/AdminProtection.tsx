'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import PageLoader from '@/components/ui/PageLoader';

interface AdminProtectionProps {
  children: React.ReactNode;
}

const AdminProtection: React.FC<AdminProtectionProps> = ({ children }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only check permissions after loading is complete
    if (!isLoading) {
      // Check if user is not logged in or not an admin
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while user context is loading or checking permissions
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
