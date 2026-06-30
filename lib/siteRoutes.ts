/** Public storefront collection listing (nav label stays "Products"). */
export const COLLECTION_PATH = '/our-collection';

/** @deprecated Use COLLECTION_PATH — kept so existing imports keep working. */
export const CATALOGUE_PATH = COLLECTION_PATH;

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

type CatalogueParams = Record<string, string | undefined | null> & {
  category?: string;
  categorySlug?: string;
};

export function isMongoObjectId(value: string): boolean {
  return OBJECT_ID_RE.test(value);
}

export function parseCollectionPath(pathname: string): {
  categorySlug: string | null;
  productId: string | null;
} {
  if (!pathname.startsWith(`${COLLECTION_PATH}/`)) {
    return { categorySlug: null, productId: null };
  }

  const parts = pathname
    .slice(COLLECTION_PATH.length + 1)
    .split('/')
    .filter(Boolean);

  if (parts.length === 0) {
    return { categorySlug: null, productId: null };
  }

  if (parts.length >= 2 && isMongoObjectId(parts[1])) {
    return {
      categorySlug: decodeURIComponent(parts[0]),
      productId: decodeURIComponent(parts[1]),
    };
  }

  if (parts.length === 1) {
    return { categorySlug: decodeURIComponent(parts[0]), productId: null };
  }

  return { categorySlug: decodeURIComponent(parts[0]), productId: null };
}

export function isCollectionProductDetailPath(pathname: string): boolean {
  return parseCollectionPath(pathname).productId != null;
}

export function collectionCategoryPath(slug: string): string {
  const clean = slug.trim().toLowerCase();
  return `${COLLECTION_PATH}/${encodeURIComponent(clean)}`;
}

export function slugFromCollectionPath(pathname: string): string | null {
  const { categorySlug, productId } = parseCollectionPath(pathname);
  if (productId) return null;
  return categorySlug;
}

export function primaryCategorySlug(
  categories?: Array<{ slug?: string; title?: string } | string> | null
): string | undefined {
  if (!categories?.length) return undefined;
  const first = categories[0];
  if (typeof first === 'object' && first?.slug) {
    return first.slug.trim().toLowerCase();
  }
  return undefined;
}

export function productDetailPath(
  idOrSlug: string,
  categorySlug?: string | null
): string {
  const id = encodeURIComponent(idOrSlug);
  const slug = categorySlug?.trim().toLowerCase();
  if (slug) {
    return `${collectionCategoryPath(slug)}/${id}`;
  }
  return `/products/${id}`;
}

export function catalogueHref(
  params?: URLSearchParams | CatalogueParams
): string {
  if (!params) return COLLECTION_PATH;

  if (params instanceof URLSearchParams) {
    const sp = new URLSearchParams(params);
    const categoryTitle = sp.get('category');
    if (categoryTitle) sp.delete('category');
    const qs = sp.toString();
    if (categoryTitle) {
      const catQs = `category=${encodeURIComponent(categoryTitle)}`;
      return qs ? `${COLLECTION_PATH}?${catQs}&${qs}` : `${COLLECTION_PATH}?${catQs}`;
    }
    return qs ? `${COLLECTION_PATH}?${qs}` : COLLECTION_PATH;
  }

  const categorySlug = params.categorySlug?.trim().toLowerCase();
  const sp = Object.entries(params).reduce((acc, [key, value]) => {
    if (key === 'category' || key === 'categorySlug') return acc;
    if (value != null && value !== '') acc.set(key, value);
    return acc;
  }, new URLSearchParams());

  if (categorySlug) {
    const qs = sp.toString();
    return qs ? `${collectionCategoryPath(categorySlug)}?${qs}` : collectionCategoryPath(categorySlug);
  }

  if (params.category) {
    sp.set('category', params.category);
  }

  const qs = sp.toString();
  return qs ? `${COLLECTION_PATH}?${qs}` : COLLECTION_PATH;
}

/** True on the product listing page (not product detail under /our-collection/.../id). */
export function isCatalogueListingPath(pathname: string): boolean {
  if (pathname === COLLECTION_PATH) return true;
  if (isCollectionProductDetailPath(pathname)) return false;
  return (
    pathname.startsWith(`${COLLECTION_PATH}/`) ||
    pathname === '/catalogue' ||
    pathname.startsWith('/catalogue/') ||
    pathname === '/products'
  );
}

/** Highlight "Products" in nav for collection + product detail pages. */
export function isProductsNavActive(pathname: string): boolean {
  return (
    pathname === COLLECTION_PATH ||
    pathname.startsWith(`${COLLECTION_PATH}/`) ||
    pathname.startsWith('/products/') ||
    pathname === '/catalogue' ||
    pathname.startsWith('/catalogue/') ||
    pathname === '/products'
  );
}
