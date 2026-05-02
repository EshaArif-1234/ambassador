'use client';

export type StarKey = 1 | 2 | 3 | 4 | 5;

const STAR_ORDER: StarKey[] = [5, 4, 3, 2, 1];

interface ProductRatingsProps {
  averageRating?: number;
  totalReviews?: number;
  /** Per-star counts from API or parent; when set, histogram is real (no mock). */
  countsByStar?: Partial<Record<StarKey, number>>;
  className?: string;
}

export default function ProductRatings({
  averageRating = 0,
  totalReviews = 0,
  countsByStar,
  className = '',
}: ProductRatingsProps) {
  const total = totalReviews;
  const distribution = STAR_ORDER.map((stars) => {
    const count = countsByStar?.[stars] ?? 0;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { stars, percentage, count };
  });

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
            <path
              d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
              opacity="0.5"
            />
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {total > 0 ? averageRating.toFixed(1) : '—'}
            </div>
            <div className="text-sm text-gray-600">out of 5</div>
          </div>
          <div className="border-l border-gray-300 h-12 mx-3" />
          <div>
            {total > 0 ? (
              renderStars(averageRating, 'large')
            ) : (
              <div className="text-sm text-gray-500">No ratings yet</div>
            )}
            <div className="text-sm text-gray-600 mt-1">{total} ratings</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {distribution.map((rating) => (
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
                />
              </div>
            </div>
            <div className="text-sm text-gray-600 w-12 text-right">{rating.percentage}%</div>
            <div className="text-sm text-gray-600 w-8 text-right">{rating.count}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            const reviewsSection = document.getElementById('customer-reviews');
            if (reviewsSection) {
              reviewsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
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
