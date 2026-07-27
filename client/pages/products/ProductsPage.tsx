'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProductRatingDropdown from '@/components/products/ProductRatingDropdown';
import CartPopup from '@/components/products/CartPopup';
import WishlistButton from '@/components/products/WishlistButton';
import { useCart } from '@/contexts/CartContext';
import PageLoader from '@/components/ui/PageLoader';
import {
  PRODUCTS_PATH,
  productsCategoryPath,
  productDetailPath,
  productUrlSegment,
  slugFromCollectionPath,
} from '@/lib/siteRoutes';
import { useStorefrontCategories } from '@/hooks/useStorefrontCategories';

interface ApiCategoryRef {
  _id?: string;
  title?: string;
  slug?: string;
}

interface ApiProductRow {
  _id: string;
  slug?: string;
  name: string;
  about?: string;
  price?: number;
  originalPrice: number;
  stock: number;
  images: string[];
  features: string[];
  brands: string[];
  specifications: Record<string, string>;
  categories: ApiCategoryRef[];
  avgRating?: number;
  reviewCount?: number;
}

interface Product {
  _id: string;
  slug?: string;
  name: string;
  description: string;
  category: string;
  categorySlug: string | undefined;
  categoryTitles: string[];
  price: number;
  originalPrice: number;
  image: string;
  featured: boolean;
  stock: number;
  features: string[];
  brands: string[];
  specifications: Record<string, string>;
  avgRating: number;
  reviewCount: number;
}

function normalizeBrandTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string' && x.length > 0);
}

function mapApiToProduct(p: ApiProductRow): Product {
  const catRefs = Array.isArray(p.categories) ? p.categories : [];
  const cats = catRefs.map((c) => c.title).filter((t): t is string => Boolean(t));
  const category = cats[0] ?? 'Uncategorized';
  const categorySlug = catRefs.find((c) => c.slug)?.slug ?? catRefs[0]?.slug;
  const displayPrice =
    p.price != null && p.price > 0 ? p.price : p.originalPrice ?? 0;
  const image = p.images?.[0] || '/Images/home/stainless-steal.webp';
  const feat = Array.isArray(p.features) ? p.features : [];
  const featured =
    feat.includes('best_seller') || feat.includes('new_arrival');
  return {
    _id: String(p._id),
    slug: p.slug?.trim().toLowerCase() || undefined,
    name: p.name,
    description: (p.about ?? '').trim(),
    category,
    categorySlug: categorySlug || undefined,
    categoryTitles: cats,
    price: displayPrice,
    originalPrice: p.originalPrice ?? displayPrice,
    image,
    featured,
    stock: p.stock ?? 0,
    features: feat,
    brands: normalizeBrandTags(p.brands),
    specifications: p.specifications ?? {},
    avgRating: p.avgRating ?? 0,
    reviewCount: p.reviewCount ?? 0,
  };
}

type BrandFilterKey = 'ambassador' | 'imported';

const BRAND_FILTERS: { key: BrandFilterKey; label: string; apiSlug: string }[] = [
  { key: 'ambassador', label: 'Ambassador', apiSlug: 'ambassador' },
  { key: 'imported', label: 'Imported', apiSlug: 'imported' },
];

/** Labels for product card / display (order: Ambassador, then Imported) */
function formatBrandLabels(slugs: string[]): string {
  if (!slugs.length) return '';
  const ordered = BRAND_FILTERS.map(({ apiSlug, label }) =>
    slugs.includes(apiSlug) ? label : null
  ).filter((x): x is string => x != null);
  const unknown = slugs.filter((s) => !BRAND_FILTERS.some((b) => b.apiSlug === s));
  return [...ordered, ...unknown].join(' · ');
}

type ProductFeatureFilterKey = 'freeShipping' | 'onSale' | 'newArrival' | 'bestSeller';

const FEATURE_FILTERS: { key: ProductFeatureFilterKey; label: string; apiFlag: string }[] = [
  { key: 'freeShipping', label: 'Free Shipping', apiFlag: 'free_shipping' },
  { key: 'onSale', label: 'On Sale', apiFlag: 'on_sale' },
  { key: 'newArrival', label: 'New Arrival', apiFlag: 'new_arrival' },
  { key: 'bestSeller', label: 'Best Seller', apiFlag: 'best_seller' },
];

const ALL = 'All Categories';

const SORT_MAP: Record<string, string> = {
  random:       'random',
  name:         'name_asc',
  'price-low':  'price_asc',
  'price-high': 'price_desc',
  newest:       'newest',
};

const PAGE_SIZE = 12;

 function ProductResultRow({
  product,
  onAddToCart,
  onBuyItNow,
}: {
  product: Product;
  onAddToCart: () => void;
  onBuyItNow: () => void;
}) {
  const showStrike = product.originalPrice > product.price && product.price > 0;
  const detailHref = productDetailPath(productUrlSegment(product), product.categorySlug);

  return (
    <article className="flex flex-col gap-4 py-4 sm:flex-row sm:items-start sm:gap-6">
      <div className="relative mx-auto h-[260px] w-[260px] shrink-0 overflow-hidden bg-[#F3F3F3] shadow-md sm:mx-0 md:h-[300px] md:w-[300px]">
        <Link href={detailHref} className="block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 260px, 300px"
          />
        </Link>
        <WishlistButton productId={product._id} />
      </div>

      <div className="min-w-0 flex-1">
        <Link href={detailHref} className="block">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#0F4C69] hover:text-[#E36630] hover:underline">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1">
          <ProductRatingDropdown
            productId={product._id}
            averageRating={product.reviewCount ? product.avgRating : 0}
            totalReviews={product.reviewCount}
            productName={product.name}
          />
        </div>

        {product.brands.length > 0 && (
          <p className="mt-1 text-xs font-semibold text-[#E36630]">{formatBrandLabels(product.brands)}</p>
        )}

        {product.category ? (
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#0F4C69]">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {product.category}
          </span>
        ) : null}

        <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-gray-600">
          {product.description || 'No description available for this product.'}
        </p>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-normal text-[#E36630]">
            PKR {product.price.toLocaleString()}
          </span>
          {showStrike ? (
            <span className="text-sm text-gray-500 line-through">
              List Price: PKR {product.originalPrice.toLocaleString()}
            </span>
          ) : null}
          {showStrike ? (
            <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={product.stock <= 0}
            className="rounded-xl bg-[#E36630] px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#cc5a2a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={onBuyItNow}
            disabled={product.stock <= 0}
            className="rounded-xl border-2 border-[#0F4C69] px-4 py-2 text-sm font-semibold text-[#0F4C69] transition-colors hover:bg-[#0F4C69] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Buy it Now
          </button>
        </div>
      </div>
    </article>
  );
}

type CategoryMeta = { title: string; slug: string };

function pageFromSearchParams(sp: URLSearchParams): number {
  const n = parseInt(sp.get('page') || '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

interface ProductsPageProps {
  /** When routed via /products/[categorySlug] */
  categorySlugFromPath?: string;
}

const ProductsPage = ({ categorySlugFromPath }: ProductsPageProps = {}) => {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const pathname      = usePathname();
  const isMounted     = useRef(false);
  const filtersReadyFromUrl = useRef(false);
  const suppressPageReset = useRef(false);
  const preferAllCategories = useRef(false);
  const categoryListScrollRef = useRef<HTMLDivElement>(null);
  const categoryOptionRefs = useRef<Map<string, HTMLLabelElement>>(new Map());

  // ── Initialise all filter state from URL on first render ──
  const [products,  setProducts]  = useState<Product[]>([]);
  const { categories: storefrontCategories } = useStorefrontCategories();
  const categoryMeta = useMemo(
    () =>
      storefrontCategories
        .filter((c) => c.title && c.slug)
        .map((c) => ({ title: c.title, slug: c.slug })),
    [storefrontCategories],
  );
  const categories = useMemo(
    () => [ALL, ...storefrontCategories.map((c) => c.title).filter(Boolean)],
    [storefrontCategories],
  );
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [total,     setTotal]     = useState(0);
  const [totalPages,setTotalPages]= useState(0);

  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get('category') || ALL,
  );
  const [searchTerm,  setSearchTerm]  = useState(() => searchParams.get('search')  || '');
  const [shuffleSeed] = useState(() => Date.now());
  const [sortBy,      setSortBy]      = useState(() => searchParams.get('sort')    || 'random');
  const [currentPage, setCurrentPage] = useState(() => Math.max(1, parseInt(searchParams.get('page') || '1', 10)));
  const [priceRange,  setPriceRange]  = useState(() => ({
    min: parseInt(searchParams.get('minPrice') || '0', 10),
    max: parseInt(searchParams.get('maxPrice') || '0', 10),
  }));
  const [features, setFeatures] = useState<Record<ProductFeatureFilterKey, boolean>>(() => {
    const f = (searchParams.get('features') || '').split(',').filter(Boolean);
    return {
      freeShipping: f.includes('free_shipping'),
      onSale:       f.includes('on_sale'),
      newArrival:   f.includes('new_arrival'),
      bestSeller:   f.includes('best_seller'),
    };
  });
  const [brands, setBrands] = useState<Record<BrandFilterKey, boolean>>(() => {
    const b = (searchParams.get('brands') || '').split(',').filter(Boolean);
    return { ambassador: b.includes('ambassador'), imported: b.includes('imported') };
  });
  const [availability, setAvailability] = useState(() => {
    const b = (searchParams.get('brands') || '').split(',').filter(Boolean);
    return { readyToShip: b.includes('imported'), customOrder: b.includes('ambassador') };
  });

  const [showCartPopup, setShowCartPopup] = useState(false);
  const [addedProduct,  setAddedProduct]  = useState<Product | null>(null);
  const { addToCart } = useCart();

  const slugPath = useMemo(
    () => categorySlugFromPath ?? slugFromCollectionPath(pathname),
    [categorySlugFromPath, pathname],
  );

  const categoryTitleForSlug = useMemo(() => {
    if (!slugPath || categoryMeta.length === 0) return null;
    const normalized = slugPath.toLowerCase();
    return categoryMeta.find((c) => c.slug.toLowerCase() === normalized)?.title ?? null;
  }, [slugPath, categoryMeta]);

  /** Sidebar + API category — matches /products/[categorySlug] even before state catches up. */
  const activeCategory = useMemo(() => {
    if (selectedCategory !== ALL) return selectedCategory;
    if (preferAllCategories.current) return ALL;
    if (slugPath && categoryTitleForSlug) return categoryTitleForSlug;
    return ALL;
  }, [selectedCategory, slugPath, categoryTitleForSlug]);

  // Keep the selected category visible inside the scrollable category list
  useEffect(() => {
    const container = categoryListScrollRef.current;
    if (!container) return;

    if (activeCategory === ALL) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const option = categoryOptionRefs.current.get(activeCategory);
    option?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeCategory, categories]);

  const buildListingPath = useCallback(
    (overrides: Record<string, string> = {}) => {
      const p = new URLSearchParams();
      const cat = overrides.category ?? activeCategory;
      const q = (overrides.search ?? searchTerm).trim();
      const sort = overrides.sort ?? sortBy;
      const page = overrides.page ?? String(currentPage);
      const minP = overrides.minPrice ?? String(priceRange.min);
      const maxP = overrides.maxPrice ?? String(priceRange.max);
      const feat =
        overrides.features ??
        FEATURE_FILTERS.filter(({ key }) => features[key as ProductFeatureFilterKey])
          .map(({ apiFlag }) => apiFlag)
          .join(',');
      const br =
        overrides.brands ??
        (() => {
          const set = new Set(
            BRAND_FILTERS.filter(({ key }) => brands[key as BrandFilterKey]).map(({ apiSlug }) => apiSlug)
          );
          if (availability.readyToShip) set.add('imported');
          if (availability.customOrder) set.add('ambassador');
          return [...set].join(',');
        })();

      if (sort !== 'random') p.set('sort', sort);
      if (page !== '1') p.set('page', page);
      if (Number(minP) > 0) p.set('minPrice', minP);
      if (Number(maxP) > 0) p.set('maxPrice', maxP);
      if (feat) p.set('features', feat);
      if (br) p.set('brands', br);

      const qs = p.toString();

      if (q) {
        p.set('search', q);
        const searchQs = p.toString();
        return searchQs ? `${PRODUCTS_PATH}?${searchQs}` : PRODUCTS_PATH;
      }

      if (cat && cat !== ALL) {
        const slug =
          categoryMeta.find((c) => c.title === cat)?.slug ??
          (slugPath && categoryTitleForSlug === cat ? slugPath : undefined);
        if (slug) {
          return qs ? `${productsCategoryPath(slug)}?${qs}` : productsCategoryPath(slug);
        }
        p.set('category', cat);
        const legacyQs = p.toString();
        return legacyQs ? `${PRODUCTS_PATH}?${legacyQs}` : PRODUCTS_PATH;
      }

      return qs ? `${PRODUCTS_PATH}?${qs}` : PRODUCTS_PATH;
    },
    [
      activeCategory,
      searchTerm,
      sortBy,
      currentPage,
      priceRange,
      features,
      brands,
      availability,
      categoryMeta,
      slugPath,
      categoryTitleForSlug,
    ]
  );

  // ── Write filters to the URL (path + query, replaceState — no history entry) ──
  const syncURL = useCallback(
    (overrides: Record<string, string> = {}) => {
      if (loading) return;
      setLoading(true);
      setLoadError(null);
      router.replace(buildListingPath(overrides), { scroll: false });
    },
    [buildListingPath, loading, router]
  );

  // Sync URL whenever any filter changes (internal — uses router.replace so no history entry)
  useEffect(() => {
    if (!filtersReadyFromUrl.current) return;
    if (slugPath && categoryMeta.length === 0) return;
    syncURL();
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCategory, searchTerm, sortBy, currentPage, priceRange, features, brands, availability, categoryMeta, slugPath, categoryTitleForSlug, activeCategory]);

  // Respond to external navigation (header search, path-based category URLs)
  useEffect(() => {
    const newSearch = searchParams.get('search') ?? '';
    if (newSearch.trim()) {
      setSearchTerm(newSearch);
      setSelectedCategory(ALL);
      filtersReadyFromUrl.current = true;
      return;
    }

    setSearchTerm('');

    if (slugPath && categoryMeta.length > 0) {
      preferAllCategories.current = false;
      suppressPageReset.current = true;
      setSelectedCategory(categoryTitleForSlug ?? ALL);
      setCurrentPage(pageFromSearchParams(searchParams));
      filtersReadyFromUrl.current = true;
      return;
    }

    if (!slugPath) {
      suppressPageReset.current = true;
      setSelectedCategory(searchParams.get('category') ?? ALL);
      setCurrentPage(pageFromSearchParams(searchParams));
      filtersReadyFromUrl.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname, categoryMeta, categorySlugFromPath, slugPath, categoryTitleForSlug]);

  // Migrate legacy ?category=Title to /products/slug
  useEffect(() => {
    const legacyTitle = searchParams.get('category')?.trim();
    if (!legacyTitle || searchParams.get('search')?.trim() || categoryMeta.length === 0) return;
    if (slugFromCollectionPath(pathname) || categorySlugFromPath) return;

    const match = categoryMeta.find((c) => c.title.toLowerCase() === legacyTitle.toLowerCase());
    if (!match?.slug) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    const qs = params.toString();
    router.replace(qs ? `${productsCategoryPath(match.slug)}?${qs}` : productsCategoryPath(match.slug), {
      scroll: false,
    });
  }, [searchParams, categoryMeta, pathname, categorySlugFromPath, router]);

  // Fetch products from server whenever any filter or page changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const params = new URLSearchParams();
        params.set('page',  String(currentPage));
        params.set('limit', String(PAGE_SIZE));
        if (searchTerm.trim()) {
          params.set('search', searchTerm.trim());
        } else if (activeCategory !== ALL) {
          params.set('category', activeCategory);
        }
        if (priceRange.min > 0)             params.set('minPrice', String(priceRange.min));
        if (priceRange.max > 0)             params.set('maxPrice', String(priceRange.max));
        const apiSort = SORT_MAP[sortBy] ?? 'random';
        params.set('sort', apiSort);
        if (apiSort === 'random') params.set('seed', String(shuffleSeed));

        // Merge brand checkboxes + availability into a single brands param
        const activeBrands = new Set(BRAND_FILTERS.filter(({ key }) => brands[key]).map(({ apiSlug }) => apiSlug));
        if (availability.readyToShip) activeBrands.add('imported');
        if (availability.customOrder) activeBrands.add('ambassador');
        if (activeBrands.size)              params.set('brands', [...activeBrands].join(','));

        const activeFeats = FEATURE_FILTERS.filter(({ key }) => features[key]).map(({ apiFlag }) => apiFlag);
        if (activeFeats.length)             params.set('features', activeFeats.join(','));

        const res  = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json();
        if (!json?.success || !Array.isArray(json.data)) throw new Error(json?.message || 'Failed to load products.');
        if (cancelled) return;

        const mapped = (json.data as ApiProductRow[]).map(mapApiToProduct);
        setProducts(mapped);
        setTotal(json.total ?? mapped.length);
        setTotalPages(json.totalPages ?? 1);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load products.');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentPage, searchTerm, activeCategory, priceRange, sortBy, brands, features, availability, shuffleSeed]);

  // Reset to page 1 when a filter changes — not on mount or URL/path hydration (?page=2 on category URLs)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (suppressPageReset.current) {
      suppressPageReset.current = false;
      return;
    }
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, sortBy, brands, features, availability]);

  const filteredProducts = products; // server already filtered

  const handleFeatureChange = (feature: ProductFeatureFilterKey, checked: boolean) => {
    setFeatures((prev) => ({ ...prev, [feature]: checked }));
  };

  const handleBrandChange = (key: BrandFilterKey, checked: boolean) => {
    setBrands((prev) => ({ ...prev, [key]: checked }));
  };

  const handleAvailabilityChange = (key: string, checked: boolean) => {
    setAvailability((prev) => ({ ...prev, [key]: checked }));
  };

  const buildCartItem = (product: Product) => {
    const code =
      product.specifications['Product Code'] ||
      product.specifications['product code'] ||
      product._id;
    return {
      id: product._id,
      title: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      productCode: String(code),
    };
  };

  const handleAddToCart = (product: Product) => {
    addToCart(buildCartItem(product));
    setAddedProduct(product);
    setShowCartPopup(true);
    setTimeout(() => setShowCartPopup(false), 3000);
  };

  const handleBuyItNow = (product: Product) => {
    if (product.stock <= 0) return;
    addToCart(buildCartItem(product));
    router.push('/checkout');
  };

  const clearFilters = () => {
    preferAllCategories.current = true;
    filtersReadyFromUrl.current = true;
    setSelectedCategory(ALL);
    setPriceRange({ min: 0, max: 0 });
    setSortBy('newest');
    setSearchTerm('');
    setFeatures({
      freeShipping: false,
      onSale: false,
      newArrival: false,
      bestSeller: false,
    });
    setBrands({
      ambassador: false,
      imported: false,
    });
    setAvailability({
      readyToShip: false,
      customOrder: false,
    });
  };

  if (loadError && !loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-700 mb-4">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[#E36630] px-4 py-2 text-white hover:bg-[#cc5a2a]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-28 z-20 border-b border-gray-200 bg-white">
        <div className="container mx-auto max-w-[1600px] px-4">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-[1.25rem] text-sm text-gray-600">
              {!loading && (
                <>
                  {searchTerm.trim() ? (
                    <>
                      <span className="font-semibold">
                        {total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)}
                      </span>{' '}
                      of <span className="font-semibold">{total}</span> results for{' '}
                      <span className="font-semibold text-gray-800">&quot;{searchTerm.trim()}&quot;</span>
                    </>
                  ) : activeCategory !== ALL ? (
                    <>
                      <span className="font-semibold">
                        {total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)}
                      </span>{' '}
                      of <span className="font-semibold">{total}</span> results in{' '}
                      <span className="font-semibold text-gray-800">{activeCategory}</span>
                    </>
                  ) : (
                    <>
                      Showing{' '}
                      <span className="font-semibold">
                        {total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)}
                      </span>{' '}
                      of <span className="font-semibold">{total}</span> products
                    </>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="products-sort" className="text-sm text-gray-700 whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="products-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="min-w-[10rem] rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 outline-none focus:border-[#E36630] focus:ring-2 focus:ring-[#E36630]/35"
              >
                <option value="random">Featured Mix</option>
                <option value="newest">Newest First</option>
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1600px]">
        <div className="flex flex-col lg:flex-row">
          <aside className="w-full shrink-0 border-b border-gray-200 px-4 py-4 lg:w-60 lg:border-b-0 lg:border-r lg:px-5 xl:w-64">
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-[#0F4C69] hover:text-[#E36630] hover:underline"
              >
                Clear all
              </button>
            </div>

              <div className="mb-4 border-b border-gray-200 pb-4">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Category</h3>
                <div ref={categoryListScrollRef} className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {categories.map((category) => (
                    <label
                      key={category}
                      ref={(node) => {
                        if (node) categoryOptionRefs.current.set(category, node);
                        else categoryOptionRefs.current.delete(category);
                      }}
                      className="flex items-center"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={activeCategory === category}
                        onChange={(e) => {
                          const value = e.target.value;
                          preferAllCategories.current = value === ALL;
                          setSelectedCategory(value);
                          setSearchTerm('');
                          filtersReadyFromUrl.current = true;
                        }}
                        className="mr-2 accent-[#E36630] focus:ring-2 focus:ring-[#E36630]/35"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4 border-b border-gray-200 pb-4">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Features</h3>
                <div className="space-y-2">
                  {FEATURE_FILTERS.map(({ key, label }) => (
                    <label key={key} className="flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={features[key]}
                        onChange={(e) => handleFeatureChange(key, e.target.checked)}
                        className="mr-2 accent-[#E36630] focus:ring-2 focus:ring-[#E36630]/35"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4 border-b border-gray-200 pb-4">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Brand</h3>
                <div className="space-y-2">
                  {BRAND_FILTERS.map(({ key, label }) => (
                    <label key={key} className="flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={brands[key]}
                        onChange={(e) => handleBrandChange(key, e.target.checked)}
                        className="mr-2 accent-[#E36630] focus:ring-2 focus:ring-[#E36630]/35"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4 border-b border-gray-200 pb-4">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Availability</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={availability.readyToShip}
                      onChange={(e) => handleAvailabilityChange('readyToShip', e.target.checked)}
                      className="mr-2 accent-[#E36630] focus:ring-2 focus:ring-[#E36630]/35"
                    />
                    <span className="text-sm text-gray-700">Ready to Ship</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={availability.customOrder}
                      onChange={(e) => handleAvailabilityChange('customOrder', e.target.checked)}
                      className="mr-2 accent-[#E36630] focus:ring-2 focus:ring-[#E36630]/35"
                    />
                    <span className="text-sm text-gray-700">Custom Order</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-gray-900">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">
                      Min: PKR {priceRange.min.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={500000}
                      step={1000}
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: parseInt(e.target.value, 10) })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">
                      Max: PKR {priceRange.max > 0 ? priceRange.max.toLocaleString() : 'Any'}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={500000}
                      step={1000}
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: parseInt(e.target.value, 10) })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
          </aside>

          <main className="min-w-0 flex-1 px-4 py-4 lg:px-6">
            <h2 className="text-lg font-bold text-gray-900">Results</h2>
            <p className="mt-1 text-xs text-gray-500">
              Check each product page for other buying options. Prices and availability may vary.
            </p>

            {loading ? (
              <PageLoader
                message="Loading products…"
                fullScreen={false}
                className="min-h-[280px] bg-white"
              />
            ) : filteredProducts.length > 0 ? (
              <div className="mt-3 divide-y divide-gray-200 border-t border-gray-200">
                {filteredProducts.map((product) => (
                  <ProductResultRow
                    key={product._id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    onBuyItNow={() => handleBuyItNow(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-3 border-t border-gray-200 py-16 text-center">
                <div className="mb-2 text-lg font-medium text-gray-800">No products found</div>
                <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}

            {!loading && totalPages > 1 && (() => {
              const getPages = (): (number | '…')[] => {
                if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
                const pages: (number | '…')[] = [1];
                if (currentPage > 3) pages.push('…');
                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                if (currentPage < totalPages - 2) pages.push('…');
                pages.push(totalPages);
                return pages;
              };
              return (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#E36630] hover:text-[#E36630] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {getPages().map((page, idx) =>
                      page === '…' ? (
                        <span key={`ellipsis-${idx}`} className="select-none px-2 py-2 text-sm text-gray-400">…</span>
                      ) : (
                        <button
                          key={page}
                          type="button"
                          onClick={() => { setCurrentPage(page as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`min-h-[36px] min-w-[36px] rounded-lg text-sm font-semibold transition-colors ${
                            currentPage === page
                              ? 'bg-[#E36630] text-white'
                              : 'border border-gray-200 bg-white text-gray-700 hover:border-[#E36630] hover:text-[#E36630]'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#E36630] hover:text-[#E36630] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              );
            })()}
          </main>
        </div>
      </div>

      <CartPopup
        show={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        product={
          addedProduct
            ? {
                title: addedProduct.name,
                images: [addedProduct.image],
                specifications: {
                  'Product Code':
                    addedProduct.specifications['Product Code'] ||
                    addedProduct.specifications['product code'] ||
                    addedProduct._id,
                },
                price: addedProduct.price,
              }
            : undefined
        }
      />
    </div>
  );
};

export default ProductsPage;
