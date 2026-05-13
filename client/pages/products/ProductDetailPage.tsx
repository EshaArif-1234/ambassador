'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductRatingDropdown, {
  type RatingBreakdown,
} from '@/components/products/ProductRatingDropdown';
import CartPopup from '@/components/products/CartPopup';
import { useCart } from '@/contexts/CartContext';

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
  videos: string[];
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
  categories?: { title?: string }[];
}

interface ReviewRow {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

type MediaItem = { kind: 'image' | 'video'; src: string };

const PLACEHOLDER = '/Images/home/stainless-steal.webp';

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
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<CatalogProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const relatedScrollRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState({ x: 0, y: 0, show: false });
  const { addToCart } = useCart();

  const LENS = 140;   // lens diameter px
  const ZOOM = 2.8;   // zoom multiplier

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imgContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setZoom({ x, y, show: true });
  };

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
    setMediaIndex(0);
    setQuantity(1);
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/products/${productId}`, { cache: 'no-store' });
        const json = await res.json();
        if (res.status === 404 || !json?.success) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (cancelled) return;
        const p = json.data.product as ProductDetail;
        const rev = (json.data.reviews ?? []) as ReviewRow[];
        setProduct(p);
        setReviews(rev);
      } catch {
        if (!cancelled) setNotFound(true);
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
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        const json = await res.json();
        if (!json?.success || !Array.isArray(json.data) || cancelled) return;
        const titles = new Set(
          (product.categories ?? []).map((c) => c.title).filter(Boolean) as string[]
        );
        if (titles.size === 0) {
          if (!cancelled) setRelatedProducts([]);
          return;
        }
        const rows = json.data as CatalogProductRow[];
        const related = rows
          .filter(
            (r) =>
              String(r._id) !== String(product._id) &&
              (r.categories ?? []).some((c) => c.title && titles.has(c.title))
          )
          .slice(0, 16);
        if (!cancelled) setRelatedProducts(related);
      } catch {
        if (!cancelled) setRelatedProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product]);

  const mediaItems = useMemo<MediaItem[]>(() => {
    if (!product) return [];
    const imgs =
      product.images?.filter((u) => typeof u === 'string' && u.length > 0).length > 0
        ? product.images.filter((u) => typeof u === 'string' && u.length > 0)
        : [PLACEHOLDER];
    const vids = (product.videos ?? []).filter((u) => typeof u === 'string' && u.length > 0);
    return [
      ...imgs.map((src) => ({ kind: 'image' as const, src })),
      ...vids.map((src) => ({ kind: 'video' as const, src })),
    ];
  }, [product]);

  useEffect(() => {
    if (mediaIndex >= mediaItems.length) setMediaIndex(0);
  }, [mediaItems.length, mediaIndex]);

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
  const brandTags = product ? normalizeBrandTags(product.brands) : [];

  const handleAddToCart = () => {
    if (!product || !mediaItems.length) return;
    const firstImage =
      mediaItems.find((m) => m.kind === 'image')?.src ?? mediaItems[0].src;
    const code =
      product.specifications['Product Code'] ||
      product.specifications['product code'] ||
      product._id;
    addToCart({
      id: product._id,
      title: product.name,
      price: displayPrice,
      quantity,
      image: firstImage,
      productCode: String(code),
    });
    setShowCartPopup(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="h-96 max-w-4xl animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h1>
          <Link href="/products" className="font-medium text-[#E36630] hover:text-[#cc5a2a]">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const currentMedia = mediaItems[mediaIndex] ?? mediaItems[0];
  const imageThumbs = mediaItems.filter((m) => m.kind === 'image');
  const videoThumbs = mediaItems.filter((m) => m.kind === 'video');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="transition-colors hover:text-[#E36630]">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="transition-colors hover:text-[#E36630]">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-800 line-clamp-2">{product.name}</span>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {/* ── Main image with magnifier ── */}
              <div className="relative mb-4 group">
                <div
                  ref={imgContainerRef}
                  className={`relative h-[500px] overflow-hidden rounded-lg bg-[#EEF5F9] border-2 border-[#E36630]/40 ${
                    currentMedia?.kind === 'image' ? 'cursor-crosshair' : ''
                  }`}
                  onMouseMove={currentMedia?.kind === 'image' ? handleImageMouseMove : undefined}
                  onMouseLeave={() => setZoom(z => ({ ...z, show: false }))}
                  onMouseEnter={() => currentMedia?.kind === 'image' && setZoom(z => ({ ...z, show: true }))}
                >
                  {currentMedia?.kind === 'image' ? (
                    <>
                      <Image
                        src={currentMedia.src}
                        alt={product.name}
                        fill
                        className="bg-[#E5E5E5] object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                      />

                      {/* Lens overlay */}
                      {zoom.show && imgContainerRef.current && (() => {
                        const cw = imgContainerRef.current.offsetWidth;
                        const ch = imgContainerRef.current.offsetHeight;
                        const lx = Math.max(0, Math.min(zoom.x - LENS / 2, cw - LENS));
                        const ly = Math.max(0, Math.min(zoom.y - LENS / 2, ch - LENS));
                        const imgW = cw * ZOOM;
                        const imgH = ch * ZOOM;
                        const imgLeft = -(zoom.x * ZOOM - LENS / 2);
                        const imgTop  = -(zoom.y * ZOOM - LENS / 2);
                        return (
                          <div
                            className="absolute rounded-full overflow-hidden pointer-events-none z-20 shadow-2xl"
                            style={{
                              width: LENS,
                              height: LENS,
                              left: lx,
                              top: ly,
                              border: '2px solid #E36630',
                              boxShadow: '0 0 0 1px rgba(227,102,48,0.3), 0 8px 32px rgba(0,0,0,0.35)',
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentMedia.src}
                              alt=""
                              style={{
                                position: 'absolute',
                                width: imgW,
                                height: imgH,
                                left: imgLeft,
                                top: imgTop,
                                maxWidth: 'none',
                                pointerEvents: 'none',
                              }}
                            />
                          </div>
                        );
                      })()}

                      {/* Zoom hint badge */}
                      {!zoom.show && (
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          Hover to zoom
                        </div>
                      )}
                    </>
                  ) : currentMedia?.kind === 'video' ? (
                    <video
                      src={currentMedia.src}
                      controls
                      className="h-full w-full bg-[#E5E5E5] object-contain"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : null}
                </div>

                {/* ── Floating zoom panel (desktop only) ── */}
                {zoom.show && currentMedia?.kind === 'image' && imgContainerRef.current && (() => {
                  const cw = imgContainerRef.current.offsetWidth;
                  const ch = imgContainerRef.current.offsetHeight;
                  // Panel is the same size as the image container
                  const panelW = cw;
                  const panelH = ch;
                  const imgW = cw * ZOOM;
                  const imgH = ch * ZOOM;
                  const bgX = -((zoom.x / cw) * imgW - panelW / 2);
                  const bgY = -((zoom.y / ch) * imgH - panelH / 2);
                  return (
                    <div
                      className="absolute top-0 pointer-events-none rounded-xl overflow-hidden shadow-2xl border border-[#E36630]/30 z-30 hidden lg:block"
                      style={{
                        left: cw + 12,
                        width: panelW,
                        height: panelH,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentMedia.src}
                        alt=""
                        style={{
                          position: 'absolute',
                          width: imgW,
                          height: imgH,
                          left: bgX,
                          top: bgY,
                          maxWidth: 'none',
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-[#E36630] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {ZOOM}× Zoom
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {imageThumbs.map((item, index) => {
                  const globalIdx = mediaItems.indexOf(item);
                  return (
                    <button
                      key={`img-${item.src}-${index}`}
                      type="button"
                      onClick={() => setMediaIndex(globalIdx)}
                      className={`relative w-full aspect-square overflow-hidden rounded-lg border-2 bg-[#E5E5E5] transition-all ${
                        mediaIndex === globalIdx ? 'border-[#E36630]' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={item.src}
                        alt=""
                        fill
                        className="bg-[#E5E5E5] object-cover transition-transform hover:scale-105"
                        sizes="80px"
                      />
                    </button>
                  );
                })}
                {videoThumbs.map((item, index) => {
                  const globalIdx = mediaItems.indexOf(item);
                  return (
                    <button
                      key={`vid-${item.src}-${index}`}
                      type="button"
                      onClick={() => setMediaIndex(globalIdx)}
                      className={`relative w-full aspect-square overflow-hidden rounded-lg border-2 bg-[#E5E5E5] transition-all ${
                        mediaIndex === globalIdx ? 'border-[#E36630]' : 'border-gray-200'
                      }`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-[#E5E5E5]">
                        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        Video
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
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
                <p className="shrink-0 text-sm">
                  <span className="text-gray-500">Stock: </span>
                  {product.stock > 0 ? (
                    <span className="font-semibold text-green-700">{product.stock} available</span>
                  ) : (
                    <span className="font-semibold text-red-600">Out of stock</span>
                  )}
                </p>
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
                  className="min-w-[200px] flex-1 rounded-lg bg-[#E36630] px-6 py-3 font-medium text-white transition-colors hover:bg-[#cc5a2a]"
                >
                  Add to Cart
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h3>
                {Object.keys(product.specifications ?? {}).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100 gap-2">
                        <span className="text-sm text-gray-600 shrink-0">{key}:</span>
                        <span className="text-sm text-gray-800 font-medium text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No specifications listed.</p>
                )}
              </div>

              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Delivery Notice</h4>
                      <p className="text-sm text-blue-800">
                        Online delivery is currently available only within Lahore.
                      </p>
                    </div>
                  </div>
                </div>
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
              <h2 className="text-2xl font-bold text-gray-800">Related products</h2>
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
                const img = r.images?.[0] || PLACEHOLDER;
                const price = rowDisplayPrice(r);
                return (
                  <Link
                    key={r._id}
                    href={`/products/${r._id}`}
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
          images: product.images?.length ? product.images : [PLACEHOLDER],
          specifications: product.specifications,
          price: displayPrice,
        }}
        quantity={quantity}
      />
    </div>
  );
};

export default ProductDetailPage;
