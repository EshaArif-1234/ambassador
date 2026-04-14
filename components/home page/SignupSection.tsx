'use client';

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

const benefits = [
  {
    title: 'Exclusive B2B Pricing',
    description: 'Get factory-direct prices not available to the general public.',
  },
  {
    title: 'Bulk Order Management',
    description: 'Place and track large orders for hotels, restaurants & institutions.',
  },
  {
    title: 'Custom Quotes & Consultations',
    description: 'Request tailored quotes for custom kitchen setups and projects.',
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
    <section className="bg-white py-16 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl overflow-hidden shadow-xl flex flex-col lg:flex-row">

          {/* ── Left Panel — White ── */}
          <div className="flex-1 bg-white p-10 lg:p-14">
            <div className="max-w-lg">
              {/* Label */}
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
                <span className="w-6 h-px bg-[#0F4C69]" />
                Member Benefits
              </span>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
                Join Ambassador <br />
                <span className="text-[#E36630]">Kitchen Equipment</span>
              </h2>

              <p className="text-gray-500 text-base mb-8 leading-relaxed">
                Create a free account and unlock exclusive access to B2B pricing, bulk ordering, and a dedicated support team — trusted by 1,000+ commercial kitchens across Pakistan.
              </p>

              {/* Benefits list */}
              <ul className="space-y-5 mb-10">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E36630]/10 flex items-center justify-center mt-0.5">
                      <svg className="w-3.5 h-3.5 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{benefit.title}</p>
                      <p className="text-gray-500 text-sm leading-snug">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Social proof */}
              <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                <div className="flex -space-x-2">
                  {['H', 'R', 'B', 'F'].map((initial, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">1,000+ businesses</span> already using Ambassador
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Panel — Orange ── */}
          <div className="lg:w-[420px] bg-[#E36630] p-10 lg:p-14 flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Get Started Free
            </h3>
            <p className="text-orange-100 text-sm mb-8 leading-relaxed">
              No subscription fees. No hidden charges. Just a better way to equip your commercial kitchen.
            </p>

            {/* Quick perks */}
            <ul className="space-y-3 mb-10">
              {[
                'Free account — always',
                'Instant access to all products',
                'Bulk quote requests in one click',
                'Order history & tracking',
              ].map((perk, i) => (
                <li key={i} className="flex items-center gap-3 text-white text-sm">
                  <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {perk}
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full py-4 bg-white text-[#E36630] font-bold text-center rounded-xl hover:bg-gray-50 transition-colors text-base shadow-md"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="block w-full py-4 bg-transparent border-2 border-white text-white font-semibold text-center rounded-xl hover:bg-white/10 transition-colors text-base"
              >
                Sign In to My Account
              </Link>
            </div>

            <p className="text-orange-200 text-xs text-center mt-5">
              By signing up, you agree to our{' '}
              <Link href="#" className="underline hover:text-white transition-colors">Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="underline hover:text-white transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupSection;
