'use client';

import { useState, useEffect } from 'react';

interface DataPoint {
  label: string;
  orders: number;
  users: number;
}

const TrafficChart = () => {
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/traffic?range=${timeRange}`);
        const json = await res.json();
        if (json.success) {
          setChartData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch traffic data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const maxOrders = Math.max(...chartData.map(d => d.orders), 1);
  const maxUsers  = Math.max(...chartData.map(d => d.users),  1);
  const maxVal    = Math.max(maxOrders, maxUsers, 1);

  const totalOrders = chartData.reduce((s, d) => s + d.orders, 0);
  const totalUsers  = chartData.reduce((s, d) => s + d.users,  0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Activity</h3>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col space-y-4 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Business Activity</h3>
            <p className="text-xs text-gray-400 mt-0.5">New orders &amp; registrations over time</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-xs text-gray-600">Orders</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-xs text-gray-600">New Users</span>
            </div>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Period:</span>
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            {(['daily', 'weekly', 'monthly'] as const).map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === r
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 relative">
        {chartData.every(d => d.orders === 0 && d.users === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-14 h-14 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 font-medium">No activity yet</p>
            <p className="text-gray-400 text-sm mt-1">Orders and user registrations will appear here</p>
          </div>
        ) : (
          <div className="relative h-full">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="border-b border-gray-100" />
              ))}
            </div>

            {/* Y-axis labels */}
            <div className="absolute left-0 inset-y-0 flex flex-col justify-between pr-1 pointer-events-none">
              {[4, 3, 2, 1, 0].map(i => (
                <span key={i} className="text-[10px] text-gray-400 leading-none">
                  {Math.round((maxVal / 4) * i)}
                </span>
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-0 pl-6 flex items-end justify-between gap-1 pb-5">
              {chartData.map((d, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 group">
                  <div className="w-full flex gap-0.5 items-end">
                    {/* Orders bar */}
                    <div
                      className="flex-1 rounded-t bg-orange-400 hover:bg-orange-500 transition-all duration-500 cursor-pointer"
                      style={{ height: `${Math.max((d.orders / maxVal) * 180, d.orders > 0 ? 4 : 0)}px` }}
                      title={`${d.orders} order${d.orders !== 1 ? 's' : ''}`}
                    />
                    {/* Users bar */}
                    <div
                      className="flex-1 rounded-t bg-blue-400 hover:bg-blue-500 transition-all duration-500 cursor-pointer"
                      style={{ height: `${Math.max((d.users / maxVal) * 180, d.users > 0 ? 4 : 0)}px` }}
                      title={`${d.users} new user${d.users !== 1 ? 's' : ''}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">
            Total Orders <span className="text-gray-400 capitalize">({timeRange})</span>
          </p>
          <p className="text-xl font-bold text-orange-600 tabular-nums">{totalOrders}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">
            New Users <span className="text-gray-400 capitalize">({timeRange})</span>
          </p>
          <p className="text-xl font-bold text-blue-600 tabular-nums">{totalUsers}</p>
        </div>
      </div>
    </div>
  );
};

export default TrafficChart;
