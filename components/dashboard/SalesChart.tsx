'use client';

import { useState, useEffect } from 'react';

const SalesChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for chart data
    const fetchChartData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = [
        { month: 'Jan', sales: 185000, orders: 82 },
        { month: 'Feb', sales: 225000, orders: 95 },
        { month: 'Mar', sales: 198000, orders: 87 },
        { month: 'Apr', sales: 267000, orders: 112 },
        { month: 'May', sales: 312000, orders: 134 },
        { month: 'Jun', sales: 289000, orders: 123 },
      ];
      
      setChartData(data);
      setLoading(false);
    };

    fetchChartData();
  }, []);

  const maxSales = Math.max(...chartData.map(d => d.sales));
  const maxOrders = Math.max(...chartData.map(d => d.orders));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Overview</h3>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Sales</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Orders</span>
          </div>
        </div>
      </div>

      <div className="h-64 relative">
        {/* Simple bar chart implementation */}
        <div className="absolute inset-0 flex items-end justify-between space-x-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col space-y-1">
                {/* Sales bar */}
                <div 
                  className="w-full bg-orange-500 rounded-t-sm transition-all duration-500 hover:bg-orange-600"
                  style={{ 
                    height: `${(data.sales / maxSales) * 120}px`,
                    opacity: loading ? 0 : 1,
                    transform: loading ? 'translateY(20px)' : 'translateY(0)'
                  }}
                ></div>
                {/* Orders bar */}
                <div 
                  className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600"
                  style={{ 
                    height: `${(data.orders / maxOrders) * 120}px`,
                    opacity: loading ? 0 : 1,
                    transform: loading ? 'translateY(20px)' : 'translateY(0)'
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-2">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Total Sales</p>
          <p className="text-xl font-bold text-gray-900">
            ₹{chartData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-xl font-bold text-gray-900">
            {chartData.reduce((sum, d) => sum + d.orders, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
