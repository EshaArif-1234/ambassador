'use client';

import { Suspense } from 'react';
import CustomKitchenPage from '@/client/pages/custom-kitchen/page';

export default function CustomKitchen() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <CustomKitchenPage />
    </Suspense>
  );
}