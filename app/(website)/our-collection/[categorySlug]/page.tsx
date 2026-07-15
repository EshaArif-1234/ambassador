import { permanentRedirect } from 'next/navigation';
import { productsCategoryPath } from '@/lib/siteRoutes';

type Props = {
  params: Promise<{ categorySlug: string }>;
};

/** Legacy /our-collection/[categorySlug] → /products/[categorySlug] */
export default async function LegacyOurCollectionCategoryRedirect({ params }: Props) {
  const { categorySlug } = await params;
  permanentRedirect(productsCategoryPath(categorySlug));
}
