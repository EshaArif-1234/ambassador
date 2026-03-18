'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  productCode: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const OrdersPage = () => {
  const { user } = useUser();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Sample orders data - in real app, this would come from an API
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      date: '2024-03-15',
      status: 'delivered',
      items: [
        {
          id: '1',
          name: 'Commercial Gas Range',
          image: '/Images/products/gas-range.jpg',
          quantity: 1,
          price: 45000,
          productCode: 'CGR-001'
        },
        {
          id: '2',
          name: 'Professional Oven',
          image: '/Images/products/professional-oven.jpg',
          quantity: 2,
          price: 78000,
          productCode: 'PO-002'
        }
      ],
      totalAmount: 201000,
      shippingAddress: '123, Industrial Area, Phase 2, Mumbai, Maharashtra 400001',
      paymentMethod: 'Credit Card',
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2024-03-20'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      date: '2024-03-18',
      status: 'shipped',
      items: [
        {
          id: '3',
          name: 'Industrial Mixer',
          image: '/Images/products/industrial-mixer.jpg',
          quantity: 1,
          price: 65000,
          productCode: 'IM-003'
        }
      ],
      totalAmount: 65000,
      shippingAddress: '456, Business Park, Delhi, 110001',
      paymentMethod: 'Net Banking',
      trackingNumber: 'TRK987654321',
      estimatedDelivery: '2024-03-22'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      date: '2024-03-20',
      status: 'processing',
      items: [
        {
          id: '4',
          name: 'Premium Refrigeration Unit',
          image: '/Images/products/refrigeration-unit.jpg',
          quantity: 1,
          price: 120000,
          productCode: 'PRU-004'
        },
        {
          id: '5',
          name: 'Multi-Cooker',
          image: '/Images/products/multi-cooker.jpg',
          quantity: 3,
          price: 35000,
          productCode: 'MC-005'
        }
      ],
      totalAmount: 225000,
      shippingAddress: '789, Commercial Complex, Bangalore, 560001',
      paymentMethod: 'UPI'
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      date: '2024-03-21',
      status: 'pending',
      items: [
        {
          id: '6',
          name: 'Food Processor',
          image: '/Images/products/food-processor.jpg',
          quantity: 2,
          price: 28000,
          productCode: 'FP-006'
        }
      ],
      totalAmount: 56000,
      shippingAddress: '321, Kitchen Hub, Chennai, 600001',
      paymentMethod: 'Cash on Delivery'
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      date: '2024-03-10',
      status: 'cancelled',
      items: [
        {
          id: '7',
          name: 'Bakery Equipment Set',
          image: '/Images/products/professional-oven.jpg',
          quantity: 1,
          price: 95000,
          productCode: 'BES-007'
        }
      ],
      totalAmount: 95000,
      shippingAddress: '654, Food Court, Kolkata, 700001',
      paymentMethod: 'Credit Card'
    }
  ];

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'pending') return ['pending', 'processing', 'shipped'].includes(order.status);
    if (selectedStatus === 'completed') return ['delivered'].includes(order.status);
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Please Login to View Orders</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your order history</p>
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Login to Continue
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
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

      {/* Hero Section */}
   

      <div className="relative bg-gray-900 text-white py-16 h-96 md:h-[600px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/Images/order dark.jpg"
            alt="Gallery & Reviews Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/1920x400/E36630/ffffff?text=Gallery+Reviews`;
            }}
          />
          <div className="absolute"></div>
        </div>
         <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 h-full flex items-center justify-center text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                My Orders
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 drop-shadow-lg">
              Track and manage all your kitchen equipment orders in one place
            </p>
          </div>
        </div>
        
      </div>
      

      {/* Status Filter */}
      <div className="bg-white shadow-sm sticky top-28 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedStatus === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length})
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedStatus === 'completed'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({orders.filter(o => o.status === 'delivered').length})
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="container mx-auto px-4 py-12">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders found</h3>
            <p className="text-gray-500">Try selecting a different status or start shopping</p>
            <a
              href="/products"
              className="inline-flex items-center mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Order Date: {new Date(order.date).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                        <p>Payment: {order.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-500 mb-2">
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="text-orange-500 hover:text-orange-600 transition-colors font-medium text-sm"
                      >
                        {expandedOrders.has(order.id) ? 'Hide Details' : 'View Details'}
                        <svg className={`w-4 h-4 inline ml-1 transform transition-transform ${expandedOrders.has(order.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrders.has(order.id) && (
                  <div className="p-6 bg-gray-50">
                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center space-x-4 bg-white p-4 rounded-lg">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/64x64/E36630/ffffff?text=${encodeURIComponent(item.name.substring(0, 8))}`;
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800">{item.name}</h5>
                              <p className="text-sm text-gray-600">Product Code: {item.productCode}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800">₹{item.price.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Tracking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Shipping Address</h4>
                        <p className="text-gray-600">{order.shippingAddress}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Tracking Information</h4>
                        {order.trackingNumber ? (
                          <div className="space-y-2">
                            <p className="text-gray-600">
                              <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                            </p>
                            {order.estimatedDelivery && (
                              <p className="text-gray-600">
                                <span className="font-medium">Estimated Delivery:</span> {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">Tracking information not available yet</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {order.status === 'pending' && (
                        <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          Cancel Order
                        </button>
                      )}
                      {order.trackingNumber && (
                        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                          Track Package
                        </button>
                      )}
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Download Invoice
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Reorder Items
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
