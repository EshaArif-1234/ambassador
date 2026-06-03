'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import AccountLayout from '@/components/account/AccountLayout';
import AccountPageLoader from '@/components/account/AccountPageLoader';
import ProductRatingDropdown from '@/components/products/ProductRatingDropdown';

interface WishlistProduct {
  _id: string;
  name: string;
  about: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  image: string;
  specifications: Record<string, string>;
  avgRating: number;
  reviewCount: number;
}

export default function WishlistPage() {
  const { user, isLoading: authLoading } = useUser();
  const { remove, refresh } = useWishlist();
  const { addToCart } = useCart();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setItems(json.data?.items ?? []);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    load();
  }, [user, authLoading, load]);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    const ok = await remove(productId);
    if (ok) {
      setItems((prev) => prev.filter((p) => p._id !== productId));
    }
    setRemovingId(null);
  };

  const handleAddToCart = (product: WishlistProduct) => {
    const code =
      product.specifications['Product Code'] ||
      product.specifications['product code'] ||
      product._id;
    addToCart({
      id: product._id,
      title: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || '/Images/home/stainless-steal.webp',
      productCode: String(code),
    });
  };

  if (authLoading) {
    return <AccountPageLoader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your wishlist.</p>
          <Link href="/login" className="px-6 py-2 bg-[#E36630] text-white rounded-lg hover:bg-[#cc5a2a]">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? 'Loading…' : `${items.length} saved product${items.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              refresh();
              load();
            }}
            className="text-sm font-medium text-[#0F4C69] hover:text-[#E36630]"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E36630]/10">
              <svg className="w-8 h-8 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
              Tap the heart on any product to save it here for later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E36630] text-white text-sm font-medium rounded-xl hover:bg-[#cc5a2a] transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((product) => {
              const showStrike = product.originalPrice > product.price && product.price > 0;
              const img = product.image || '/Images/home/stainless-steal.webp';
              return (
                <article
                  key={product._id}
                  className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row"
                >
                  <div className="relative h-48 sm:h-auto sm:w-56 shrink-0 bg-[#EEF5F9]">
                    <Link href={`/products/${product._id}`} className="block relative h-full min-h-[12rem]">
                      <Image src={img} alt={product.name} fill className="object-cover" sizes="224px" />
                    </Link>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5 min-w-0 gap-4">
                    <div>
                      <Link href={`/products/${product._id}`}>
                        <h2 className="text-base font-bold text-gray-900 hover:text-[#E36630] line-clamp-2">
                          {product.name}
                        </h2>
                      </Link>
                      {product.category && (
                        <p className="text-xs text-[#0F4C69] font-medium mt-1">{product.category}</p>
                      )}
                      <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                        {product.about?.trim() || 'No description.'}
                      </p>
                      <div className="mt-3">
                        <ProductRatingDropdown
                          productId={product._id}
                          averageRating={product.reviewCount ? product.avgRating : 0}
                          totalReviews={product.reviewCount}
                          productName={product.name}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-[#E36630]">
                          PKR {product.price.toLocaleString()}
                        </span>
                        {showStrike && (
                          <span className="text-xs text-gray-400 line-through">
                            PKR {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemove(product._id)}
                          disabled={removingId === product._id}
                          className="px-3 py-2 text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                        >
                          {removingId === product._id ? 'Removing…' : 'Remove'}
                        </button>
                        <Link
                          href={`/products/${product._id}`}
                          className="px-3 py-2 text-xs font-semibold text-[#0F4C69] border border-[#0F4C69] rounded-lg hover:bg-[#0F4C69] hover:text-white transition-colors"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                          className="px-4 py-2 text-xs font-bold text-white bg-[#E36630] rounded-lg hover:bg-[#cc5a2a] disabled:opacity-40"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
