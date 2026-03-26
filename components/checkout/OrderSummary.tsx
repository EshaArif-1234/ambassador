'use client';

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';

const OrderSummary = () => {
  const { cartItems } = useCart();

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryCharges = subtotal > 0 ? 200 : 0; // Fixed delivery charge
  const total = subtotal + deliveryCharges;

  return (
    <div className="bg-white rounded-lg border p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      {/* Products */}
      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {cartItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                {item.title}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Product Code: {item.productCode}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">
                  Qty: {item.quantity}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  ₹{item.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {cartItems.length === 0 && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-sm">Your cart is empty</p>
          </div>
        )}
      </div>
      
      {/* Price Breakdown */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Charges</span>
          <span className="text-gray-900">
            {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges.toLocaleString()}`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">₹0</span>
        </div>
        
        <div className="pt-3 border-t">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-orange-500">
              ₹{total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Delivery Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3">
            <p className="text-sm text-blue-800 font-medium">Delivery Information</p>
            <p className="text-xs text-blue-700 mt-1">
              Estimated delivery: 3-5 business days
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Available in major cities only
            </p>
          </div>
        </div>
      </div>
      
      {/* Security Info */}
      <div className="mt-4 flex items-center justify-center">
        <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-xs text-gray-600">Secure Checkout</span>
      </div>
    </div>
  );
};

export default OrderSummary;
