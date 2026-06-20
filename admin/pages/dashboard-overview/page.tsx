'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import SalesChart from '@/components/dashboard/SalesChart';
import TrafficChart from '@/components/dashboard/TrafficChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import TopSellingProducts from '@/components/dashboard/TopSellingProducts';

interface Stats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  ordersByStatus: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', { credentials: 'include' });
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const completedOrders = stats?.ordersByStatus.delivered ?? 0;
  const pendingOrders   = stats?.ordersByStatus.pending   ?? 0;
  const totalOrders     = stats?.totalOrders   ?? 0;
  const totalUsers      = stats?.totalUsers    ?? 0;
  const totalProducts   = stats?.totalProducts ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-lg text-gray-600">Welcome to your admin dashboard. Here&apos;s what&apos;s happening with your business today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Total Orders"
            value={totalOrders}
            change={`${pendingOrders} pending`}
            changeType="positive"
            icon="orders"
            color="orange"
          />
          <StatsCard
            title="Total Users"
            value={totalUsers}
            change="Registered customers"
            changeType="positive"
            icon="users"
            color="blue"
          />
          <StatsCard
            title="Total Products"
            value={totalProducts}
            change="Active listings"
            changeType="positive"
            icon="products"
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart />
          <TrafficChart />
        </div>

        {/* Recent Orders and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders title="Recent Orders" />
          <TopSellingProducts />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Summary</h3>

            {/* Donut Chart */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                  <circle
                    cx="80" cy="80" r="60" fill="none" stroke="#10b981" strokeWidth="20"
                    strokeDasharray={`${totalOrders > 0 ? (completedOrders / totalOrders) * 377 : 0} 377`}
                    className="transition-all duration-500"
                  />
                  <circle
                    cx="80" cy="80" r="60" fill="none" stroke="#f97316" strokeWidth="20"
                    strokeDasharray={`${totalOrders > 0 ? (pendingOrders / totalOrders) * 377 : 0} 377`}
                    strokeDashoffset={`-${totalOrders > 0 ? (completedOrders / totalOrders) * 377 : 0}`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{totalOrders}</span>
                  <span className="text-sm text-gray-500">Total Orders</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {[
                { label: 'Delivered',  count: completedOrders,                         color: 'bg-green-500',  textColor: 'text-green-600'  },
                { label: 'Pending',    count: pendingOrders,                            color: 'bg-orange-500', textColor: 'text-orange-600' },
                { label: 'Processing', count: stats?.ordersByStatus.processing ?? 0,   color: 'bg-blue-500',   textColor: 'text-blue-600'   },
                { label: 'Shipped',    count: stats?.ordersByStatus.shipped    ?? 0,   color: 'bg-cyan-500',   textColor: 'text-cyan-600'   },
                { label: 'Confirmed',  count: stats?.ordersByStatus.confirmed  ?? 0,   color: 'bg-indigo-500', textColor: 'text-indigo-600' },
                { label: 'Cancelled',  count: stats?.ordersByStatus.cancelled  ?? 0,   color: 'bg-red-400',    textColor: 'text-red-600'    },
              ].map(({ label, count, color, textColor }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${color} rounded-full`} />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  <span className={`text-sm font-bold ${textColor}`}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Pending Orders</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{pendingOrders}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Delivered Orders</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{completedOrders}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Total Users</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{totalUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;
