import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import connectDB from '@/backend/config/db';
import {
  findActiveProductByIdentifier,
} from '@/backend/lib/findPublicProduct';
import ProductDetailPage from '@/client/pages/products/ProductDetailPage';
import PageLoader from '@/components/ui/PageLoader';
import { productDetailPath, productUrlSegment } from '@/lib/siteRoutes';

/** Legacy /products/[id] → /product/[slug] when product is active. */
export default async function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();
  const product = await findActiveProductByIdentifier(id);
  if (product) {
    redirect(productDetailPath(productUrlSegment(product)));
  }

  return (
    <Suspense fallback={<PageLoader message="Loading product…" fullScreen={false} className="min-h-[60vh]" />}>
      <ProductDetailPage key={id} productId={id} />
    </Suspense>
  );
}
