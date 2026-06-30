import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import connectDB from '@/backend/config/db';
import {
  findActiveProductByIdentifier,
} from '@/backend/lib/findPublicProduct';
import ProductDetailPage from '@/client/pages/products/ProductDetailPage';
import PageLoader from '@/components/ui/PageLoader';
import { primaryCategorySlug, productDetailPath } from '@/lib/siteRoutes';

/** Legacy /products/[id] → /our-collection/[categorySlug]/[id] when product is active. */
export default async function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();
  const product = await findActiveProductByIdentifier(id);
  if (product) {
    const catSlug = primaryCategorySlug(
      product.categories as Array<{ slug?: string; title?: string }> | undefined
    );
    redirect(productDetailPath(String(product._id), catSlug));
  }

  return (
    <Suspense fallback={<PageLoader message="Loading product…" fullScreen={false} className="min-h-[60vh]" />}>
      <ProductDetailPage key={id} productId={id} />
    </Suspense>
  );
}
