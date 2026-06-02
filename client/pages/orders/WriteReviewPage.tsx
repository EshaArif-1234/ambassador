'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import AccountLayout from '@/components/account/AccountLayout';
import AccountPageLoader from '@/components/account/AccountPageLoader';

const STARS = [1, 2, 3, 4, 5] as const;

interface OrderLine {
  productId?: string;
  productName: string;
  productImage?: string;
}

interface OrderSnapshot {
  _id: string;
  orderNumber: string;
  status: string;
  items: OrderLine[];
}

export default function WriteReviewPage() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const orderId = String(params?.id ?? '');
  const productId = String(params?.productId ?? '');

  const [order, setOrder] = useState<OrderSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const lineItem = order?.items.find((it) => it.productId === productId);

  const checkExisting = useCallback(async () => {
    const res = await fetch(`/api/orders/${orderId}/review-status`, { credentials: 'include' });
    const json = await res.json();
    if (json.success && json.data?.items?.[productId]?.hasReview) {
      router.replace('/my-reviews');
    }
  }, [orderId, productId, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/orders/${orderId}`, { credentials: 'include' });
        const json = await res.json();
        if (cancelled) return;

        if (!json.success || !json.data) {
          setError(json.message || 'Order not found.');
          return;
        }

        const data = json.data as OrderSnapshot;
        if (data.status !== 'delivered') {
          setError('Reviews are available only after your order has been delivered.');
          return;
        }

        const inOrder = data.items.some((it) => String(it.productId) === productId);
        if (!inOrder) {
          setError('This product is not part of this order.');
          return;
        }

        setOrder(data);
        await checkExisting();
      } catch {
        if (!cancelled) setError('Failed to load order.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, orderId, productId, checkExisting]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      const json = await res.json();

      if (res.status === 409) {
        router.replace('/my-reviews');
        return;
      }
      if (!json.success) {
        setError(json.message || 'Failed to submit review.');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/my-reviews'), 1800);
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <AccountPageLoader />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to write a review.</p>
          <Link href="/login" className="px-6 py-2 bg-[#E36630] text-white rounded-lg hover:bg-[#cc5a2a]">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Write a review</h1>
          <Link
            href={`/orders/${orderId}`}
            className="text-sm text-[#0F4C69] hover:text-[#E36630] font-medium"
          >
            ← Back to order
          </Link>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl bg-white animate-pulse" />
        ) : success ? (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Thank you!</h2>
            <p className="text-sm text-gray-500 mt-2">
              Your review was submitted and will appear after a quick check.
            </p>
            <p className="text-xs text-gray-400 mt-4">Redirecting to My Reviews…</p>
          </div>
        ) : error && !order ? (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-12 text-center">
            <p className="text-gray-600">{error}</p>
            <Link
              href={`/orders/${orderId}`}
              className="mt-4 inline-block px-6 py-2 bg-[#E36630] text-white text-sm rounded-xl hover:bg-[#cc5a2a]"
            >
              Back to order
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {lineItem?.productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lineItem.productImage}
                    alt={lineItem.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{lineItem?.productName}</p>
                {order && (
                  <p className="text-xs text-gray-500 mt-0.5">Order {order.orderNumber}</p>
                )}
              </div>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-800 mb-2">Your rating</p>
                <div className="flex gap-1">
                  {STARS.map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#0F4C69]/30"
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >
                      <svg
                        className={`w-9 h-9 transition-colors ${
                          star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-200'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-comment" className="text-sm font-medium text-gray-800 block mb-2">
                  Your review
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  placeholder="Share your experience with this product…"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C69]/20 focus:border-[#0F4C69]"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/1000</p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting || !rating}
                className="w-full py-3 rounded-xl bg-[#0F4C69] text-white text-sm font-semibold hover:bg-[#0c3d54] disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AccountLayout>
  );
}
