'use client';

import React from 'react';
import Image from 'next/image';

export default function LoginMarketingSection() {
  return (
    <div className="lg:w-1/2 bg-orange-500 p-6 lg:p-8 flex flex-col justify-center items-center text-white">
      <div className="text-center">
        <div className="mb-6">
          <Image
            src="/Images/home/logo.webp"
            alt="Ambassadors Logo"
            width={120}
            height={40}
            className="h-10 w-auto mx-auto filter brightness-0 invert"
          />
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
        <p className="text-orange-100 mb-6">
          Sign in to access your account and continue your journey with premium kitchen equipment.
        </p>

        <div className="space-y-4 text-left max-w-sm mx-auto">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Access Your Orders</h3>
              <p className="text-orange-200 text-sm">Track and manage your purchases</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Exclusive Deals</h3>
              <p className="text-orange-200 text-sm">Member-only discounts and offers</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Quick Checkout</h3>
              <p className="text-orange-200 text-sm">Save your information for faster purchases</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">24/7 Support</h3>
              <p className="text-orange-200 text-sm">Get help whenever you need it</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-orange-400">
          <p className="text-orange-200 text-sm">
            Secure login protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
}
