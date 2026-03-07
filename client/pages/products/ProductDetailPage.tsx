'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ProductDetailPage = ({ productId }: { productId: string }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedRating, setSelectedRating] = useState('⭐⭐⭐⭐⭐ 72%');

  // Sample product data
  const product = {
    id: productId,
    title: 'OVENTE Stainless Steel Deep Fryer FDM2201BR',
    price: 15000,
    originalPrice: 18000,
    category: 'Fast Food Equipment',
    subCategory: 'Deep Fryers',
    images: [
      '/Images/home/fast food.avif',
      '/Images/home/hotel.avif', 
      '/Images/home/restaurent.jpg',
      '/Images/home/bakeries.webp'
    ],
    video: '/Images/home/fast food.avif', // placeholder for video
    about: 'Professional-grade deep fryer perfect for commercial kitchens. Features durable stainless steel construction, precise temperature control, and large capacity for high-volume frying. Ideal for restaurants, fast food chains, and food service establishments.',
    specifications: {
      'Model Name': 'FDM2201BR',
      'Brand': 'OVENTE',
      'Material': 'Stainless Steel',
      'Color': 'FDM2201BR - Silver',
      'Product Dimensions': '13.75"D x 8.25"W x 8.25"H',
      'Wattage': '1500 watts',
      'Oil Capacity': '2 Liters',
      'Global Trade Identification Number': '00814667021915',
      'Manufacturer': 'OVENTE',
      'UPC': '814667021915'
    }
  };

  // Sample reviews
  const reviews = [
    {
      id: 1,
      name: 'John Smith',
      rating: 5,
      date: '2024-01-15',
      comment: 'Excellent deep fryer! Perfect for our restaurant. Heats up quickly and maintains temperature consistently.',
      avatar: 'https://via.placeholder.com/48x48/4A90E2/FFFFFF?text=JS'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      rating: 4,
      date: '2024-01-10',
      comment: 'Great quality and easy to clean. The only minor issue is it takes a bit longer to heat up than expected.',
      avatar: 'https://via.placeholder.com/48x48/E94B3C/FFFFFF?text=SJ'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      rating: 5,
      date: '2024-01-05',
      comment: 'Best investment for our fast food business. Very durable and reliable.',
      avatar: 'https://via.placeholder.com/48x48/50C878/FFFFFF?text=MW'
    }
  ];

  const handleAddToCart = () => {
    console.log(`Added ${quantity} of ${product.title} to cart`);
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-orange-500 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-gray-800">{product.title}</span>
          </nav>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Images and Video */}
            <div>
              {/* Main Image/Video Display */}
              <div className="relative h-96 mb-4 rounded-lg overflow-hidden bg-gray-100">
                {selectedImage === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-gray-600">Product Video</p>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={product.images[selectedImage - 1]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}
              </div>
 
              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setSelectedImage(0)}
                  className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === 0 ? 'border-orange-500' : 'border-gray-200'
                  }`}
                >
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </button>
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index + 1)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index + 1 ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right - Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.title}</h1>
              
              {/* Rating */}
              <div className="mb-4">
                <select 
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white cursor-pointer"
                >
                  <option value="⭐⭐⭐⭐⭐ 72%">⭐⭐⭐⭐⭐ 72%</option>
                  <option value="⭐⭐⭐⭐ 18%">⭐⭐⭐⭐ 18%</option>
                  <option value="⭐⭐⭐ 7%">⭐⭐⭐ 7%</option>
                  <option value="⭐⭐ 2%">⭐⭐ 2%</option>
                  <option value="⭐ 1%">⭐ 1%</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Based on 245 reviews</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-orange-500">₹{product.price.toLocaleString()}</span>
                  <span className="text-xl text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                </div>
                <p className="text-green-600 text-sm mt-1">Save ₹{(product.originalPrice - product.price).toLocaleString()}</p>
              </div>

              {/* About the Product */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">About the Product</h3>
                <p className="text-gray-600 leading-relaxed">{product.about}</p>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-none focus:outline-none"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Add to Cart
                </button>
              </div>

              {/* Specifications */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{key}:</span>
                      <span className="text-sm text-gray-800 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
          
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{review.name}</h4>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                      <div className="text-sm">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
