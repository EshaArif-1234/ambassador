'use client';

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

const benefits = [
  {
    title: 'Exclusive B2B Pricing',
    description:
      'Get factory-direct commercial kitchen equipment prices not available to the general public.',
  },
  {
    title: 'Bulk Order Management',
    description:
      'Place and track large commercial kitchen equipment orders for hotels, restaurants & institutions.',
  },
  {
    title: 'Custom Quotes & Consultations',
    description: 'Request tailored quotes for custom commercial kitchen setups and projects.',
  },
  {
    title: 'Priority After-Sales Support',
    description: 'Dedicated support team for maintenance, repairs & spare parts.',
  },
];

const SignupSection = () => {
  const { user } = useUser();

  if (user) return null;

  return (
    <section className="border-t border-gray-100 bg-[#FAFAFA] py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col overflow-hidden rounded-2xl shadow-[0_-4px_24px_0_rgba(0,0,0,0.08),0_8px_24px_0_rgba(0,0,0,0.10)] lg:flex-row">
          {/* ── Left Panel — White ── */}
          <div className="flex-1 bg-white p-6 sm:p-10 lg:p-14">
            <div className="max-w-lg">
              <span className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#0F4C69]">
                <span className="h-px w-6 bg-[#0F4C69]" />
                Member Benefits
              </span>

              <h2 className="mb-3 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                Join Ambassador{' '}
                <span className="text-[#E36630]">Kitchen Equipment</span>
              </h2>

              <p className="mb-8 text-base leading-relaxed text-gray-500">
                Create a free account and unlock exclusive access to B2B pricing, bulk ordering, and a dedicated
                support team for commercial kitchen equipment — trusted by 1,000+ commercial kitchens across
                Pakistan.
              </p>

              <ul className="mb-10 space-y-5">
                {benefits.map((benefit) => (
                  <li key={benefit.title} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#E36630]/10">
                      <svg className="h-3.5 w-3.5 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{benefit.title}</h3>
                      <p className="text-sm leading-snug text-gray-500">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
                <div className="flex -space-x-2">
                  {['H', 'R', 'B', 'F'].map((initial) => (
                    <div
                      key={initial}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-bold text-gray-600"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">1,000+ businesses</span> already using Ambassador
                  for their commercial kitchen needs.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Panel — Orange ── */}
          <div className="flex flex-col justify-center bg-[#E36630] p-6 sm:p-10 lg:w-[420px] lg:p-14">
            <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">Get Started Free</h3>
            <p className="mb-8 text-sm leading-relaxed text-white/80">
              No subscription fees. No hidden charges. Just a better way to equip your commercial kitchen.
            </p>

            <ul className="mb-10 space-y-3">
              {[
                'Free account — always',
                'Instant access to all products',
                'Bulk quote requests in one click',
                'Order history & tracking',
              ].map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-white">
                  <svg className="h-4 w-4 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {perk}
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full rounded-xl bg-white py-4 text-center text-base font-bold text-[#E36630] shadow-md transition-colors hover:bg-gray-50"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="block w-full rounded-xl border-2 border-white bg-transparent py-4 text-center text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sign In to My Account
              </Link>
            </div>

            <p className="mt-5 text-center text-xs text-white/60">
              By signing up, you agree to our{' '}
              <Link href="/terms-of-service" className="underline transition-colors hover:text-white">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="underline transition-colors hover:text-white">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupSection;
