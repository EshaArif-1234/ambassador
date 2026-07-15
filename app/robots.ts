import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/siteUrl';

/** Paths that should not be indexed (admin, auth, checkout, account, legacy duplicate URLs). */
const DISALLOW_PREFIXES = [
  '/admin',
  '/product-management',
  '/category-management',
  '/orders-management',
  '/gallery-management',
  '/reviews-management',
  '/admin-settings',
  '/payments',
  '/users',
  '/login',
  '/signup',
  '/forgot-password',
  '/forgot-password-otp',
  '/otp-verification',
  '/change-password',
  '/checkout',
  '/payment',
  '/order-success',
  '/profile',
  '/orders',
  '/wishlist',
  '/my-reviews',
  '/network-error',
  '/not-found',
  '/api',
  /** Legacy duplicate product URLs — canonical is /products (/product/ avoids blocking /product-management) */
  '/our-collection',
  '/catalogue',
  '/product/',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: DISALLOW_PREFIXES,
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
