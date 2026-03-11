'use client';

interface ProductRatingsProps {
  averageRating?: number;
  totalReviews?: number;
  className?: string;
}

export default function ProductRatings({
  averageRating = 4.5,
  totalReviews = 245,
  className = ''
}: ProductRatingsProps) {

  // Calculate rating distribution (mock data)
  const ratingDistribution = [
    { stars: 5, percentage: 72, count: Math.floor(totalReviews * 0.72) },
    { stars: 4, percentage: 18, count: Math.floor(totalReviews * 0.18) },
    { stars: 3, percentage: 7, count: Math.floor(totalReviews * 0.07) },
    { stars: 2, percentage: 2, count: Math.floor(totalReviews * 0.02) },
    { stars: 1, percentage: 1, count: Math.floor(totalReviews * 0.01) }
  ];

  const renderStars = (rating: number, size = 'normal') => {
    const starSize = size === 'large' ? 'w-6 h-6' : 'w-4 h-4';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className={`flex items-center ${starSize === 'w-6 h-6' ? 'gap-1' : 'gap-0.5'}`}>
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className={`${starSize} text-orange-500 fill-current`} viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className={`${starSize} text-orange-500 fill-current`} viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" opacity="0.5" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className={`${starSize} text-gray-300 fill-current`} viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Overall Rating */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{averageRating}</div>
            <div className="text-sm text-gray-600">out of 5</div>
          </div>
          <div className="border-l border-gray-300 h-12 mx-3"></div>
          <div>
            {renderStars(averageRating, 'large')}
            <div className="text-sm text-gray-600 mt-1">{totalReviews} ratings</div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {ratingDistribution.map((rating) => (
          <div key={rating.stars} className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-gray-600 w-16">
              <span>{rating.stars}</span>
              <svg className="w-4 h-4 text-orange-500 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${rating.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm text-gray-600 w-12 text-right">
              {rating.percentage}%
            </div>
            <div className="text-sm text-gray-600 w-8 text-right">
              {rating.count}
            </div>
          </div>
        ))}
      </div>

      {/* Review Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button 
          onClick={() => {
            // Navigate to review section - scroll to reviews on the page
            const reviewsSection = document.getElementById('customer-reviews');
            if (reviewsSection) {
              reviewsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
              // If no reviews section on current page, navigate to product detail page reviews
              window.location.href = '#customer-reviews';
            }
          }}
          className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
        >
          See customer reviews
        </button>
      </div>
    </div>
  );
}
