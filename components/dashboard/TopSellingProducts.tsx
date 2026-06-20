'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { isNextImageSupportedUrl } from '@/utils/productMedia.util';

interface TopProduct {
  id: string;
  productId: string | null;
  name: string;
  image: string;
  category: string;
  sales: number;
  orderCount: number;
  revenue: number;
  unitPrice: number;
  originalPrice: number;
  avgSalePrice: number;
  onSale: boolean;
  trend: 'up' | 'down' | 'stable';
}

function formatPkr(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString('en-PK')}`;
}

const TopSellingProducts = () => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTopProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/top-products?limit=5&days=30', {
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load top products.');
        }
        if (cancelled) return;
        setProducts(json.data as TopProduct[]);
        setDays(Number(json.days) || 30);
      } catch (err) {
        if (!cancelled) {
          setProducts([]);
          setError(err instanceof Error ? err.message : 'Failed to load top products.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTopProducts();
    return () => { cancelled = true; };
  }, []);

  const getTrendIcon = (trend: TopProduct['trend']) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-4 bg-gray-200 rounded" />
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="w-28 space-y-1.5">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded" />
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
        <span className="text-sm text-gray-500">Last {days} days</span>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 text-lg font-medium mb-2">No sales data yet</p>
          <p className="text-gray-400 text-sm">
            Top sellers will appear here once orders are placed
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-start gap-3 sm:gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex-shrink-0 w-7 sm:w-8 text-center pt-1">
                <span
                  className={`text-base sm:text-lg font-bold ${
                    index === 0
                      ? 'text-yellow-500'
                      : index === 1
                        ? 'text-gray-400'
                        : index === 2
                          ? 'text-orange-600'
                          : 'text-gray-600'
                  }`}
                >
                  #{index + 1}
                </span>
              </div>

              <div className="relative flex-shrink-0 h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                {isNextImageSupportedUrl(product.image) ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 line-clamp-2 leading-snug">
                  {product.name}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {product.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {product.sales} sold · {product.orderCount} order{product.orderCount !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center" title={`Trend vs previous ${days} days`}>
                    {getTrendIcon(product.trend)}
                  </div>
                </div>

                {product.unitPrice > 0 && (
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-1.5">
                    <span className="text-sm font-semibold text-[#E36630]">
                      {formatPkr(product.unitPrice)}
                    </span>
                    {product.onSale && product.originalPrice > product.unitPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPkr(product.originalPrice)}
                      </span>
                    )}
                    {product.avgSalePrice > 0 && product.avgSalePrice !== product.unitPrice && (
                      <span className="text-xs text-gray-500">
                        Avg sold {formatPkr(product.avgSalePrice)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 text-right min-w-[6.5rem]">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Revenue
                </p>
                <p className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap">
                  {formatPkr(product.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/product-management"
          className="block w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
        >
          View All Products →
        </Link>
      </div>
    </div>
  );
};

export default TopSellingProducts;
