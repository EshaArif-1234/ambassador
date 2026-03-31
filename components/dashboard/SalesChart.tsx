'use client';

import { useState, useEffect } from 'react';

const SalesChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataType, setDataType] = useState<'sales' | 'orders'>('sales');
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    // Simulate API call for chart data
    const fetchChartData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate empty data scenario (randomly return empty data for demo)
      const shouldReturnEmpty = Math.random() > 0.8; // 20% chance of empty data
      
      let data: any[] = [];
      
      if (!shouldReturnEmpty) {
        if (timeRange === 'monthly') {
          data = [
            { month: 'Jan', sales: 185000, orders: 82 },
            { month: 'Feb', sales: 225000, orders: 95 },
            { month: 'Mar', sales: 198000, orders: 87 },
            { month: 'Apr', sales: 267000, orders: 112 },
            { month: 'May', sales: 312000, orders: 134 },
            { month: 'Jun', sales: 289000, orders: 123 },
          ];
        } else {
          // Weekly data
          data = [
            { week: 'Week 1', sales: 45000, orders: 20 },
            { week: 'Week 2', sales: 52000, orders: 23 },
            { week: 'Week 3', sales: 48000, orders: 21 },
            { week: 'Week 4', sales: 61000, orders: 28 },
          ];
        }
      }
      
      setChartData(data);
      setLoading(false);
    };

    fetchChartData();
  }, [timeRange]);

  const maxSales = Math.max(...chartData.map(d => d.sales), 1);
  const maxOrders = Math.max(...chartData.map(d => d.orders), 1);

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
      <div className="flex flex-col space-y-4 mb-6">
        {/* Chart Title */}
        <div className="flex items-center justify-between">
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

        {/* Chart Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* Data Type Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setDataType('sales')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  dataType === 'sales'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setDataType('orders')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  dataType === 'orders'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          {/* Time Range Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Period:</span>
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setTimeRange('weekly')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === 'weekly'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === 'monthly'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-64 relative">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">No activity</p>
            <p className="text-gray-400 text-sm">No data available for the selected period</p>
          </div>
        ) : (
          /* Chart with grid lines */
          <div className="relative h-full">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-b border-gray-100"></div>
              ))}
            </div>
            
            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-between space-x-2 pb-2">
              {chartData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full relative">
                    {/* Single bar based on selected data type */}
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-500 hover:opacity-80 cursor-pointer ${
                        dataType === 'sales' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      style={{ 
                        height: `${(data[dataType] / (dataType === 'sales' ? maxSales : maxOrders)) * 140}px`,
                        opacity: loading ? 0 : 1,
                        transform: loading ? 'translateY(20px)' : 'translateY(0)'
                      }}
                      title={`${dataType === 'sales' ? '₹' + data.sales.toLocaleString() : data.orders + ' orders'}`}
                    ></div>
                    
                    {/* Hover tooltip placeholder */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {dataType === 'sales' ? '₹' + data.sales.toLocaleString() : data.orders + ' orders'}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {timeRange === 'monthly' ? data.month : data.week}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="mt-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            Total {dataType === 'sales' ? 'Sales' : 'Orders'} ({timeRange === 'monthly' ? 'Monthly' : 'Weekly'})
          </p>
          <p className="text-xl font-bold text-gray-900">
            {dataType === 'sales' 
              ? `₹${chartData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}`
              : chartData.reduce((sum, d) => sum + d.orders, 0)
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
