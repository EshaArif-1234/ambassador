'use client';

import { useState } from 'react';
import Link from 'next/link';
import SignupBanner from '@/components/common/signup-banner';

interface Review {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  review: string;
  featuredProduct: {
    id: string;
    name: string;
    image: string;
    category: string;
    price: number;
  };
  videoUrl?: string;
  socialLink?: string;
}

const GalleryPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;

  const reviews: Review[] = [
    {
      id: '1',
      name: 'Chef Sanjeev Kapoor',
      role: 'Celebrity Chef',
      avatar: '/Images/gallery/chef-sanjeev.jpg',
      rating: 5,
      review: 'Ambassador\'s commercial kitchen equipment has transformed my restaurant operations. The quality and durability are unmatched!',
      featuredProduct: {
        id: 'prod-001',
        name: 'Commercial Gas Range',
        image: '/Images/products/gas-range.jpg',
        category: 'Cooking Equipment',
        price: 45000
      },
      videoUrl: 'https://www.youtube.com/watch?v=MQgXy4cYnsw',
      socialLink: 'https://www.instagram.com/chefsanjeevkapoor/'
    },
    {
      id: '2',
      name: 'Ranveer Brar',
      role: 'Food YouTuber',
      avatar: '/Images/gallery/ranveer-brar.jpg',
      rating: 5,
      review: 'I use Ambassador equipment in my kitchen studio. The precision and reliability help me create perfect content every time.',
      featuredProduct: {
        id: 'prod-002',
        name: 'Professional Oven',
        image: '/Images/products/professional-oven.jpg',
        category: 'Bakery Equipment',
        price: 78000
      },
      videoUrl: 'https://www.youtube.com/watch?v=rJrKZ6JAexI',
      socialLink: 'https://www.youtube.com/@ranveerbrar'
    },
    {
      id: '3',
      name: 'Kunal Kapur',
      role: 'Chef & Entrepreneur',
      avatar: '/Images/gallery/kunal-kapur.jpg',
      rating: 4,
      review: 'Great value for money equipment. Has helped scale my catering business effectively.',
      featuredProduct: {
        id: 'prod-003',
        name: 'Industrial Mixer',
        image: '/Images/products/industrial-mixer.jpg',
        category: 'Food Processing',
        price: 65000
      },
      videoUrl: 'https://www.youtube.com/shorts/HzRnJuGO30E',
      socialLink: 'https://www.instagram.com/kunalkapur/'
    },
    {
      id: '4',
      name: 'Vikas Khanna',
      role: 'Michelin Star Chef',
      avatar: '/Images/gallery/vikas-khanna.jpg',
      rating: 5,
      review: 'Ambassador understands the needs of professional chefs. Their equipment is designed with perfection in mind.',
      featuredProduct: {
        id: 'prod-004',
        name: 'Premium Refrigeration Unit',
        image: '/Images/products/refrigeration-unit.jpg',
        category: 'Refrigeration',
        price: 120000
      },
      videoUrl: 'https://www.youtube.com/shorts/UtiL6m9UPrA',
      socialLink: 'https://www.instagram.com/chefvikaskhanna/'
    },
    {
      id: '5',
      name: 'Sarah Todd',
      role: 'Chef & TV Personality',
      avatar: '/Images/gallery/sarah-todd.jpg',
      rating: 4,
      review: 'Excellent equipment that meets international standards. Perfect for fusion cuisine restaurants.',
      featuredProduct: {
        id: 'prod-005',
        name: 'Multi-Cooker',
        image: '/Images/products/multi-cooker.jpg',
        category: 'Cooking Equipment',
        price: 35000
      },
      videoUrl: 'https://www.youtube.com/shorts/2c4LO14HNzc',
      socialLink: 'https://www.instagram.com/chefsarahtodd/'
    },
    {
      id: '6',
      name: 'Gagan Anand',
      role: 'Food YouTuber',
      avatar: '/Images/gallery/gagan-anand.jpg',
      rating: 5,
      review: 'The best investment for my food channel. Ambassador equipment delivers consistent results every time.',
      featuredProduct: {
        id: 'prod-006',
        name: 'Food Processor',
        image: '/Images/products/food-processor.jpg',
        category: 'Food Processing',
        price: 28000
      },
      videoUrl: 'https://www.youtube.com/shorts/vZaYXGl3vwk',
      socialLink: 'https://www.youtube.com/@gagananand'
    },
    {
      id: '7',
      name: 'Kavita Patel',
      role: 'Restaurant Owner',
      avatar: '/Images/gallery/kavita-patel.jpg',
      rating: 5,
      review: 'Ambassador equipment has been a game-changer for my restaurant business. The reliability and performance are outstanding.',
      featuredProduct: {
        id: 'prod-007',
        name: 'Commercial Grill',
        image: '/Images/products/commercial-grill.jpg',
        category: 'Cooking Equipment',
        price: 55000
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      socialLink: 'https://www.instagram.com/kavitapatel/'
    },
    {
      id: '8',
      name: 'Rohit Singh',
      role: 'Food Blogger',
      avatar: '/Images/gallery/rohit-singh.jpg',
      rating: 4,
      review: 'Perfect equipment for content creation. Ambassador products help me showcase recipes beautifully.',
      featuredProduct: {
        id: 'prod-008',
        name: 'Digital Display Fridge',
        image: '/Images/products/digital-fridge.jpg',
        category: 'Refrigeration',
        price: 95000
      },
      videoUrl: 'https://www.youtube.com/shorts/abc123def456',
      socialLink: 'https://www.youtube.com/@rohitsingh'
    },
    {
      id: '9',
      name: 'Priya Sharma',
      role: 'Catering Manager',
      avatar: '/Images/gallery/priya-sharma.jpg',
      rating: 5,
      review: 'Outstanding quality and service. Ambassador equipment has helped us serve large events efficiently.',
      featuredProduct: {
        id: 'prod-009',
        name: 'Buffet Server',
        image: '/Images/products/buffet-server.jpg',
        category: 'Serving Equipment',
        price: 42000
      },
      videoUrl: 'https://www.youtube.com/watch?v=xyz789uvw012',
      socialLink: 'https://www.instagram.com/priyasharma/'
    },
    {
      id: '10',
      name: 'Amit Kumar',
      role: 'Hotel Chef',
      avatar: '/Images/gallery/amit-kumar.jpg',
      rating: 4,
      review: 'Professional-grade equipment that delivers consistent results. Highly recommended for commercial kitchens.',
      featuredProduct: {
        id: 'prod-010',
        name: 'Industrial Dishwasher',
        image: '/Images/products/industrial-dishwasher.jpg',
        category: 'Cleaning Equipment',
        price: 68000
      },
      videoUrl: 'https://www.youtube.com/shorts/def345ghi678',
      socialLink: 'https://www.linkedin.com/in/amitkumar/'
    },
    {
      id: '11',
      name: 'Neha Gupta',
      role: 'Bakery Owner',
      avatar: '/Images/gallery/nehagupta.jpg',
      rating: 5,
      review: 'Ambassador bakery equipment is exceptional. It has helped us increase production while maintaining quality.',
      featuredProduct: {
        id: 'prod-011',
        name: 'Convection Oven',
        image: '/Images/products/convection-oven.jpg',
        category: 'Bakery Equipment',
        price: 72000
      },
      videoUrl: 'https://www.youtube.com/watch?v=ghi678jkl901',
      socialLink: 'https://www.instagram.com/nehagupta/'
    },
    {
      id: '12',
      name: 'Raj Malhotra',
      role: 'Food Consultant',
      avatar: '/Images/gallery/raj-malhotra.jpg',
      rating: 5,
      review: 'I recommend Ambassador equipment to all my clients. The quality and support are unmatched.',
      featuredProduct: {
        id: 'prod-012',
        name: 'Steamer Unit',
        image: '/Images/products/steamer-unit.jpg',
        category: 'Cooking Equipment',
        price: 38000
      },
      videoUrl: 'https://www.youtube.com/shorts/jkl901mno234',
      socialLink: 'https://www.twitter.com/rajmalhotra'
    }
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
            src="/Images/gallery dark.jpg"
            alt="Gallery & Reviews Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/1920x400/E36630/ffffff?text=Gallery+Reviews`;
            }}
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
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
                      src={review.avatar}
                      alt={review.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/E36630/ffffff?text=${encodeURIComponent(review.name)}`;
                      }}
                    />
                  )}
                </div>

                {/* Review Content */}
                <div className="p-6">
                  {/* <div className="flex items-center mb-3">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">({review.rating}.0)</span>
                  </div> */}
                  
                  <blockquote className="text-gray-700 mb-4 italic">
                    "{review.review}"
                  </blockquote>
                  
                  {/* <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <p className="text-sm text-gray-500">{review.role}</p>
                    </div>
                    {review.socialLink && (
                      <a
                        href={review.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-600"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                  </div> */}

                  {/* Featured Product */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">Featured Product</p>
                    <Link href={`/products/${review.featuredProduct.id}`} className="group">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
                        <img
                          src={review.featuredProduct.image}
                          alt={review.featuredProduct.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/64x64/E36630/ffffff?text=${encodeURIComponent(review.featuredProduct.name.substring(0, 3))}`;
                          }}
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                            {review.featuredProduct.name}
                          </h5>
                          <p className="text-sm text-gray-500">{review.featuredProduct.category}</p>
                          <p className="text-sm font-semibold text-orange-500">₹{review.featuredProduct.price.toLocaleString()}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 1
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
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === pageNumber
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === totalPages
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
