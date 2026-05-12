'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SignupBanner from '@/components/common/signup-banner';

interface Review {
  id: string;
  name: string;
  role: string;
  review: string;
  videoUrl?: string;
}

interface GalleryReviewDoc {
  _id: string;
  name: string;
  role: string;
  review?: string;
  videoUrl?: string;
}

function mapDocToReview(doc: GalleryReviewDoc): Review {
  return {
    id: String(doc._id),
    name: doc.name,
    role: doc.role,
    review: doc.review ?? '',
    videoUrl: doc.videoUrl?.trim() || undefined,
  };
}

function isYoutubeVideoUrl(url: string): boolean {
  const u = url.trim().toLowerCase();
  return (
    u.includes('youtube.com/') ||
    u.includes('youtu.be/') ||
    u.includes('youtube-nocookie.com/')
  );
}

const GalleryPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  /** Requested page; clamped below so it stays in range when the list shrinks */
  const [pageRequest, setPageRequest] = useState(1);
  const reviewsPerPage = 6;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/gallery-reviews');
        const json = await res.json();
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) {
          setReviews(json.data.map(mapDocToReview));
          setPageRequest(1);
        } else {
          setReviews([]);
        }
      } catch {
        if (!cancelled) setReviews([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(reviews.length / reviewsPerPage));
  const currentPage = Math.min(Math.max(1, pageRequest), totalPages);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  const paginate = (pageNumber: number) => {
    const next = Math.min(Math.max(1, pageNumber), totalPages);
    setPageRequest(next);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.includes('youtube.com/watch?v=')
      ? url.split('v=')[1]?.split('&')[0]
      : url.includes('youtu.be/')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.includes('youtube.com/shorts/')
          ? url.split('/shorts/')[1]?.split('?')[0]
          : null;

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        :root {
          --color-gray-dark: #565D63;
          --color-orange: #E36630;
          --color-blue: #0F4C69;
          --color-gray-medium: #4B4B4B;
          --color-black: #000000;
          --color-white: #FFFFFF;
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white py-16 h-96 md:h-[600px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/Images/Chef-Reviews-Banner.png"
            alt="Gallery & Reviews Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/1920x400/E36630/ffffff?text=Gallery+Reviews`;
            }}
          />
          <div className="absolute "></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              Gallery & Reviews
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 drop-shadow-lg">
              See what top chefs, YouTubers, and celebrities say about Ambassador kitchen equipment
            </p>
          </div>
        </div>
      </div>





      {/* Reviews Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Customer <span className="text-orange-500">Reviews</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hear directly from culinary professionals who trust Ambassador kitchen equipment for their businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentReviews.map(review => {
            const url = review.videoUrl?.trim() ?? '';
            const embedUrl = getYouTubeEmbedUrl(url);
            const directVideoUrl =
              embedUrl || !url ? '' : /^https?:\/\//i.test(url) && !isYoutubeVideoUrl(url) ? url : '';

            return (
              <div
                key={review.id}
                className="flex h-[520px] flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
              >
                {/* Video/Image Section — taller embed for readability */}
                <div className="relative h-[14.5rem] shrink-0 bg-gray-100 sm:h-[16rem] md:h-[17.5rem]">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={`${review.name} Review`}
                      className="w-full h-full object-cover"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : directVideoUrl ? (
                    <video
                      src={directVideoUrl}
                      className="h-full w-full object-cover"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src="/Images/gallery/default-avatar.jpg"
                      alt={review.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/E36630/ffffff?text=${encodeURIComponent(review.name)}`;
                      }}
                    />
                  )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-5">
                  <blockquote className="line-clamp-3 break-words italic text-gray-700">
                    &ldquo;{review.review}&rdquo;
                  </blockquote>

                  {/* Chef Section with View Product Button — tucked under quote (no flex spacer) */}
                  <div className="mt-2 flex shrink-0 items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <p className="text-sm text-gray-500">{review.role}</p>
                    </div>
                    <Link
                      href={`/products`}
                      className="inline-flex items-center px-3 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      View Product
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1 || reviews.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1 || reviews.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-orange-50 hover:border-orange-300'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => paginate(pageNumber)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === pageNumber
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-orange-50 hover:border-orange-300'
                  }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || reviews.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages || reviews.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-orange-50 hover:border-orange-300'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Page Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Showing{' '}
            {reviews.length === 0 ? 0 : indexOfFirstReview + 1} to{' '}
            {reviews.length === 0 ? 0 : Math.min(indexOfLastReview, reviews.length)} of {reviews.length} reviews
          </p>
        </div>
      </div>

      {/* Signup Banner */}
      <SignupBanner />
    </div>
  );
};

export default GalleryPage;
