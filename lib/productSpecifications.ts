/** Sort product specs by the order saved from drag-and-drop in the product editor. */
export function orderProductSpecifications(
  specs: Record<string, string> | null | undefined,
  productOrder?: string[] | null,
): Record<string, string> {
  if (!specs || typeof specs !== 'object') return {};

  const entries = Object.entries(specs).filter(
    ([, value]) => value != null && String(value).trim() !== '',
  );

  if (!productOrder?.length) {
    return Object.fromEntries(entries);
  }

  const orderMap = new Map(productOrder.map((key, index) => [key.trim().toLowerCase(), index]));

  entries.sort((a, b) => {
    const aIdx = orderMap.get(a[0].toLowerCase());
    const bIdx = orderMap.get(b[0].toLowerCase());
    const aIn = aIdx !== undefined;
    const bIn = bIdx !== undefined;
    if (aIn && bIn) return aIdx - bIdx;
    if (aIn) return -1;
    if (bIn) return 1;
    return a[0].localeCompare(b[0], 'en', { sensitivity: 'base' });
  });

  return Object.fromEntries(entries);
}

export function orderedSpecificationEntries(
  specs: Record<string, string> | null | undefined,
  productOrder?: string[] | null,
): [string, string][] {
  return Object.entries(orderProductSpecifications(specs, productOrder));
}
