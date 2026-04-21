'use client';

import React from 'react';

const SignUpMarketingSection: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 items-center justify-center p-8">
      <div className="max-w-md text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Join Ambassadors Kitchen Equipment</h2>
        <p className="text-orange-100 mb-6">
          Create an account to access premium kitchen equipment and exclusive deals. Join thousands of satisfied customers worldwide.
        </p>

        <div className="space-y-4 text-left max-w-sm mx-auto">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Exclusive Products</h3>
              <p className="text-orange-200 text-sm">Access to premium kitchen equipment</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Fast Delivery</h3>
              <p className="text-orange-200 text-sm">Quick shipping to your location</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Best Prices</h3>
              <p className="text-orange-200 text-sm">Competitive pricing guaranteed</p>
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
              <p className="text-orange-200 text-sm">Expert assistance anytime</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-orange-400">
          <p className="text-orange-200 text-sm">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpMarketingSection;
