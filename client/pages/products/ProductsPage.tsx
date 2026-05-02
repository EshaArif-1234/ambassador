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

function mapApiToProduct(p: ApiProductRow): Product {
  const cats = Array.isArray(p.categories)
    ? p.categories.map((c) => c.title).filter((t): t is string => Boolean(t))
    : [];
  const category = cats[0] ?? 'Uncategorized';
  const displayPrice =
    p.price != null && p.price > 0 ? p.price : p.originalPrice ?? 0;
  const image = p.images?.[0] || '/Images/home/stainless-steal.webp';
  const featured =
    Array.isArray(p.features) &&
    (p.features.includes('best_seller') || p.features.includes('new_arrival'));
  return {
    _id: String(p._id),
    name: p.name,
    category,
    categoryTitles: cats,
    price: displayPrice,
    originalPrice: p.originalPrice ?? displayPrice,
    image,
    featured,
    stock: p.stock ?? 0,
    features: p.features ?? [],
    brands: p.brands ?? [],
    specifications: p.specifications ?? {},
    avgRating: p.avgRating ?? 0,
    reviewCount: p.reviewCount ?? 0,
  };
}

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
  const [features, setFeatures] = useState({
    inStock: false,
    freeShipping: false,
    onSale: false,
    newArrival: false,
    bestSeller: false,
    premiumQuality: false,
  });
  const [brands, setBrands] = useState({
    ambassador: false,
    imported: false,
    premiumPlus: false,
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

    if (features.inStock) filtered = filtered.filter((p) => p.stock > 0);
    if (features.freeShipping) filtered = filtered.filter((p) => p.features.includes('free_shipping'));
    if (features.onSale) filtered = filtered.filter((p) => p.features.includes('on_sale'));
    if (features.newArrival) filtered = filtered.filter((p) => p.features.includes('new_arrival'));
    if (features.bestSeller) filtered = filtered.filter((p) => p.features.includes('best_seller'));

    const brandFilters = [
      brands.ambassador ? 'ambassador' : '',
      brands.imported ? 'imported' : '',
    ].filter(Boolean);
    if (brandFilters.length) {
      filtered = filtered.filter((p) => brandFilters.some((b) => p.brands.includes(b)));
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

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFeatures((prev) => ({ ...prev, [feature]: checked }));
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    setBrands((prev) => ({ ...prev, [brand]: checked }));
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
      inStock: false,
      freeShipping: false,
      onSale: false,
      newArrival: false,
      bestSeller: false,
      premiumQuality: false,
    });
    setBrands({
      ambassador: false,
      imported: false,
      premiumPlus: false,
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
            className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-gray-400"
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
                        className="mr-2 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Features</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={features.inStock}
                      onChange={(e) => handleFeatureChange('inStock', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">In Stock</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={features.freeShipping}
                      onChange={(e) => handleFeatureChange('freeShipping', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Free Shipping</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={features.onSale}
                      onChange={(e) => handleFeatureChange('onSale', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">On Sale</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={features.newArrival}
                      onChange={(e) => handleFeatureChange('newArrival', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">New Arrival</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={features.bestSeller}
                      onChange={(e) => handleFeatureChange('bestSeller', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Best Seller</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={features.premiumQuality}
                      onChange={(e) => handleFeatureChange('premiumQuality', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Premium Quality</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Brand</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={brands.ambassador}
                      onChange={(e) => handleBrandChange('ambassador', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Ambassador</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={brands.imported}
                      onChange={(e) => handleBrandChange('imported', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Imported</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={brands.premiumPlus}
                      onChange={(e) => handleBrandChange('premiumPlus', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Premium Plus</span>
                  </label>
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
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Ready to Ship</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={availability.customOrder}
                      onChange={(e) => handleAvailabilityChange('customOrder', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
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
                      Min: ₹{priceRange.min.toLocaleString()}
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
                      Max: ₹{priceRange.max.toLocaleString()}
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
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
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
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative h-48 sm:h-auto sm:w-64 flex-shrink-0">
                          <Link href={`/products/${product._id}`} className="block h-full min-h-[12rem] sm:min-h-[14rem]">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 100vw, 256px"
                            />
                          </Link>
                          {product.featured && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                              Featured
                            </div>
                          )}
                        </div>

                        <div className="flex-1 p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                              <p className="text-sm text-gray-600 mb-3">{product.category}</p>

                              <div className="mb-4">
                                <ProductRatingDropdown
                                  averageRating={
                                    product.reviewCount ? product.avgRating : 0
                                  }
                                  totalReviews={product.reviewCount}
                                  productName={product.name}
                                />
                              </div>

                              <div className="flex items-center gap-4 mb-4">
                                <div>
                                  <span className="text-xl font-bold text-orange-500">
                                    ₹{product.price.toLocaleString()}
                                  </span>
                                  {showStrike && (
                                    <div className="text-xs text-gray-500 line-through">
                                      ₹{product.originalPrice.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => handleAddToCart(product)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                              >
                                Add to Cart
                              </button>
                            </div>
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
