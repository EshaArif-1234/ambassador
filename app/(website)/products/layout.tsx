import type { Metadata } from 'next';
import { PRODUCTS_PATH } from '@/lib/siteRoutes';
import { absoluteUrl, canonicalMetadata } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Products | Ambassador Kitchen Equipment',
  description:
    'Browse commercial kitchen equipment, restaurant supplies, and food service solutions in Pakistan.',
  ...canonicalMetadata(PRODUCTS_PATH),
  openGraph: {
    title: 'Products | Ambassador Kitchen Equipment',
    description:
      'Browse commercial kitchen equipment, restaurant supplies, and food service solutions in Pakistan.',
    url: absoluteUrl(PRODUCTS_PATH),
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
