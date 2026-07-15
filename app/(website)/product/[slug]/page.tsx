import { permanentRedirect } from 'next/navigation';
import { productDetailPath } from '@/lib/siteRoutes';

type Props = {
  params: Promise<{ slug: string }>;
};

/** Legacy /product/[slug] → /products/[slug] */
export default async function LegacyProductDetailRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(productDetailPath(slug));
}
