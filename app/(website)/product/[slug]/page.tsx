'use client';

import { Suspense, use } from 'react';
import ProductDetailPage from '@/client/pages/products/ProductDetailPage';
import PageLoader from '@/components/ui/PageLoader';

type Props = {
  params: Promise<{ slug: string }>;
};

function ProductBySlug({ slug }: { slug: string }) {
  return <ProductDetailPage productId={slug} />;
}

export default function ProductPage({ params }: Props) {
  const { slug } = use(params);

  return (
    <Suspense
      fallback={
        <PageLoader message="Loading product…" fullScreen={false} className="min-h-[60vh]" />
      }
    >
      <ProductBySlug slug={slug} />
    </Suspense>
  );
}
