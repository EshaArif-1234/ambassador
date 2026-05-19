import { Suspense } from 'react';
import ProductDetailPage from '@/client/pages/products/ProductDetailPage';

export default async function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" /></div>}>
      <ProductDetailPage productId={id} />
    </Suspense>
  );
}
