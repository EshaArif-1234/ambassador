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
          customerName: 'John Doe',
          email: 'john.doe@email.com',
          total: 45999,
          status: 'pending',
          date: '2024-03-30',
          items: 3
        },
        {
          id: 'ORD-002',
          customerName: 'Jane Smith',
          email: 'jane.smith@email.com',
          total: 28500,
          status: 'completed',
          date: '2024-03-30',
          items: 2
        },
        {
          id: 'ORD-003',
          customerName: 'Mike Johnson',
          email: 'mike.johnson@email.com',
          total: 125000,
          status: 'processing',
          date: '2024-03-29',
          items: 5
        },
        {
          id: 'ORD-004',
          customerName: 'Sarah Wilson',
          email: 'sarah.wilson@email.com',
          total: 18999,
          status: 'pending',
          date: '2024-03-29',
          items: 1
        },
        {
          id: 'ORD-005',
          customerName: 'David Brown',
          email: 'david.brown@email.com',
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
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-gray-500 text-lg font-medium mb-2">No orders yet</p>
          <p className="text-gray-400 text-sm">When orders are placed, they will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 pb-3 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div>Customer</div>
            <div>Order ID</div>
            <div>Date</div>
            <div>Amount</div>
            <div>Status</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-5 gap-4 py-3 hover:bg-gray-50 transition-colors">
                {/* Customer */}
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{order.customerName}</p>
                  <p className="text-sm text-gray-500 truncate">{order.email}</p>
                </div>

                {/* Order ID */}
                <div className="min-w-0">
                  <p className="font-mono text-sm text-gray-900">#{order.id}</p>
                </div>

                {/* Date */}
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">{order.date}</p>
                </div>

                {/* Amount */}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{order.items} items</p>
                </div>

                {/* Status */}
                <div className="min-w-0">
                  <span className={getStatusBadge(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
