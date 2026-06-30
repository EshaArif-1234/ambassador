'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import ProductDetailGallery from '@/components/products/ProductDetailGallery';
import {
  PRODUCT_PLACEHOLDER,
  resolveProductImages,
  resolveProductVideos,
} from '@/utils/productMedia.util';
import ProductRatingDropdown, {
  type RatingBreakdown,
} from '@/components/products/ProductRatingDropdown';
import CartPopup from '@/components/products/CartPopup';
import WishlistButton from '@/components/products/WishlistButton';
import { useCart } from '@/contexts/CartContext';
import PageLoader from '@/components/ui/PageLoader';
import {
  COLLECTION_PATH,
  catalogueHref,
  collectionCategoryPath,
  primaryCategorySlug,
  productDetailPath,
} from '@/lib/siteRoutes';

interface CategoryRef {
  title?: string;
  slug?: string;
}

interface ProductDetail {
  _id: string;
  name: string;
  about: string;
  price?: number;
  originalPrice: number;
  stock: number;
  images: string[];
  imagePublicIds?: string[];
  videos: string[];
  videoPublicIds?: string[];
  brands?: unknown;
  specifications: Record<string, string>;
  categories: CategoryRef[];
  avgRating: number;
  reviewCount: number;
}

interface CatalogProductRow {
  _id: string;
  name: string;
  price?: number;
  originalPrice: number;
  images: string[];
  categories?: { title?: string; slug?: string }[];
}

interface ReviewRow {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const BRAND_FILTERS = [
  { apiSlug: 'ambassador', label: 'Ambassador' },
  { apiSlug: 'imported', label: 'Imported' },
] as const;

function normalizeBrandTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string' && x.length > 0);
}

function formatBrandLabels(slugs: string[]): string {
  if (!slugs.length) return '';
  const ordered = BRAND_FILTERS.filter(({ apiSlug }) => slugs.includes(apiSlug)).map(
    ({ label }) => label
  );
  const unknown = slugs.filter((s) => !BRAND_FILTERS.some((b) => b.apiSlug === s));
  return [...ordered, ...unknown].join(' · ');
}

function rowDisplayPrice(p: { price?: number; originalPrice: number }): number {
  return p.price != null && p.price > 0 ? p.price : p.originalPrice;
}

const ProductDetailPage = ({ productId }: { productId: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<CatalogProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const relatedScrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const galleryImages = useMemo(
    () =>
      product
        ? resolveProductImages({
            images: product.images,
            imagePublicIds: product.imagePublicIds,
          })
        : [],
    [product]
  );

  const galleryVideos = useMemo(
    () =>
      product
        ? resolveProductVideos({
            videos: product.videos,
            videoPublicIds: product.videoPublicIds,
          })
        : [],
    [product]
  );

  const ratingBreakdown = useMemo<RatingBreakdown>(() => {
    const m: RatingBreakdown = {};
    for (const r of reviews) {
      const k = Math.min(5, Math.max(1, Math.round(Number(r.rating)))) as
        | 1
        | 2
        | 3
        | 4
        | 5;
      m[k] = (m[k] ?? 0) + 1;
    }
    return m;
  }, [reviews]);

  useEffect(() => {
    setQuantity(1);
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      setUnavailable(false);
      setLoadError(null);
      setProduct(null);
      setReviews([]);
      setRelatedProducts([]);

      try {
        const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.status === 404) {
          if (json?.code === 'unavailable') setUnavailable(true);
          else setNotFound(true);
          return;
        }

        if (!res.ok || !json?.success || !json?.data?.product) {
          setLoadError(json?.message || 'Could not load this product. Please try again.');
          return;
        }

        const p = json.data.product as ProductDetail;
        const rev = (json.data.reviews ?? []) as ReviewRow[];
        setProduct(p);
        setReviews(rev);
      } catch {
        if (!cancelled) {
          setLoadError('Could not load this product. Please check your connection and try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    const catSlug = primaryCategorySlug(product.categories);
    if (!catSlug) return;
    const canonical = productDetailPath(String(product._id), catSlug);
    const normalized =
      pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    if (normalized !== canonical) {
      router.replace(canonical, { scroll: false });
    }
  }, [product, pathname, router]);

  useEffect(() => {
    if (!product) return;
    let cancelled = false;

    (async () => {
      const categoryTitles = [
        ...new Set(
          (product.categories ?? [])
            .map((c) => (typeof c.title === 'string' ? c.title.trim() : ''))
            .filter(Boolean)
        ),
      ];

      if (!categoryTitles.length) {
        if (!cancelled) setRelatedProducts([]);
        return;
      }

      try {
        const seen = new Set<string>();
        const merged: CatalogProductRow[] = [];
        const maxRelated = 16;

        for (const title of categoryTitles) {
          if (merged.length >= maxRelated) break;

          const params = new URLSearchParams({
            category: title,
            limit: '50',
            page: '1',
            exclude: product._id,
          });

          const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
          const json = await res.json();
          if (!json?.success || !Array.isArray(json.data)) continue;

          for (const row of json.data as CatalogProductRow[]) {
            const id = String(row._id);
            if (seen.has(id)) continue;
            seen.add(id);
            merged.push(row);
            if (merged.length >= maxRelated) break;
          }
        }

        if (!cancelled) setRelatedProducts(merged);
      } catch {
        if (!cancelled) setRelatedProducts([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [product]);

  const displayPrice =
    product && product.price != null && product.price > 0
      ? product.price
      : product?.originalPrice ?? 0;
  const showDiscount =
    product &&
    product.price != null &&
    product.price > 0 &&
    product.originalPrice > product.price;

  const categoryLine = product?.categories?.map((c) => c.title).filter(Boolean).join(' · ');
  const primaryCat = product?.categories?.[0];
  const brandTags = product ? normalizeBrandTags(product.brands) : [];

  const buildCartItem = () => {
    if (!product) return null;
    const firstImage = galleryImages[0] ?? PRODUCT_PLACEHOLDER;
    const code =
      product.specifications['Product Code'] ||
      product.specifications['product code'] ||
      product._id;
    return {
      id: product._id,
      title: product.name,
      price: displayPrice,
      quantity,
      image: firstImage,
      productCode: String(code),
    };
  };

  const handleAddToCart = () => {
    const item = buildCartItem();
    if (!item) return;
    addToCart(item);
    setShowCartPopup(true);
  };

  const handleBuyItNow = () => {
    const item = buildCartItem();
    if (!item) return;
    addToCart(item);
    router.push('/checkout');
  };

  const backButton = (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md transition-shadow hover:shadow-lg"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 pt-6">{backButton}</div>
        <PageLoader message="Loading product…" fullScreen={false} className="min-h-[70vh]" />
      </div>
    );
  }

  if (notFound || unavailable || loadError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">{backButton}</div>
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {unavailable
                ? 'Product no longer available'
                : loadError
                  ? 'Unable to load product'
                  : 'Product not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              {unavailable
                ? 'This item has been removed from our catalog.'
                : loadError
                  ? loadError
                  : 'The product may have been removed or the link is incorrect.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {loadError ? (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-lg bg-[#0F4C69] px-6 py-3 text-white transition-colors hover:bg-[#0d4259]"
                >
                  Try again
                </button>
              ) : null}
              <Link href={COLLECTION_PATH} className="rounded-lg bg-[#E36630] px-6 py-3 font-medium text-white transition-colors hover:bg-[#cc5a2a]">
                Browse products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-4">
          {backButton}
          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="transition-colors hover:text-[#E36630]">
              Home
            </Link>
            <span>/</span>
            <Link href={COLLECTION_PATH} className="transition-colors hover:text-[#E36630]">
              Products
            </Link>
            {primaryCat?.slug && primaryCat.title ? (
              <>
                <span>/</span>
                <Link
                  href={collectionCategoryPath(primaryCat.slug)}
                  className="transition-colors hover:text-[#E36630]"
                >
                  {primaryCat.title}
                </Link>
              </>
            ) : null}
            <span>/</span>
            <span className="text-gray-800 line-clamp-2">{product.name}</span>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-md p-12 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ProductDetailGallery
                productName={product.name}
                images={galleryImages}
                videos={galleryVideos}
              />
            </div>

            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800 flex-1 min-w-0">{product.name}</h1>
                <WishlistButton productId={product._id} variant="inline" iconClassName="w-6 h-6" />
              </div>
              {categoryLine ? (
                <p className="mb-4 text-sm text-gray-600">{categoryLine}</p>
              ) : null}

              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="min-w-0 shrink">
                  <ProductRatingDropdown
                    productId={product._id}
                    ratingBreakdown={ratingBreakdown}
                    averageRating={product.reviewCount ? product.avgRating : 0}
                    totalReviews={product.reviewCount}
                    productName={product.name}
                  />
                </div>
                {brandTags.length > 0 ? (
                  <span className="shrink-0 rounded-full border-2 border-[#E36630] bg-gradient-to-r from-[#E36630]/15 to-[#E36630]/8 px-3 py-1 text-xs font-bold text-[#E36630] shadow-sm">
                    {formatBrandLabels(brandTags)}
                  </span>
                ) : null}
                {/* <p className="shrink-0 text-sm">
                  <span className="text-gray-500">Stock: </span>
                  {product.stock > 0 ? (
                    <span className="font-semibold text-green-700">{product.stock} available</span>
                  ) : (
                    <span className="font-semibold text-red-600">Out of stock</span>
                  )}
                </p> */}
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-bold text-[#E36630]">
                    PKR {displayPrice.toLocaleString()}
                  </span>
                  {showDiscount && (
                    <span className="text-xl text-gray-500 line-through">
                      PKR {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {showDiscount && (
                  <p className="text-green-600 text-sm mt-1">
                    Save PKR {(product.originalPrice - (product.price ?? 0)).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">About the Product</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {product.about?.trim() || 'No description yet.'}
                </p>
              </div>

              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-16 text-center border-none focus:outline-none text-gray-800 font-semibold"
                    min={1}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="min-w-[140px] flex-1 rounded-lg border-2 border-[#0F4C69] px-5 py-3 font-medium text-[#0F4C69] transition-colors hover:bg-[#0F4C69] hover:text-white"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyItNow}
                  className="min-w-[140px] flex-1 rounded-lg bg-[#E36630] px-5 py-3 font-medium text-white transition-colors hover:bg-[#cc5a2a]"
                >
                  Buy it Now
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h3>
                {Object.keys(product.specifications ?? {}).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-baseline gap-3 py-2 border-b border-gray-100">
                        <span className="text-sm text-[#0F4C69] font-bold shrink-0 min-w-[120px]">{key}:</span>
                        <span className="text-sm text-gray-700 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No specifications listed.</p>
                )}
              </div>

              
            </div>
          </div>
        </div>

        <div id="customer-reviews" className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100">
                      <div className="absolute inset-0 flex items-center justify-center bg-[#101827]">
                        <span className="text-white font-bold text-lg">
                          {review.name
                            .split(' ')
                            .map((word) => word[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{review.name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(review.rating)
                                  ? 'fill-current text-[#E36630]'
                                  : 'fill-current text-gray-300'
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {relatedProducts.length > 0 ? (
          <section className="mt-8 rounded-lg bg-white p-6 shadow-md" aria-label="Related products">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Related products</h2>
                {categoryLine ? (
                  <p className="mt-1 text-sm text-gray-500">
                    {relatedProducts.length} in {categoryLine}
                    {relatedProducts.length >= 16 ? ' (showing first 16)' : ''}
                    {' · '}
                    <Link
                      href={catalogueHref({
                        categorySlug: product.categories?.[0]?.slug,
                        category: product.categories?.[0]?.title ?? '',
                      })}
                      className="font-medium text-[#0F4C69] hover:text-[#E36630]"
                    >
                      View all
                    </Link>
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Scroll related products left"
                  onClick={() =>
                    relatedScrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-gray-700 shadow-sm transition-colors hover:border-[#E36630] hover:text-[#E36630]"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Scroll related products right"
                  onClick={() =>
                    relatedScrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-gray-700 shadow-sm transition-colors hover:border-[#E36630] hover:text-[#E36630]"
                >
                  ›
                </button>
              </div>
            </div>
            <div
              ref={relatedScrollRef}
              className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2"
            >
              {relatedProducts.map((r) => {
                const img = r.images?.[0] || PRODUCT_PLACEHOLDER;
                const price = rowDisplayPrice(r);
                return (
                  <Link
                    key={r._id}
                    href={productDetailPath(r._id, primaryCategorySlug(r.categories))}
                    className="w-40 shrink-0 snap-start overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md sm:w-48"
                  >
                    <div className="relative h-40 w-full bg-[#E5E5E5] sm:h-44">
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="bg-[#E5E5E5] object-cover"
                        sizes="(max-width: 640px) 160px, 192px"
                      />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">
                        {r.name}
                      </p>
                      <p className="mt-2 text-base font-bold text-[#E36630]">
                        PKR {price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      <CartPopup
        show={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        product={{
          title: product.name,
          images: galleryImages.length ? galleryImages : [PRODUCT_PLACEHOLDER],
          specifications: product.specifications,
          price: displayPrice,
        }}
        quantity={quantity}
      />
    </div>
  );
};

export default ProductDetailPage;
