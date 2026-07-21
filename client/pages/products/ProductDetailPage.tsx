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
  PRODUCTS_PATH,
  productsHref,
  productsCategoryPath,
  primaryCategorySlug,
  productDetailPath,
  productUrlSegment,
} from '@/lib/siteRoutes';
import { orderedSpecificationEntries } from '@/lib/productSpecifications';
import SparePartsSection from '@/components/products/SparePartsSection';
import type { SparePartSummary } from '@/lib/spareParts.types';

interface CategoryRef {
  title?: string;
  slug?: string;
}

interface ProductDetail {
  _id: string;
  slug?: string;
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
  specificationOrder?: string[];
  categories: CategoryRef[];
  avgRating: number;
  reviewCount: number;
}

interface CatalogProductRow {
  _id: string;
  slug?: string;
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

function ProductBuyRow({
  stock,
  quantity,
  setQuantity,
  onAddToCart,
  onBuyNow,
}: {
  stock: number;
  quantity: number;
  setQuantity: (n: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}) {
  const inStock = stock > 0;
  const maxQty = Math.max(1, stock || 10);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center rounded-lg border border-gray-300">
        <button
          type="button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={!inStock || quantity <= 1}
          className="px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          min={1}
          max={maxQty}
          disabled={!inStock}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="w-16 border-none bg-transparent text-center text-sm font-semibold text-gray-800 focus:outline-none disabled:opacity-50"
          aria-label="Quantity"
        />
        <button
          type="button"
          onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
          disabled={!inStock || quantity >= maxQty}
          className="px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={onAddToCart}
        disabled={!inStock}
        className="min-w-[140px] flex-1 rounded-lg border-2 border-[#0F4C69] px-5 py-3 text-sm font-medium text-[#0F4C69] transition-colors hover:bg-[#0F4C69] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add to Cart
      </button>
      <button
        type="button"
        onClick={onBuyNow}
        disabled={!inStock}
        className="min-w-[140px] flex-1 rounded-lg bg-[#E36630] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#cc5a2a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buy it Now
      </button>
    </div>
  );
}

const ProductDetailPage = ({ productId }: { productId: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<CatalogProductRow[]>([]);
  const [spareParts, setSpareParts] = useState<SparePartSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
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
    setShowAllSpecs(false);
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
      setSpareParts([]);

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
        setSpareParts((json.data.spareParts ?? []) as SparePartSummary[]);
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
    const canonical = productDetailPath(productUrlSegment(product));
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

  const specificationEntries = useMemo(
    () => orderedSpecificationEntries(product?.specifications, product?.specificationOrder),
    [product?.specifications, product?.specificationOrder],
  );

  const SPEC_PREVIEW_COUNT = 5;
  const hasMoreSpecs = specificationEntries.length > SPEC_PREVIEW_COUNT;
  const visibleSpecs = showAllSpecs
    ? specificationEntries
    : specificationEntries.slice(0, SPEC_PREVIEW_COUNT);

  const specColumns = useMemo(() => {
    const mid = Math.ceil(visibleSpecs.length / 2);
    return [visibleSpecs.slice(0, mid), visibleSpecs.slice(mid)];
  }, [visibleSpecs]);

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
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 pt-6">{backButton}</div>
        <PageLoader message="Loading product…" fullScreen={false} className="min-h-[70vh]" />
      </div>
    );
  }

  if (notFound || unavailable || loadError || !product) {
    return (
      <div className="min-h-screen bg-white py-16">
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
              <Link href={PRODUCTS_PATH} className="rounded-lg bg-[#E36630] px-6 py-3 font-medium text-white transition-colors hover:bg-[#cc5a2a]">
                Browse products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="mb-4 flex flex-col gap-3">
          {backButton}
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="transition-colors hover:text-[#E36630]">
              Home
            </Link>
            <span className="text-gray-300">›</span>
            <Link href={PRODUCTS_PATH} className="transition-colors hover:text-[#E36630]">
              Products
            </Link>
            {primaryCat?.slug && primaryCat.title ? (
              <>
                <span className="text-gray-300">›</span>
                <Link
                  href={productsCategoryPath(primaryCat.slug)}
                  className="transition-colors hover:text-[#E36630]"
                >
                  {primaryCat.title}
                </Link>
              </>
            ) : null}
            <span className="text-gray-300">›</span>
            <span className="line-clamp-1 text-gray-700">{product.name}</span>
          </nav>
        </div>

        {/* ── Gallery (left) | info + specs + buy (right) ── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="w-full shrink-0 lg:w-[42%]">
            <ProductDetailGallery
              productName={product.name}
              images={galleryImages}
              videos={galleryVideos}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div
              className={
                spareParts.length > 0
                  ? 'flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6'
                  : ''
              }
            >
              <div className={spareParts.length > 0 ? 'min-w-0 flex-1 lg:flex-[4]' : ''}>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl font-normal leading-snug text-gray-900 sm:text-2xl lg:text-[1.65rem]">
                    {product.name}
                  </h1>
                  <WishlistButton productId={product._id} variant="inline" iconClassName="w-5 h-5" />
                </div>

                {categoryLine ? (
                  <p className="mt-1 text-sm text-[#0F4C69]">{categoryLine}</p>
                ) : null}

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <ProductRatingDropdown
                    productId={product._id}
                    ratingBreakdown={ratingBreakdown}
                    averageRating={product.reviewCount ? product.avgRating : 0}
                    totalReviews={product.reviewCount}
                    productName={product.name}
                  />
                  {brandTags.length > 0 ? (
                    <span className="text-xs font-semibold text-[#E36630]">
                      {formatBrandLabels(brandTags)}
                    </span>
                  ) : null}
                </div>

                <hr className="my-4 border-gray-200" />

                <div className="mb-4 lg:hidden">
                  <p className="text-2xl font-normal text-[#E36630]">
                    PKR {displayPrice.toLocaleString()}
                  </p>
                  {showDiscount && (
                    <p className="mt-1 text-sm text-gray-500">
                      List Price:{' '}
                      <span className="line-through">PKR {product.originalPrice.toLocaleString()}</span>
                    </p>
                  )}
                </div>

                <div className="hidden lg:block mb-4">
                  <p className="text-3xl font-normal text-[#E36630]">
                    PKR {displayPrice.toLocaleString()}
                  </p>
                  {showDiscount && (
                    <p className="mt-1 text-sm text-gray-500">
                      List Price:{' '}
                      <span className="line-through">PKR {product.originalPrice.toLocaleString()}</span>
                    </p>
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold text-gray-900">About this item</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {product.about?.trim() || 'No description yet.'}
                  </p>
                </div>

                {spareParts.length > 0 && (
                  <SparePartsSection
                    spareParts={spareParts}
                    mainProductName={product.name}
                    variant="stacked"
                  />
                )}
              </div>

              {spareParts.length > 0 && (
                <div className="hidden shrink-0 lg:block lg:flex-[3]">
                  <SparePartsSection
                    spareParts={spareParts}
                    mainProductName={product.name}
                    variant="sidebar"
                  />
                </div>
              )}
            </div>

            {specificationEntries.length > 0 && (
              <section className="mt-8">
                <hr className="mb-6 border-gray-200 lg:hidden" />
                <h2 className="text-base font-bold text-gray-900">Product details</h2>
                <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:gap-x-12">
                  {specColumns.map((column, columnIndex) => (
                    <div key={columnIndex} className="min-w-0 flex-1">
                      {column.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex gap-3 border-t border-gray-100 py-2.5 text-sm"
                        >
                          <span className="w-[42%] shrink-0 font-semibold text-gray-900">{key}</span>
                          <span className="text-gray-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {hasMoreSpecs && (
                  <button
                    type="button"
                    onClick={() => setShowAllSpecs((v) => !v)}
                    className="mt-3 text-sm font-medium text-[#0F4C69] hover:text-[#E36630]"
                  >
                    {showAllSpecs
                      ? 'Show less'
                      : `Show more (${specificationEntries.length - SPEC_PREVIEW_COUNT} more)`}
                  </button>
                )}
              </section>
            )}

            <div className="mt-6">
              <ProductBuyRow
                stock={product.stock}
                quantity={quantity}
                setQuantity={setQuantity}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyItNow}
              />
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <>
            <hr className="border-gray-200" />
            <section className="py-8" aria-label="Related products">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Related products</h2>
                  {categoryLine ? (
                    <p className="mt-1 text-sm text-gray-500">
                      Similar items in {categoryLine}
                      {' · '}
                      <Link
                        href={productsHref({
                          categorySlug: product.categories?.[0]?.slug,
                          category: product.categories?.[0]?.title ?? '',
                        })}
                        className="text-[#0F4C69] hover:text-[#E36630]"
                      >
                        View all
                      </Link>
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Scroll left"
                    onClick={() => relatedScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-400"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll right"
                    onClick={() => relatedScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-400"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div
                ref={relatedScrollRef}
                className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-1"
              >
                {relatedProducts.map((r) => {
                  const img = r.images?.[0] || PRODUCT_PLACEHOLDER;
                  const price = rowDisplayPrice(r);
                  return (
                    <Link
                      key={r._id}
                      href={productDetailPath(productUrlSegment(r), primaryCategorySlug(r.categories))}
                      className="w-[160px] shrink-0 snap-start sm:w-[180px]"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <Image src={img} alt="" fill className="object-cover" sizes="180px" />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-snug text-[#0F4C69] hover:text-[#E36630]">
                        {r.name}
                      </p>
                      <p className="mt-1 text-base font-bold text-gray-900">
                        PKR {price.toLocaleString()}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}

        <hr className="border-gray-200" />

        <div id="customer-reviews" className="py-8">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900">Customer reviews</h2>
            {product.reviewCount > 0 && (
              <span className="text-sm text-gray-600">
                {product.avgRating.toFixed(1)} out of 5 · {product.reviewCount} ratings
              </span>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">
              No customer reviews yet. Be the first to review this product after purchase.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <div key={review._id} className="py-5 first:pt-0">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">
                      {review.name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(review.rating) ? 'text-[#E36630]' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
