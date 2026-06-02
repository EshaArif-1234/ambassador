'use client';

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import AccountLayout from '@/components/account/AccountLayout';
import AccountPageLoader from '@/components/account/AccountPageLoader';

export default function WishlistPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <AccountPageLoader />;
  }

  if (!user) return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Please log in to view your wishlist.</p>
        <Link href="/login" className="px-6 py-2 bg-[#E36630] text-white rounded-lg hover:bg-[#cc5a2a]">Login</Link>
      </div>
    </div>
  );

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">My Wishlist & Followed Stores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Save products you love and follow your favourite stores</p>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E36630]/10">
            <svg className="w-8 h-8 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
            Browse our products and save the ones you love. They will appear here for easy access.
          </p>
          <Link href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E36630] text-white text-sm font-medium rounded-xl hover:bg-[#cc5a2a] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Browse Products
          </Link>
        </div>
      </div>
    </AccountLayout>
  );
}
