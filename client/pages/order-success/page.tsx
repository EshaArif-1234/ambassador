'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderData {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  products: any[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  deliveryNotes?: string;
}

const OrderSuccessPage = () => {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    // Get order data from localStorage
    const savedOrder = localStorage.getItem('lastOrder');
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        setOrderData(order);
      } catch (error) {
        console.error('Error parsing order data:', error);
        // Redirect to home if no order data
        router.push('/');
      }
    } else {
      // Redirect to home if no order data
      router.push('/');
    }
  }, [router]);

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        :root {
          --color-gray-dark: #565D63;
          --color-orange: #E36630;
          --color-blue: #0F4C69;
          --color-gray-medium: #4B4B4B;
          --color-black: #000000;
          --color-white: #FFFFFF;
        }
      `}</style>
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-800">
            </Link>
            <Link href="/products" className="text-orange-500 hover:text-orange-600 flex items-center">
              Continue Shopping
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2">
              {/* Success Message */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  Order Placed Successfully!
                </h1>
                
                <p className="text-xl text-gray-600 mb-2">
                  Thank you for your order, {orderData.name}!
                </p>
                
                <p className="text-gray-600">
                  We've received your order and will begin processing it right away.
                </p>
              </div>

              {/* Order Information */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Order Number:</span>
                    <p className="font-medium text-gray-800">{orderData.orderId}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 text-sm">Order Date:</span>
                    <p className="font-medium text-gray-800">
                      {new Date(orderData.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 text-sm">Payment Method:</span>
                    <p className="font-medium text-gray-800">
                      {orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 text-sm">Payment Status:</span>
                    <p className="font-medium text-green-600">
                      {orderData.paymentStatus === 'paid' ? 'Paid (Products Only)' : 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Payment Note:</strong> You have successfully paid for the products. Our team will contact you within 24 hours to discuss delivery charges and installation requirements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 text-sm">Name:</span>
                    <p className="font-medium text-gray-800">{orderData.name}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 text-sm">Email:</span>
                    <p className="font-medium text-gray-800">{orderData.email}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 text-sm">Phone:</span>
                    <p className="font-medium text-gray-800">{orderData.phone}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 text-sm">Delivery Address:</span>
                    <p className="font-medium text-gray-800">{orderData.address}</p>
                  </div>
                  
                  {orderData.deliveryNotes && (
                    <div>
                      <span className="text-gray-600 text-sm">Delivery Notes:</span>
                      <p className="font-medium text-gray-800">{orderData.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product Subtotal</span>
                    <span className="text-gray-800">
                      ₹{orderData.products ? orderData.products.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString() : '0'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="text-orange-600">To be calculated</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-800">Total Paid</span>
                      <span className="text-lg font-bold text-orange-500">
                        ₹{orderData.products ? orderData.products.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Next Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-900">Our team will call you within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-900">Delivery charges will be calculated</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-900">Installation scheduled after your approval</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">+92 300 1234567</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">info@ambassador.com.pk</span>
                  </div>
                </div>
              </div>

              {/* Account Section */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">Track Your Orders</h3>
                <p className="text-orange-800 mb-4">
                  Create an account or login to track your order status, save your information for future purchases, and enjoy a faster checkout experience.
                </p>
                
                <div className="space-y-3">
                  <Link
                    href="/signup"
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors text-center block font-medium"
                  >
                    Create New Account
                  </Link>
                  
                  <div className="text-center">
                    <span className="text-orange-700 text-sm">Already have an account?</span>
                    <Link
                      href="/login"
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm ml-1 underline"
                    >
                      Login Here
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderSuccessPage;
