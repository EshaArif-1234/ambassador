'use client';

import { Suspense, use } from 'react';
import ProductsPage from '@/client/pages/products/ProductsPage';
import PageLoader from '@/components/ui/PageLoader';

type Props = {
  params: Promise<{ categorySlug: string }>;
};

function CategoryCollection({ categorySlug }: { categorySlug: string }) {
  return <ProductsPage categorySlugFromPath={categorySlug} />;
}

export default function OurCollectionCategoryPage({ params }: Props) {
  const { categorySlug } = use(params);

  return (
    <Suspense fallback={<PageLoader message="Loading products…" fullScreen={false} className="min-h-[60vh]" />}>
      <CategoryCollection categorySlug={categorySlug} />
    </Suspense>
  );
}
