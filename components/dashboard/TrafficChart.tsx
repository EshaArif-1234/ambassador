'use client';

import { useState, useEffect } from 'react';

const TrafficChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    // Simulate API call for traffic data
    const fetchTrafficData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let data: any[] = [];
      
      if (timeRange === 'daily') {
        data = [
          { day: 'Mon', visitors: 1200, pageViews: 3400 },
          { day: 'Tue', visitors: 1900, pageViews: 5200 },
          { day: 'Wed', visitors: 2400, pageViews: 6800 },
          { day: 'Thu', visitors: 2100, pageViews: 5900 },
          { day: 'Fri', visitors: 3200, pageViews: 8900 },
          { day: 'Sat', visitors: 2800, pageViews: 7600 },
          { day: 'Sun', visitors: 2200, pageViews: 6100 },
        ];
      } else {
        // Weekly data
        data = [
          { week: 'Week 1', visitors: 12000, pageViews: 34000 },
          { week: 'Week 2', visitors: 15800, pageViews: 44500 },
          { week: 'Week 3', visitors: 18900, pageViews: 53200 },
          { week: 'Week 4', visitors: 16700, pageViews: 46800 },
        ];
      }
      
      setChartData(data);
      setLoading(false);
    };

    fetchTrafficData();
  }, [timeRange]);

  const maxVisitors = Math.max(...chartData.map(d => d.visitors), 1);
  const maxPageViews = Math.max(...chartData.map(d => d.pageViews), 1);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Website Traffic</h3>
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
          <h3 className="text-lg font-semibold text-gray-800">Website Traffic</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Visitors</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Page Views</span>
            </div>
          </div>
        </div>

        {/* Time Range Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Period:</span>
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setTimeRange('daily')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeRange === 'daily'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Daily
            </button>
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
          </div>
        </div>
      </div>

      <div className="h-64 relative">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">No traffic data</p>
            <p className="text-gray-400 text-sm">No website traffic data available</p>
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
                    {/* Visitors Bar */}
                    <div 
                      className="w-full rounded-t-sm transition-all duration-500 hover:opacity-80 cursor-pointer bg-blue-500 hover:bg-blue-600 mb-1"
                      style={{ 
                        height: `${(data.visitors / maxVisitors) * 60}px`,
                        opacity: loading ? 0 : 1,
                        transform: loading ? 'translateY(20px)' : 'translateY(0)'
                      }}
                      title={`${data.visitors} visitors`}
                    ></div>
                    
                    {/* Page Views Bar */}
                    <div 
                      className="w-full rounded-t-sm transition-all duration-500 hover:opacity-80 cursor-pointer bg-purple-500 hover:bg-purple-600"
                      style={{ 
                        height: `${(data.pageViews / maxPageViews) * 60}px`,
                        opacity: loading ? 0 : 1,
                        transform: loading ? 'translateY(20px)' : 'translateY(0)'
                      }}
                      title={`${data.pageViews} page views`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {timeRange === 'daily' ? data.day : data.week}
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
            Total Visitors ({timeRange === 'daily' ? 'Daily' : 'Weekly'})
          </p>
          <p className="text-xl font-bold text-gray-900">
            {chartData.reduce((sum, d) => sum + d.visitors, 0).toLocaleString()}
          </p>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total Page Views ({timeRange === 'daily' ? 'Daily' : 'Weekly'})
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {chartData.reduce((sum, d) => sum + d.pageViews, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficChart;
