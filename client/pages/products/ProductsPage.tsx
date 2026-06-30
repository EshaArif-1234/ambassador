'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProductRatingDropdown from '@/components/products/ProductRatingDropdown';
import CartPopup from '@/components/products/CartPopup';
import WishlistButton from '@/components/products/WishlistButton';
import { useCart } from '@/contexts/CartContext';
import PageLoader from '@/components/ui/PageLoader';
import {
  COLLECTION_PATH,
  collectionCategoryPath,
  productDetailPath,
  slugFromCollectionPath,
} from '@/lib/siteRoutes';

interface ApiCategoryRef {
  _id?: string;
  title?: string;
  slug?: string;
}

interface ApiProductRow {
  _id: string;
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

type CategoryMeta = { title: string; slug: string };

interface ProductsPageProps {
  /** When routed via /our-collection/[categorySlug] */
  categorySlugFromPath?: string;
}

const ProductsPage = ({ categorySlugFromPath }: ProductsPageProps = {}) => {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const pathname      = usePathname();
  const isMounted     = useRef(false);

  // ── Initialise all filter state from URL on first render ──
  const [products,  setProducts]  = useState<Product[]>([]);
  const [categories,setCategories]= useState<string[]>([ALL]);
  const [categoryMeta, setCategoryMeta] = useState<CategoryMeta[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [total,     setTotal]     = useState(0);
  const [totalPages,setTotalPages]= useState(0);

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (categorySlugFromPath) return ALL;
    return searchParams.get('category') || ALL;
  });
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

  const buildListingPath = useCallback(
    (overrides: Record<string, string> = {}) => {
      const p = new URLSearchParams();
      const cat = overrides.category ?? selectedCategory;
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
        return searchQs ? `${COLLECTION_PATH}?${searchQs}` : COLLECTION_PATH;
      }

      if (cat && cat !== ALL) {
        const slug = categoryMeta.find((c) => c.title === cat)?.slug;
        if (slug) {
          return qs ? `${collectionCategoryPath(slug)}?${qs}` : collectionCategoryPath(slug);
        }
        p.set('category', cat);
        const legacyQs = p.toString();
        return legacyQs ? `${COLLECTION_PATH}?${legacyQs}` : COLLECTION_PATH;
      }

      return qs ? `${COLLECTION_PATH}?${qs}` : COLLECTION_PATH;
    },
    [
      selectedCategory,
      searchTerm,
      sortBy,
      currentPage,
      priceRange,
      features,
      brands,
      availability,
      categoryMeta,
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
    const slugPath = categorySlugFromPath ?? slugFromCollectionPath(pathname);
    if (slugPath && categoryMeta.length === 0) return;
    syncURL();
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCategory, searchTerm, sortBy, currentPage, priceRange, features, brands, availability]);

  // Respond to external navigation (header search, path-based category URLs)
  useEffect(() => {
    const newSearch = searchParams.get('search') ?? '';
    if (newSearch.trim()) {
      setSearchTerm(newSearch);
      setSelectedCategory(ALL);
      return;
    }

    setSearchTerm('');

    const slugFromPath = categorySlugFromPath ?? slugFromCollectionPath(pathname);
    if (slugFromPath && categoryMeta.length > 0) {
      const match = categoryMeta.find((c) => c.slug === slugFromPath);
      setSelectedCategory(match?.title ?? ALL);
      return;
    }

    setSelectedCategory(searchParams.get('category') ?? ALL);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname, categoryMeta, categorySlugFromPath]);

  // Migrate legacy ?category=Title to /our-collection/slug
  useEffect(() => {
    const legacyTitle = searchParams.get('category')?.trim();
    if (!legacyTitle || searchParams.get('search')?.trim() || categoryMeta.length === 0) return;
    if (slugFromCollectionPath(pathname) || categorySlugFromPath) return;

    const match = categoryMeta.find((c) => c.title.toLowerCase() === legacyTitle.toLowerCase());
    if (!match?.slug) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    const qs = params.toString();
    router.replace(qs ? `${collectionCategoryPath(match.slug)}?${qs}` : collectionCategoryPath(match.slug), {
      scroll: false,
    });
  }, [searchParams, categoryMeta, pathname, categorySlugFromPath, router]);

  // Fetch categories once
  useEffect(() => {
    let cancelled = false;
    fetch('/api/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json?.success && Array.isArray(json.data)) {
          const rows = json.data as { title: string; slug?: string }[];
          const meta = rows
            .filter((c) => c.title && c.slug)
            .map((c) => ({ title: c.title, slug: c.slug! }));
          setCategoryMeta(meta);
          setCategories([ALL, ...rows.map((c) => c.title).filter(Boolean)]);
        }
      })
      .catch(() => { if (!cancelled) setCategories([ALL]); });
    return () => { cancelled = true; };
  }, []);

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
        } else if (selectedCategory !== ALL) {
          params.set('category', selectedCategory);
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
  }, [currentPage, searchTerm, selectedCategory, priceRange, sortBy, brands, features, availability, shuffleSeed]);

  // Reset to page 1 when a filter changes — but NOT on initial mount (so ?page=13 survives a refresh)
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
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
    <div className="min-h-screen bg-[#E3E6E6]">
      <div className="sticky top-28 z-20 border-b border-gray-200 bg-white shadow-sm">
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
                  ) : selectedCategory !== ALL ? (
                    <>
                      <span className="font-semibold">
                        {total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)}
                      </span>{' '}
                      of <span className="font-semibold">{total}</span> results in{' '}
                      <span className="font-semibold text-gray-800">{selectedCategory}</span>
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

      <div className="container mx-auto max-w-[1600px] px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <aside className="w-full shrink-0 lg:w-64">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Filters</h2>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Category</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSearchTerm('');
                        }}
                        className="mr-2 accent-[#E36630] focus:ring-2 focus:ring-[#E36630]/35"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Features</h3>
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

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Brand</h3>
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

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Availability</h3>
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

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Price Range</h3>
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

              <button
                type="button"
                onClick={clearFilters}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                <span className="text-[#E36630]">Premium</span> 
                <span className="text-[#0F4C69]"> Products</span>
              </h1>
              <p className="text-lg text-gray-600">Browse our extensive collection of kitchen equipment</p>
            </div>

            <div>
            {loading ? (
              <PageLoader
                message="Loading products…"
                fullScreen={false}
                className="rounded-lg bg-white shadow-md"
              />
            ) : filteredProducts.length > 0 ? (
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const showStrike =
                    product.originalPrice > product.price &&
                    product.price > 0;
                  return (
                    <div
                      key={product._id}
                      className="group relative flex flex-col sm:flex-row overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:border-[#E36630]/30 transition-all duration-300 sm:h-64"
                    >
                      {/* ── Image ── */}
                      <div className="relative h-64 w-full shrink-0 sm:h-full sm:w-72 overflow-hidden bg-[#EEF5F9]">
                        <Link href={productDetailPath(product._id, product.categorySlug)} className="block absolute inset-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, 288px"
                          />
                        </Link>
                        <WishlistButton productId={product._id} />

                        {/* Orange bottom accent */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E36630] via-[#0F4C69] to-[#E36630] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* ── Content ── */}
                      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 min-w-0">

                        {/* Top: name + category + description */}
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link href={productDetailPath(product._id, product.categorySlug)} className="flex-1 min-w-0">
                              <h3 className="text-base font-bold leading-snug text-gray-900 line-clamp-1 group-hover:text-[#E36630] transition-colors duration-200">
                                {product.name}
                              </h3>
                            </Link>
                            {product.brands.length > 0 && (
                              <span className="shrink-0 rounded-full border border-[#E36630] bg-[#E36630]/8 px-2.5 py-0.5 text-[10px] font-bold text-[#E36630]">
                                {formatBrandLabels(product.brands)}
                              </span>
                            )}
                          </div>

                          {product.category && (
                            <span className="inline-flex items-center gap-1 text-xs text-[#0F4C69] font-medium">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {product.category}
                            </span>
                          )}

                          <p className="text-xs leading-relaxed text-gray-500 line-clamp-2 mt-0.5">
                            {product.description || 'No description available for this product.'}
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="my-3 h-px bg-gray-100" />

                        {/* Bottom: rating + price + button */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-col gap-1">
                            <div className="shrink-0">
                              <ProductRatingDropdown
                                productId={product._id}
                                averageRating={product.reviewCount ? product.avgRating : 0}
                                totalReviews={product.reviewCount}
                                productName={product.name}
                              />
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-extrabold text-[#E36630] tracking-tight">
                                PKR {product.price.toLocaleString()}
                              </span>
                              {showStrike && (
                                <span className="text-xs text-gray-400 line-through">
                                  PKR {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                              {showStrike && (
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleBuyItNow(product)}
                              disabled={product.stock <= 0}
                              className="flex items-center gap-1.5 rounded-xl border-2 border-[#0F4C69] px-3 py-2 text-xs font-semibold text-[#0F4C69] hover:bg-[#0F4C69] hover:text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Buy it Now
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock <= 0}
                              className="flex items-center gap-2 rounded-xl bg-[#E36630] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#cc5a2a] active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No products found</div>
                <p className="text-gray-400">Try adjusting your filters or search terms</p>
              </div>
            )}

            {/* ── Pagination ── */}
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
                <div className="mt-8 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 hover:border-[#E36630] hover:text-[#E36630] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {getPages().map((page, idx) =>
                      page === '…' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400 text-sm select-none">…</span>
                      ) : (
                        <button
                          key={page}
                          type="button"
                          onClick={() => { setCurrentPage(page as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`min-w-[38px] h-[38px] rounded-xl text-sm font-semibold transition-all ${
                            currentPage === page
                              ? 'bg-[#E36630] text-white shadow-md shadow-[#E36630]/30 scale-105'
                              : 'border border-gray-200 bg-white text-gray-700 hover:bg-[#E36630]/8 hover:border-[#E36630] hover:text-[#E36630]'
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
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 hover:border-[#E36630] hover:text-[#E36630] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              );
            })()}
            </div>
          </div>
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
