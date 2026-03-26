'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const OrderSuccessPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if accessed directly without checkout
    const timer = setTimeout(() => {
      // In a real app, you'd check if there's an order ID in the URL or state
      // For now, we'll just allow the page to stay
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Order Placed Successfully!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your order. We've received your order and will begin processing it right away.
        </p>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium text-gray-900">#ORD-{Date.now()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium text-gray-900">Cash on Delivery</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-medium text-gray-900">3-5 Business Days</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
          
          <div className="space-y-2 text-left">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                1
              </div>
              <p className="text-blue-800">You'll receive an order confirmation email shortly</p>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                2
              </div>
              <p className="text-blue-800">Our team will process your order within 24 hours</p>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                3
              </div>
              <p className="text-blue-800">You'll receive shipping updates via email and SMS</p>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                4
              </div>
              <p className="text-blue-800">Your order will be delivered to your address</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/contact-us"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Contact Support
          </Link>
        </div>

        {/* Customer Support Info */}
        <div className="mt-12 p-6 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            Our customer support team is here to help you with any questions about your order.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-gray-700">+92 300 1234567</span>
            </div>
            
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700">info@ambassador.com.pk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
