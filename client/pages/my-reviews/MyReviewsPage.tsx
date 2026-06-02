'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import AccountLayout from '@/components/account/AccountLayout';
import AccountPageLoader from '@/components/account/AccountPageLoader';

interface Review {
  _id: string;
  productId: string;
  orderId?: string;
  orderNumber?: string;
  productName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const STARS = [1, 2, 3, 4, 5];

export default function MyReviewsPage() {
  const { user, isLoading: authLoading } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    setLoading(true);
    fetch('/api/reviews/my', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setReviews(d.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading) {
    return <AccountPageLoader />;
  }

  if (!user) return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Please log in to view your reviews.</p>
        <Link href="/login" className="px-6 py-2 bg-[#E36630] text-white rounded-lg hover:bg-[#cc5a2a]">Login</Link>
      </div>
    </div>
  );

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">Reviews you have written for products</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-28 rounded-2xl bg-white animate-pulse" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E36630]/10">
              <svg className="w-8 h-8 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No reviews yet</h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
              After purchasing a product, share your experience to help other customers.
            </p>
            <Link href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E36630] text-white text-sm font-medium rounded-xl hover:bg-[#cc5a2a] transition-colors">
              Shop & Review
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.productName ?? 'Product'}</p>
                    {review.orderNumber && (
                      <p className="text-xs text-gray-500 mt-0.5">Order {review.orderNumber}</p>
                    )}
                    <div className="flex items-center gap-0.5 mt-1">
                      {STARS.map(s => (
                        <svg key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      review.status === 'approved' ? 'bg-green-100 text-green-700' :
                      review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{review.status}</span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString('en-PK', { year:'numeric', month:'short', day:'numeric' })}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
