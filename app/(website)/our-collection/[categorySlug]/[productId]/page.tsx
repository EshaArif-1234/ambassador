'use client';

import { Suspense, use } from 'react';
import ProductDetailPage from '@/client/pages/products/ProductDetailPage';
import PageLoader from '@/components/ui/PageLoader';

type Props = {
  params: Promise<{ categorySlug: string; productId: string }>;
};

function CollectionProductDetail({ productId }: { productId: string }) {
  return <ProductDetailPage productId={productId} />;
}

export default function OurCollectionProductPage({ params }: Props) {
  const { productId } = use(params);

  return (
    <Suspense fallback={<PageLoader message="Loading product…" fullScreen={false} className="min-h-[60vh]" />}>
      <CollectionProductDetail productId={productId} />
    </Suspense>
  );
}
