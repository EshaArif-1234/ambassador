'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PRODUCTS_PATH } from '@/lib/siteRoutes';
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

interface GalleryReviewCardProps {
  review: Review;
  embedUrl: string | null;
  directVideoUrl: string;
}

function GalleryReviewCard({ review, embedUrl, directVideoUrl }: GalleryReviewCardProps) {
  const [revealed, setRevealed] = useState(false);
  const hasQuote = Boolean(review.review?.trim());

  return (
    <div
      className="relative flex h-[450px] flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
      onMouseLeave={() => setRevealed(false)}
    >
      {/* Video/Image Section */}
      <div className={`relative shrink-0 bg-gray-100 h-[14.5rem] sm:h-[16rem] md:h-[17.5rem] ${revealed ? 'pointer-events-none' : ''}`}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={`${review.name} Review`}
            className="h-full w-full object-cover"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : directVideoUrl ? (
          <video src={directVideoUrl} className="h-full w-full object-cover" controls preload="metadata" />
        ) : (
          <img
            src="/Images/gallery/default-avatar.jpg"
            alt={review.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/E36630/ffffff?text=${encodeURIComponent(review.name)}`;
            }}
          />
        )}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col bg-white px-6 pt-5">
        {hasQuote ? (
          <div className="cursor-pointer" onMouseEnter={() => setRevealed(true)}>
            <blockquote className="line-clamp-3 break-words italic text-gray-700 transition-opacity duration-300">
              &ldquo;{review.review}&rdquo;
            </blockquote>
          </div>
        ) : (
          <blockquote className="line-clamp-3 break-words italic text-gray-400">&mdash;</blockquote>
        )}

        <div className="mt-2 flex shrink-0 items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-gray-900">{review.name}</h4>
            <p className="text-sm text-gray-500">{review.role}</p>
          </div>
          <Link
            href={PRODUCTS_PATH}
            className={`inline-flex items-center rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 ${revealed ? 'pointer-events-none opacity-50' : ''}`}
          >
            View Product
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Sliding dark overlay — bottom → top */}
      <div
        className={`absolute inset-0 z-20 flex flex-col justify-center bg-black/70 px-6 py-8 backdrop-blur-[2px] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none ${
          revealed && hasQuote ? 'translate-y-0' : 'translate-y-full'
        } ${revealed ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onMouseEnter={() => hasQuote && setRevealed(true)}
      >
        {hasQuote ? (
          <div className="mx-auto max-h-full min-h-0 w-full overflow-y-auto overscroll-contain px-2 [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar]:w-2">
            <div className="mb-5 flex shrink-0 items-center gap-2 border-b border-white/15 pb-4">
              <span className="font-serif text-3xl leading-none text-[#E36630]" aria-hidden>
                &ldquo;
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-100/95">
                Full testimonial
              </p>
            </div>
            <p className="text-[15px] italic leading-relaxed tracking-wide text-white/95">{review.review}</p>
          </div>
        ) : null}
      </div>
    </div>
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
              <GalleryReviewCard
                key={review.id}
                review={review}
                embedUrl={embedUrl}
                directVideoUrl={directVideoUrl}
              />
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
