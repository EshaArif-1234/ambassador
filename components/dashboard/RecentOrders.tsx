'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  customerName: string;
  email: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  items: number;
}

interface RecentOrdersProps {
  title: string;
  filter?: 'pending' | 'all';
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ title, filter = 'all' }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchOrders = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockOrders: Order[] = [
        {
          id: 'ORD-001',
          customerName: 'Rajesh Kumar',
          email: 'rajesh@email.com',
          total: 45999,
          status: 'pending',
          date: '2024-03-30',
          items: 3
        },
        {
          id: 'ORD-002',
          customerName: 'Priya Sharma',
          email: 'priya@email.com',
          total: 28500,
          status: 'completed',
          date: '2024-03-30',
          items: 2
        },
        {
          id: 'ORD-003',
          customerName: 'Amit Patel',
          email: 'amit@email.com',
          total: 125000,
          status: 'processing',
          date: '2024-03-29',
          items: 5
        },
        {
          id: 'ORD-004',
          customerName: 'Sneha Reddy',
          email: 'sneha@email.com',
          total: 18999,
          status: 'pending',
          date: '2024-03-29',
          items: 1
        },
        {
          id: 'ORD-005',
          customerName: 'Vikram Singh',
          email: 'vikram@email.com',
          total: 67000,
          status: 'completed',
          date: '2024-03-28',
          items: 4
        }
      ];

      const filteredOrders = filter === 'pending' 
        ? mockOrders.filter(order => order.status === 'pending')
        : mockOrders;

      setOrders(filteredOrders);
      setLoading(false);
    };

    fetchOrders();
  }, [filter]);

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <Link
          href="/admin/orders"
          className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          View All →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{order.items} items</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{order.id}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{order.date}</span>
                </div>
                <span className={getStatusBadge(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
