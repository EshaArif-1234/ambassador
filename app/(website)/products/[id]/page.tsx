import { Suspense } from 'react';
import ProductDetailPage from '@/client/pages/products/ProductDetailPage';
import PageLoader from '@/components/ui/PageLoader';

export default async function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageLoader message="Loading product…" fullScreen={false} className="min-h-[60vh]" />}>
      <ProductDetailPage productId={id} />
    </Suspense>
  );
}
