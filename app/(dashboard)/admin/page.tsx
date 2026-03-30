'use client';

import { Suspense } from 'react';
import DashboardOverview from '@/admin/pages/dashboard-overview/page';

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    }>
      <DashboardOverview />
    </Suspense>
  );
}
