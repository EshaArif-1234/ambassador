'use client';

import { Suspense } from 'react';
import ProductsPage from '@/client/pages/products/ProductsPage';
import PageLoader from '@/components/ui/PageLoader';

export default function OurCollectionPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading products…" fullScreen={false} className="min-h-[60vh]" />}>
      <ProductsPage />
    </Suspense>
  );
}
