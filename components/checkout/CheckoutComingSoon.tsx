import Link from 'next/link';
import { PRODUCTS_PATH } from '@/lib/siteRoutes';

const CheckoutComingSoon = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12 sm:min-h-[75vh] sm:py-16">
      <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.08)] sm:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0F4C69]/10 to-[#E36630]/10">
          <svg
            className="h-10 w-10 text-[#E36630]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#E36630]">Coming Soon</p>
        <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">Checkout</h1>
        <p className="mb-8 text-sm leading-relaxed text-gray-600 sm:text-base">
          Online ordering is not available at the moment. Please continue browsing our collection, or
          reach out to our team if you need assistance.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={PRODUCTS_PATH}
            className="rounded-lg bg-[#E36630] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#cc5a2a] sm:text-base"
          >
            Browse Products
          </Link>
          <Link
            href="/contact-us"
            className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-[#0F4C69]/30 hover:text-[#0F4C69] sm:text-base"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutComingSoon;
