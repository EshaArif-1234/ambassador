'use client';

import { Suspense, use } from 'react';
import ProductDetailPage from '@/client/pages/products/ProductDetailPage';

export default function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetailPage productId={id} />
    </Suspense>
  );
}
