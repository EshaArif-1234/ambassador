export type StorefrontCategory = {
  _id?: string;
  title: string;
  slug: string;
  image?: string;
  sortOrder?: number;
};

/** Keep admin-defined category order everywhere lists are shown. */
export function sortStorefrontCategories<T extends { sortOrder?: number; title?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const ao = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const bo = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return (a.title ?? '').localeCompare(b.title ?? '', 'en', { sensitivity: 'base' });
  });
}

/** Sort categories attached to a product (primary category = first after sort). */
export function sortPopulatedCategories<T extends { sortOrder?: number; title?: string }>(
  items: T[] | undefined | null,
): T[] {
  if (!items?.length) return [];
  return sortStorefrontCategories(items);
}

export async function fetchStorefrontCategories(): Promise<StorefrontCategory[]> {
  const res = await fetch('/api/categories', { cache: 'no-store' });
  const json = await res.json();
  if (!json?.success || !Array.isArray(json.data)) return [];
  return sortStorefrontCategories(json.data as StorefrontCategory[]);
}
