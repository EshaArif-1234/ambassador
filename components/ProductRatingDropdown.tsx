'use client';

import { useState, useRef, useEffect } from 'react';
import ProductRatings from './ProductRatings';

interface ProductRatingDropdownProps {
  averageRating?: number;
  totalReviews?: number;
  productName?: string;
  className?: string;
}

export default function ProductRatingDropdown({ 
  averageRating = 4.5, 
  totalReviews = 245, 
  productName = 'Product',
  className = '' 
}: ProductRatingDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-orange-500 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-orange-500 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" opacity="0.5" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 400; // Approximate height of dropdown
    const dropdownWidth = 350; // Width of dropdown
    
    // Calculate position to show dropdown below the clicked element
    let left = rect.left;
    let top = rect.bottom + 8; // 8px gap
    
    // Adjust if dropdown would go beyond right edge of screen
    if (left + dropdownWidth > window.innerWidth) {
      left = window.innerWidth - dropdownWidth - 16; // 16px padding
    }
    
    // Adjust if dropdown would go beyond bottom of screen
    if (top + dropdownHeight > window.innerHeight) {
      top = rect.top - dropdownHeight - 8; // Show above instead
    }
    
    // Ensure dropdown doesn't go beyond left edge
    if (left < 16) {
      left = 16;
    }
    
    setDropdownPosition({ top, left });
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      {/* Rating Summary - Clickable */}
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
        onClick={handleClick}
      >
        {renderStars(averageRating)}
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{averageRating}</span>
          <span className="text-gray-500"> ({totalReviews})</span>
        </div>
        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Content - Fixed Position */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-[320px] max-w-[400px]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className="p-4">
            <div className="mb-3 pb-3 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">{productName}</h4>
              <p className="text-xs text-gray-600">Customer Reviews</p>
            </div>
            <ProductRatings 
              averageRating={averageRating}
              totalReviews={totalReviews}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
