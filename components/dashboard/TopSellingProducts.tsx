'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const TopSellingProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for top selling products
    const fetchTopProducts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProducts = [
        {
          id: 1,
          name: 'Modern Kitchen Cabinet Set',
          image: '/api/placeholder/60/60',
          sales: 234,
          revenue: 4680000,
          category: 'Cabinets',
          trend: 'up'
        },
        {
          id: 2,
          name: 'Premium Marble Countertop',
          image: '/api/placeholder/60/60',
          sales: 189,
          revenue: 5670000,
          category: 'Countertops',
          trend: 'up'
        },
        {
          id: 3,
          name: 'Stainless Steel Sink',
          image: '/api/placeholder/60/60',
          sales: 156,
          revenue: 2340000,
          category: 'Sinks',
          trend: 'down'
        },
        {
          id: 4,
          name: 'LED Kitchen Lighting',
          image: '/api/placeholder/60/60',
          sales: 142,
          revenue: 1420000,
          category: 'Lighting',
          trend: 'up'
        },
        {
          id: 5,
          name: 'Wooden Kitchen Island',
          image: '/api/placeholder/60/60',
          sales: 98,
          revenue: 2940000,
          category: 'Islands',
          trend: 'stable'
        }
      ];
      
      setProducts(mockProducts);
      setLoading(false);
    };

    fetchTopProducts();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Top Selling Products</h3>
        <span className="text-sm text-gray-500">Last 30 days</span>
      </div>
      
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            {/* Rank */}
            <div className="flex-shrink-0 w-8 text-center">
              <span className={`text-lg font-bold ${
                index === 0 ? 'text-yellow-500' : 
                index === 1 ? 'text-gray-400' : 
                index === 2 ? 'text-orange-600' : 
                'text-gray-600'
              }`}>
                #{index + 1}
              </span>
            </div>

            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{product.category}</span>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(product.trend)}
                </div>
              </div>
            </div>

            {/* Sales Data */}
            <div className="flex-shrink-0 text-right">
              <p className="font-semibold text-gray-900">{product.sales} sold</p>
              <p className="text-sm text-gray-500">₹{(product.revenue / 1000).toFixed(1)}K</p>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors">
          View All Products →
        </button>
      </div>
    </div>
  );
};

export default TopSellingProducts;
