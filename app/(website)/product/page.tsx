import { permanentRedirect } from 'next/navigation';
import { PRODUCTS_PATH } from '@/lib/siteRoutes';

/** Legacy /product → /products */
export default function LegacyProductRedirect() {
  permanentRedirect(PRODUCTS_PATH);
}
