/**
 * Legacy filter: exclude spare parts that were stored in the products collection
 * before the dedicated spareparts collection existed.
 */
export const MAIN_CATALOG_FILTER = { productType: { $ne: 'spare_part' as const } };

/** @deprecated Spare parts now live in the spareparts collection. */
export const SPARE_PART_FILTER = { productType: 'spare_part' as const };

export function applyProductTypeFilter(
  filter: Record<string, unknown>,
  productType: string,
): void {
  if (productType === 'main') {
    Object.assign(filter, MAIN_CATALOG_FILTER);
  }
}
