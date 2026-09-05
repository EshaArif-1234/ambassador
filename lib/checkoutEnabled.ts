/**
 * Checkout / online payment toggle.
 *
 * - Production (Hostinger): OFF by default — real visitors see "Coming soon" until you set
 *   NEXT_PUBLIC_CHECKOUT_ENABLED=true in production env AND Alfalah live credentials.
 * - Local dev: ON by default so you can test without extra env.
 *
 * While Alfalah sandbox testing, keep production checkout disabled to avoid pending orders
 * and a broken payment experience for customers.
 */
export function isCheckoutEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED?.trim().toLowerCase();
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return process.env.NODE_ENV === 'development';
}

/** @deprecated Use isCheckoutEnabled() — kept for existing imports */
export const CHECKOUT_ENABLED = isCheckoutEnabled();
