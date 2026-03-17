'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  const [selectedCategory, setSelectedCategory] = useState('all');

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
    }
  ];

  const categories = [
    { id: 'all', name: 'All Reviews' },
    { id: 'chefs', name: 'Celebrity Chefs' },
    { id: 'youtubers', name: 'Food YouTubers' },
    { id: 'entrepreneurs', name: 'Entrepreneurs' }
  ];

  const filteredReviews = reviews.filter(review => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'chefs') return review.role.includes('Chef');
    if (selectedCategory === 'youtubers') return review.role.includes('YouTuber');
    if (selectedCategory === 'entrepreneurs') return review.role.includes('Entrepreneur');
    return true;
  });

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
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Gallery & Reviews
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              See what top chefs, YouTubers, and celebrities say about Ambassador kitchen equipment
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white shadow-sm sticky top-28 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReviews.map(review => (
            <div key={review.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Video Section */}
              {review.videoUrl ? (
                <div className="relative aspect-video bg-gray-900">
                  <iframe
                    src={`https://www.youtube.com/embed/${review.videoUrl.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}`}
                    title={`${review.name} Review`}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=E36630&color=fff&size=400`;
                    }}
                  />
                </div>
              )}

              {/* Review Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  "{review.review}"
                </p>

                {/* Featured Product */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Featured Product</h4>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={review.featuredProduct.image}
                        alt={review.featuredProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/80x80/E36630/ffffff?text=${encodeURIComponent(review.featuredProduct.name.substring(0, 10))}`;
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800">{review.featuredProduct.name}</h5>
                      <p className="text-sm text-gray-600 mb-2">{review.featuredProduct.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-orange-500">
                          ₹{review.featuredProduct.price.toLocaleString()}
                        </span>
                        <Link
                          href={`/products/${review.featuredProduct.id}`}
                          className="inline-flex items-center px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                        >
                          View Product
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9V7a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
