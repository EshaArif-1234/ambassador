/** Allowed marketing flags saved on products (admin multi-select). */

export const PRODUCT_FEATURE_KEYS = [
  'free_shipping',
  'on_sale',
  'new_arrival',
  'best_seller',
] as const;
export type ProductFeatureKey = (typeof PRODUCT_FEATURE_KEYS)[number];

export const PRODUCT_BRAND_KEYS = ['ambassador', 'imported'] as const;
export type ProductBrandKey = (typeof PRODUCT_BRAND_KEYS)[number];

const featureSet = new Set<string>(PRODUCT_FEATURE_KEYS);
const brandSet = new Set<string>(PRODUCT_BRAND_KEYS);

export function sanitizeProductFeatures(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return [
    ...new Set(
      input.filter((x): x is string => typeof x === 'string' && featureSet.has(x))
    ),
  ];
}

export function sanitizeProductBrands(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return [
    ...new Set(
      input.filter((x): x is string => typeof x === 'string' && brandSet.has(x))
    ),
  ];
}
