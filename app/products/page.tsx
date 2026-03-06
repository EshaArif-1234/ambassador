'use client';

import { Suspense } from 'react';
import ProductsPage from '@/client/pages/products/ProductsPage';

export default function Products() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPage />
    </Suspense>
  );
}
