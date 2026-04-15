'use client';

import { useState } from 'react';
import Link from 'next/link';
import SignupBanner from '@/components/common/signup-banner';

interface Review {
  id: string;
  name: string;
  role: string;
  review: string;
  videoUrl?: string;
}

const GalleryPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;

  const reviews: Review[] = [
    {
      id: '1',
      name: 'Chef Mehboob Khan',
      role: 'Celebrity Chef',
      review: 'Ambassador\'s commercial kitchen equipment has transformed my restaurant operations. The quality and durability are unmatched!',
      videoUrl: 'https://www.youtube.com/watch?v=MQgXy4cYnsw',
    },
    {
      id: '2',
      name: 'Chef Zakir Qureshi',
      role: 'Food YouTuber',
      review: 'I use Ambassador equipment in my kitchen studio. The precision and reliability help me create perfect content every time.',
      videoUrl: 'https://www.youtube.com/watch?v=rJrKZ6JAexI',

    },
    {
      id: '3',
      name: 'Chef Rahat Ali',
      role: 'Chef & Entrepreneur',
      review: 'Great value for money equipment. Has helped scale my catering business effectively.',
      videoUrl: 'https://www.youtube.com/shorts/HzRnJuGO30E',

    },
    {
      id: '4',
      name: 'Chef Ali Abbas',
      role: 'Michelin Star Chef',
      review: 'Ambassador understands the needs of professional chefs. Their equipment is designed with perfection in mind.',
      videoUrl: 'https://www.youtube.com/shorts/UtiL6m9UPrA',

    },
    {
      id: '5',
      name: 'Chef Faiza Khan',
      role: 'Chef & TV Personality',
      review: 'Excellent equipment that meets international standards. Perfect for fusion cuisine restaurants.',
      videoUrl: 'https://www.youtube.com/shorts/2c4LO14HNzc',

    },
    {
      id: '6',
      name: 'Chef Azam Khan',
      role: 'Food YouTuber',
      review: 'The best investment for my food channel. Ambassador equipment delivers consistent results every time.',
      videoUrl: 'https://www.youtube.com/shorts/vZaYXGl3vwk',

    },
    {
      id: '7',
      name: 'Chef Deniel',
      role: 'Chef & Food Blogger',
      review: 'Ambassador equipment has been a game-changer for my restaurant business. The reliability and performance are outstanding.',
      videoUrl: 'https://www.youtube.com/shorts/oK8_f9tckTo',

    },
    {
      id: '8',
      name: 'Waqas Illyas Khan',
      role: 'Vice President of Chef Association Of Pakistan',
      review: 'Ambassador equipment has been a game-changer for my restaurant business. The reliability and performance are outstanding.',
      videoUrl: 'https://www.youtube.com/watch?v=6x6l5DfMqtQ',

    },
    {
      id: '9',
      name: 'Chef Tippu',
      role: 'Restaurant Owner',
      review: 'Ambassador equipment has been a game-changer for my restaurant business. The reliability and performance are outstanding.',       
      videoUrl: 'https://www.youtube.com/watch?v=oMIb2iGQ0rI',
    },
    {
      id: '10',
      name: 'Baba Food RRC',
      role: 'Food Blogger',
      review: 'Perfect equipment for content creation. Ambassador products help me showcase recipes beautifully.',
      videoUrl: 'https://www.youtube.com/shorts/YBDcByYdwmk',
    },
    {
      id: '11',
      name: 'Chef Gulzar',
      role: 'Catering Manager',
      review: 'Outstanding quality and service. Ambassador equipment has helped us serve large events efficiently.',
      videoUrl: 'https://www.youtube.com/watch?v=Gi45aHuShcE',
    },
    {
      id: '12',
      name: 'Chef Tippu Imran',
      role: 'Celebrity Chef',
      review: 'Outstanding quality and service. Ambassador equipment has helped us serve large events efficiently.',
      videoUrl: 'https://www.youtube.com/watch?v=-jG1agRx0WQ',

    },
    
  ];

  // Pagination logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-orange-500' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-.755 1.902 0l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
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
            const embedUrl = getYouTubeEmbedUrl(review.videoUrl || '');

            return (
              <div key={review.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                {/* Video/Image Section */}
                <div className="relative h-48 bg-gray-100">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={`${review.name} Review`}
                      className="w-full h-full object-cover"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
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

                <div className="p-6">


                  <blockquote className="text-gray-700 mb-4 italic">
                    "{review.review}"
                  </blockquote>

                  {/* Chef Section with View Product Button */}
                  <div className="flex items-center justify-between">
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
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1
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
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages
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
            Showing {indexOfFirstReview + 1} to {Math.min(indexOfLastReview, reviews.length)} of {reviews.length} reviews
          </p>
        </div>
      </div>

      {/* Signup Banner */}
      <SignupBanner />
    </div>
  );
};

export default GalleryPage;
