/** One row per product in PDF/Excel exports (by Mongo _id, then by slug). */
export function dedupeExportProducts<T extends { _id?: unknown; slug?: string }>(
  products: T[],
): T[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const out: T[] = [];

  for (const product of products) {
    const id = product._id != null ? String(product._id) : '';
    if (id && seenIds.has(id)) continue;

    const slug = (product.slug ?? '').trim().toLowerCase();
    if (slug && seenSlugs.has(slug)) continue;

    if (id) seenIds.add(id);
    if (slug) seenSlugs.add(slug);
    out.push(product);
  }

  return out;
}

/** Preserve first occurrence order when deduplicating id strings (e.g. selected export). */
export function uniqueIdsInOrder(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const trimmed = id.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}
