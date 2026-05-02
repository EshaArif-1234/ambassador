'use client';

import { useState, useEffect, useMemo } from 'react';
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
  specifications: Record<string, string>;
  categories: CategoryRef[];
  avgRating: number;
  reviewCount: number;
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

const ProductDetailPage = ({ productId }: { productId: string }) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const { addToCart } = useCart();

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
          <Link href="/products" className="text-orange-600 hover:text-orange-700 font-medium">
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
            <Link href="/" className="hover:text-orange-500 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-orange-500 transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-800 line-clamp-2">{product.name}</span>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="relative h-96 mb-4 rounded-lg overflow-hidden bg-gray-100">
                {currentMedia?.kind === 'image' ? (
                  <Image
                    src={currentMedia.src}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : currentMedia?.kind === 'video' ? (
                  <video
                    src={currentMedia.src}
                    controls
                    className="w-full h-full object-contain bg-black"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {imageThumbs.map((item, index) => {
                  const globalIdx = mediaItems.indexOf(item);
                  return (
                    <button
                      key={`img-${item.src}-${index}`}
                      type="button"
                      onClick={() => setMediaIndex(globalIdx)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        mediaIndex === globalIdx ? 'border-orange-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={item.src}
                        alt=""
                        fill
                        className="object-cover hover:scale-105 transition-transform"
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
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        mediaIndex === globalIdx ? 'border-orange-500' : 'border-gray-200'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
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
                <p className="text-sm text-gray-600 mb-4">{categoryLine}</p>
              ) : null}

              <div className="mb-4">
                <ProductRatingDropdown
                  productId={product._id}
                  ratingBreakdown={ratingBreakdown}
                  averageRating={product.reviewCount ? product.avgRating : 0}
                  totalReviews={product.reviewCount}
                  productName={product.name}
                />
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-orange-500">
                    ₹{displayPrice.toLocaleString()}
                  </span>
                  {showDiscount && (
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {showDiscount && (
                  <p className="text-green-600 text-sm mt-1">
                    Save ₹{(product.originalPrice - (product.price ?? 0)).toLocaleString()}
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
                  className="flex-1 min-w-[200px] bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
                                  ? 'text-orange-500 fill-current'
                                  : 'text-gray-300 fill-current'
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
