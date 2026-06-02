'use client';

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import AccountLayout from '@/components/account/AccountLayout';
import AccountPageLoader from '@/components/account/AccountPageLoader';

export default function ReturnsPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <AccountPageLoader />;
  }

  if (!user) return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Please log in to view your returns.</p>
        <Link href="/login" className="px-6 py-2 bg-[#E36630] text-white rounded-lg hover:bg-[#cc5a2a]">Login</Link>
      </div>
    </div>
  );

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">My Returns & Cancellations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage return requests and cancelled orders</p>
        </div>

        {/* Policy info */}
        <div className="rounded-2xl bg-[#0F4C69]/5 border border-[#0F4C69]/15 px-6 py-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-[#0F4C69] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-[#0F4C69] mb-0.5">Return Policy</p>
              <p className="text-xs text-[#0F4C69]/80 leading-relaxed">
                Returns are accepted within 7 days of delivery for defective or incorrect items.
                To initiate a return, please contact our support team at{' '}
                <a href="mailto:support@ambassador.pk" className="underline font-medium">support@ambassador.pk</a> or
                call us at <a href="tel:+923001234567" className="underline font-medium">+92 300 123 4567</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Empty state */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E36630]/10">
            <svg className="w-8 h-8 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No returns or cancellations</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
            You have no active return or cancellation requests at this time.
          </p>
          <Link href="/orders"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E36630] text-white text-sm font-medium rounded-xl hover:bg-[#cc5a2a] transition-colors">
            View My Orders
          </Link>
        </div>
      </div>
    </AccountLayout>
  );
}
