import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import connectDB from '@/backend/config/db';
import { findActiveProductByIdentifier } from '@/backend/lib/findPublicProduct';
import ProductDetailPage from '@/client/pages/products/ProductDetailPage';
import PageLoader from '@/components/ui/PageLoader';
import { productDetailPath, productUrlSegment } from '@/lib/siteRoutes';

/** Legacy /our-collection/[category]/[id|slug] → /product/[slug] */
export default async function LegacyCollectionProductPage({
  params,
}: {
  params: Promise<{ categorySlug: string; productId: string }>;
}) {
  const { productId } = await params;

  await connectDB();
  const product = await findActiveProductByIdentifier(productId);
  if (product) {
    redirect(productDetailPath(productUrlSegment(product)));
  }

  return (
    <Suspense
      fallback={
        <PageLoader message="Loading product…" fullScreen={false} className="min-h-[60vh]" />
      }
    >
      <ProductDetailPage key={productId} productId={productId} />
    </Suspense>
  );
}
