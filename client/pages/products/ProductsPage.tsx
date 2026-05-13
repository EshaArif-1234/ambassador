'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProductRatingDropdown from '@/components/products/ProductRatingDropdown';
import CartPopup from '@/components/products/CartPopup';
import { useCart } from '@/contexts/CartContext';

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
  const cats = Array.isArray(p.categories)
    ? p.categories.map((c) => c.title).filter((t): t is string => Boolean(t))
    : [];
  const category = cats[0] ?? 'Uncategorized';
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

const ProductsPage = () => {
  const [rawProducts, setRawProducts] = useState<ApiProductRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([ALL]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const [features, setFeatures] = useState<Record<ProductFeatureFilterKey, boolean>>({
    freeShipping: false,
    onSale: false,
    newArrival: false,
    bestSeller: false,
  });
  const [brands, setBrands] = useState<Record<BrandFilterKey, boolean>>({
    ambassador: false,
    imported: false,
  });
  const [availability, setAvailability] = useState({
    readyToShip: false,
    customOrder: false,
  });
  const searchParams = useSearchParams();

  const catalogPriceMax = useMemo(() => {
    if (!products.length) return 50000;
    return Math.max(50000, ...products.map((p) => p.price), ...products.map((p) => p.originalPrice));
  }, [products]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        const json = await res.json();
        if (!json?.success || !Array.isArray(json.data)) {
          throw new Error(json?.message || 'Failed to load products.');
        }
        if (cancelled) return;
        setRawProducts(json.data as ApiProductRow[]);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load products.');
          setRawProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' });
        const json = await res.json();
        if (!cancelled && json?.success && Array.isArray(json.data)) {
          const titles = (json.data as { title: string }[]).map((c) => c.title).filter(Boolean);
          setCategories([ALL, ...titles]);
        }
      } catch {
        if (!cancelled) setCategories([ALL]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setProducts(rawProducts.map(mapApiToProduct));
  }, [rawProducts]);

  useEffect(() => {
    setPriceRange((prev) => ({ ...prev, max: Math.max(prev.max, catalogPriceMax) }));
  }, [catalogPriceMax]);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
  }, [searchParams]);

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory && selectedCategory !== ALL) {
      filtered = filtered.filter((product) => product.categoryTitles.includes(selectedCategory));
    }

    filtered = filtered.filter(
      (product) => product.price >= priceRange.min && product.price <= priceRange.max
    );

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.categoryTitles.some((t) => t.toLowerCase().includes(q))
      );
    }

    for (const { key, apiFlag } of FEATURE_FILTERS) {
      if (features[key]) {
        filtered = filtered.filter((p) => p.features.includes(apiFlag));
      }
    }

    const selectedBrandSlugs = BRAND_FILTERS.filter(({ key }) => brands[key]).map(
      ({ apiSlug }) => apiSlug
    );
    if (selectedBrandSlugs.length > 0) {
      filtered = filtered.filter((p) =>
        selectedBrandSlugs.some((slug) => p.brands.includes(slug))
      );
    }

    if (availability.readyToShip) filtered = filtered.filter((p) => p.stock > 0);
    if (availability.customOrder) filtered = filtered.filter((p) => p.stock <= 0);

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredProducts(filtered);
  }, [
    products,
    selectedCategory,
    priceRange,
    sortBy,
    searchTerm,
    features,
    brands,
    availability,
  ]);

  const handleFeatureChange = (feature: ProductFeatureFilterKey, checked: boolean) => {
    setFeatures((prev) => ({ ...prev, [feature]: checked }));
  };

  const handleBrandChange = (key: BrandFilterKey, checked: boolean) => {
    setBrands((prev) => ({ ...prev, [key]: checked }));
  };

  const handleAvailabilityChange = (key: string, checked: boolean) => {
    setAvailability((prev) => ({ ...prev, [key]: checked }));
  };

  const handleAddToCart = (product: Product) => {
    const code =
      product.specifications['Product Code'] || product.specifications['product code'] || product._id;
    addToCart({
      id: product._id,
      title: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      productCode: String(code),
    });
    setAddedProduct(product);
    setShowCartPopup(true);
    setTimeout(() => setShowCartPopup(false), 3000);
  };

  const clearFilters = () => {
    setSelectedCategory(ALL);
    setPriceRange({ min: 0, max: catalogPriceMax });
    setSortBy('name');
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
      <div className="min-h-screen bg-gray-50 py-8">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Products</h1>
          <p className="text-lg text-gray-600">Browse our extensive collection of kitchen equipment</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Filters</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#E36630] focus:ring-2 focus:ring-[#E36630]/35"
                />
              </div>

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
                        onChange={(e) => setSelectedCategory(e.target.value)}
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
                      max={catalogPriceMax}
                      step={Math.max(1000, Math.ceil(catalogPriceMax / 500))}
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: parseInt(e.target.value, 10) })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">
                      Max: PKR {priceRange.max.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={catalogPriceMax}
                      step={Math.max(1000, Math.ceil(catalogPriceMax / 500))}
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
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-gray-600">
                  {loading ? (
                    <span>Loading products…</span>
                  ) : (
                    <>
                      Showing <span className="font-semibold">{filteredProducts.length}</span> of{' '}
                      <span className="font-semibold">{products.length}</span> products
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 outline-none focus:border-[#E36630] focus:ring-2 focus:ring-[#E36630]/35"
                  >
                    <option value="name">Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="min-h-[20rem] animate-pulse rounded-lg bg-gray-200 sm:h-64 sm:min-h-0"
                  />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const showStrike =
                    product.originalPrice > product.price &&
                    product.price > 0;
                  return (
                    <div
                      key={product._id}
                      className="flex min-h-[20rem] flex-col overflow-hidden bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.10)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.18)] transition-shadow duration-300 sm:h-64 sm:min-h-0 sm:flex-row"
                    >
                      <div className="relative h-48 w-full shrink-0 sm:h-full sm:w-64 rounded-l-xl  border-2 border-[#E5E5E5] overflow-hidden bg-[#EEF5F9]">
                        <Link
                          href={`/products/${product._id}`}
                          className="block absolute inset-0"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, 256px"
                          />
                        </Link>
                      </div>

                      <div className="flex min-h-0 min-w-0 flex-1 bg-white flex-col overflow-y-auto p-4 sm:p-5 sm:py-4">
                        <div className="flex flex-1 flex-col gap-2 min-h-0 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4">
                          <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
                            <h3 className="text-lg font-semibold leading-snug text-gray-800 line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600">{product.category}</p>
                            <p
                              className="text-sm leading-relaxed text-gray-600 line-clamp-3"
                              title={
                                product.description ||
                                'No description available for this product.'
                              }
                            >
                              {product.description
                                ? product.description
                                : 'No description available for this product.'}
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">Stock: </span>
                              {product.stock > 0 ? (
                                <span className="font-medium text-green-700">
                                  {product.stock} available
                                </span>
                              ) : (
                                <span className="font-medium text-red-600">Out of stock</span>
                              )}
                            </p>
                            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                              <div className="min-w-0 shrink">
                                <ProductRatingDropdown
                                  productId={product._id}
                                  averageRating={
                                    product.reviewCount ? product.avgRating : 0
                                  }
                                  totalReviews={product.reviewCount}
                                  productName={product.name}
                                />
                              </div>
                              {product.brands.length > 0 ? (
                                <span className="shrink-0 rounded-full border-2 border-[#E36630] bg-gradient-to-r from-[#E36630]/15 to-[#E36630]/8 px-3 py-1 text-xs font-bold text-[#E36630] shadow-sm">
                                  {formatBrandLabels(product.brands)}
                                </span>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap items-baseline gap-2 pt-1">
                              <span className="text-xl font-bold text-[#E36630]">
                                PKR {product.price.toLocaleString()}
                              </span>
                              {showStrike && (
                                <span className="text-sm text-gray-500 line-through">
                                  PKR {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-end sm:justify-end pt-2 sm:pt-0 sm:pl-2">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock <= 0}
                              className="w-full rounded-lg bg-[#E36630] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#cc5a2a] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:whitespace-nowrap"
                            >
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
