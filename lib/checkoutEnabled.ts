/**
 * Checkout / online payment toggle.
 *
 * Server routes call isCheckoutEnabled() at request time — env changes apply after
 * redeploy/restart without rebuilding the client bundle.
 *
 * CHECKOUT_ENABLED (server) or NEXT_PUBLIC_CHECKOUT_ENABLED (also inlined for legacy
 * client imports) — set either to "true" on production when Alfalah is ready.
 */
export function isCheckoutEnabled(): boolean {
  const raw =
    process.env.CHECKOUT_ENABLED?.trim().toLowerCase() ??
    process.env.NEXT_PUBLIC_CHECKOUT_ENABLED?.trim().toLowerCase();
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return process.env.NODE_ENV === 'development';
}

/** @deprecated Prefer isCheckoutEnabled() on the server or checkoutEnabled prop from a Server Component. */
export const CHECKOUT_ENABLED = isCheckoutEnabled();
