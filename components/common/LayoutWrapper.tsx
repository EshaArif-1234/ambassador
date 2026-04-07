'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import NavigationHeader from './NavigationHeader';
import Footer from './footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Check if we're in admin routes
  const isAdminRoute = pathname?.startsWith('/admin') || 
                        pathname?.startsWith('/product-management') || 
                        pathname?.startsWith('/category-management') ||
                        pathname?.startsWith('/users') ||
                        pathname?.startsWith('/orders-management') ||
                        pathname?.startsWith('/gallery-management') ||
                        pathname?.startsWith('/settings')||
                        pathname?.startsWith('/payments');
                        
  
  // Don't render main navigation for admin routes
  if (isAdminRoute) {
    return <>{children}</>;
  }
  
  // Render full layout for non-admin routes
  return (
    <>
      <Header />
      <NavigationHeader />
      {children}
      <Footer />
    </>
  );
};

export default LayoutWrapper;
