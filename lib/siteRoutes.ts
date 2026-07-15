/** Canonical storefront products URL — listing, categories, and detail pages. */
export const PRODUCTS_PATH = '/products';

/** @deprecated Use PRODUCTS_PATH */
export const COLLECTION_PATH = PRODUCTS_PATH;
/** @deprecated Use PRODUCTS_PATH */
export const CATALOGUE_PATH = PRODUCTS_PATH;
/** @deprecated Use PRODUCTS_PATH */
export const PRODUCT_PATH = PRODUCTS_PATH;

/** Legacy URLs — each has a redirect route to PRODUCTS_PATH */
export const LEGACY_COLLECTION_PATH = '/our-collection';
export const LEGACY_CATALOGUE_PATH = '/catalogue';
export const LEGACY_PRODUCT_PATH = '/product';

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

type ProductsHrefParams = Record<string, string | undefined | null> & {
  category?: string;
  categorySlug?: string;
};

function isLegacyProductsPath(pathname: string): boolean {
  return (
    pathname === LEGACY_COLLECTION_PATH ||
    pathname.startsWith(`${LEGACY_COLLECTION_PATH}/`) ||
    pathname === LEGACY_CATALOGUE_PATH ||
    pathname.startsWith(`${LEGACY_CATALOGUE_PATH}/`) ||
    pathname === LEGACY_PRODUCT_PATH ||
    pathname.startsWith(`${LEGACY_PRODUCT_PATH}/`)
  );
}

export function isMongoObjectId(value: string): boolean {
  return OBJECT_ID_RE.test(value);
}

export function parseCollectionPath(pathname: string): {
  categorySlug: string | null;
  productId: string | null;
} {
  if (!pathname.startsWith(`${PRODUCTS_PATH}/`)) {
    return { categorySlug: null, productId: null };
  }

  const parts = pathname
    .slice(PRODUCTS_PATH.length + 1)
    .split('/')
    .filter(Boolean);

  if (parts.length === 0) {
    return { categorySlug: null, productId: null };
  }

  if (parts.length >= 2) {
    return {
      categorySlug: decodeURIComponent(parts[0]),
      productId: decodeURIComponent(parts[1]),
    };
  }

  if (parts.length === 1) {
    return { categorySlug: decodeURIComponent(parts[0]), productId: null };
  }

  return { categorySlug: null, productId: null };
}

export function isCollectionProductDetailPath(pathname: string): boolean {
  return parseCollectionPath(pathname).productId != null;
}

export function productsCategoryPath(slug: string): string {
  const clean = slug.trim().toLowerCase();
  return `${PRODUCTS_PATH}/${encodeURIComponent(clean)}`;
}

/** @deprecated Use productsCategoryPath */
export const collectionCategoryPath = productsCategoryPath;

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

export type ProductLinkLike = {
  slug?: string | null;
  _id?: string | { toString(): string } | null;
};

/** URL segment for a product detail page — prefers slug over MongoDB id. */
export function productUrlSegment(product: ProductLinkLike): string {
  const slug = typeof product.slug === 'string' ? product.slug.trim().toLowerCase() : '';
  if (slug) return slug;
  return String(product._id ?? '').trim();
}

export function productDetailPath(
  idOrSlug: string,
  _categorySlug?: string | null
): string {
  const segment = encodeURIComponent(String(idOrSlug).trim().toLowerCase());
  return `${PRODUCTS_PATH}/${segment}`;
}

export function isProductDetailPath(pathname: string): boolean {
  return (
    pathname === PRODUCTS_PATH ||
    pathname.startsWith(`${PRODUCTS_PATH}/`) ||
    isLegacyProductsPath(pathname)
  );
}

export function parseProductPath(pathname: string): string | null {
  if (!pathname.startsWith(`${PRODUCTS_PATH}/`)) return null;
  const segment = pathname.slice(PRODUCTS_PATH.length + 1).split('/').filter(Boolean)[0];
  return segment ? decodeURIComponent(segment) : null;
}

export function productsHref(
  params?: URLSearchParams | ProductsHrefParams
): string {
  if (!params) return PRODUCTS_PATH;

  if (params instanceof URLSearchParams) {
    const sp = new URLSearchParams(params);
    const categoryTitle = sp.get('category');
    if (categoryTitle) sp.delete('category');
    const qs = sp.toString();
    if (categoryTitle) {
      const catQs = `category=${encodeURIComponent(categoryTitle)}`;
      return qs ? `${PRODUCTS_PATH}?${catQs}&${qs}` : `${PRODUCTS_PATH}?${catQs}`;
    }
    return qs ? `${PRODUCTS_PATH}?${qs}` : PRODUCTS_PATH;
  }

  const categorySlug = params.categorySlug?.trim().toLowerCase();
  const sp = Object.entries(params).reduce((acc, [key, value]) => {
    if (key === 'category' || key === 'categorySlug') return acc;
    if (value != null && value !== '') acc.set(key, value);
    return acc;
  }, new URLSearchParams());

  if (categorySlug) {
    const qs = sp.toString();
    return qs ? `${productsCategoryPath(categorySlug)}?${qs}` : productsCategoryPath(categorySlug);
  }

  if (params.category) {
    sp.set('category', params.category);
  }

  const qs = sp.toString();
  return qs ? `${PRODUCTS_PATH}?${qs}` : PRODUCTS_PATH;
}

/** @deprecated Use productsHref */
export const catalogueHref = productsHref;

/** True on the product listing page (not nested legacy detail paths). */
export function isCatalogueListingPath(pathname: string): boolean {
  if (pathname === PRODUCTS_PATH) return true;
  if (pathname.startsWith(`${PRODUCTS_PATH}/`)) {
    if (isCollectionProductDetailPath(pathname)) return false;
    return true;
  }
  return isLegacyProductsPath(pathname);
}

/** Highlight "Products" in nav for all products-section pages. */
export function isProductsNavActive(pathname: string): boolean {
  return isProductDetailPath(pathname);
}
