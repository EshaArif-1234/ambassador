'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProductRatingDropdown from '@/components/products/ProductRatingDropdown';
import CartPopup from '@/components/products/CartPopup';
import { useCart } from '@/contexts/CartContext';

const ProductDetailPage = ({ productId }: { productId: string }) => {
  const [selectedImage, setSelectedImage] = useState(1); // Start with first image
  const [quantity, setQuantity] = useState(1);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const { addToCart } = useCart();

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
      '/Images/home/bakeries.webp',
      '/Images/home/fast food.avif',
      '/Images/home/hotel.avif'
    ],
    videos: [
      '/images/3054022 how to setup a commercial kitchen.mp4',
      '/images/1456609 That\'s How A Cake Video Is Shoot 😻 .mp4'
    ],
    about: 'Professional-grade deep fryer perfect for commercial kitchens. Features durable stainless steel construction, precise temperature control, and large capacity for high-volume frying. Ideal for restaurants, fast food chains, and food service establishments.',
    specifications: {
      'Product Code': 'FDM2201BR-001',
      'Burners': '2',
      'Energy Type': 'Electric',
      'BTU (Power)': '1500W',
      'Size': '13.75"D x 8.25"W x 8.25"H',
      'Capacity (Ltr)': '2 Liters',
      'Material': 'Stainless Steel'
    },
    delivery: {
      'Delivery Time': '3-5 business days',
      'Shipping Cost': 'Free shipping on orders over ₹10,000'
    }
  };

  // Sample reviews
  const reviews = [
    {
      id: 1,
      name: 'John Smith',
      rating: 5,
      date: '2024-01-15',
      comment: 'Excellent deep fryer! Perfect for our restaurant. Heats up quickly and maintains temperature consistently.'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      rating: 4,
      date: '2024-01-10',
      comment: 'Great quality and easy to clean. The only minor issue is it takes a bit longer to heat up than expected.'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      rating: 5,
      date: '2024-01-05',
      comment: 'Best investment for our fast food business. Very durable and reliable.'
    }
  ];

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: quantity,
      image: product.images[0],
      productCode: product.specifications['Product Code']
    };
    addToCart(cartItem);
    setShowCartPopup(true);
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
                {selectedImage <= 3 ? (
                  <Image
                    src={product.images[selectedImage - 1]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <video
                    src={product.videos[selectedImage - 4]}
                    controls
                    className="w-full h-full"
                    width="560"
                    height="315"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
 
              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-5 gap-2">
                {/* First 3 Images */}
                {product.images.slice(0, 3).map((image, index) => (
                  <button
                    key={`image-${index}`}
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
                
                {/* 2 Videos */}
                {product.videos.map((video, index) => (
                  <button
                    key={`video-${index}`}
                    onClick={() => setSelectedImage(index + 4)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index + 4 ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      Video {index + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right - Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.title}</h1>
              
              {/* Rating */}
              <div className="mb-4">
                <ProductRatingDropdown 
                  averageRating={4.5}
                  totalReviews={245}
                  productName={product.title}
                />
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
                    className="w-16 text-center border-none focus:outline-none text-gray-800 font-semibold"
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

              {/* Delivery Notice */}
              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Delivery Notice</h4>
                      <p className="text-sm text-blue-800">Online delivery is currently available only within Lahore.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="customer-reviews" className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
          
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  {/* User Avatar with Initials */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center bg-[#101827]">
                      <span className="text-white font-bold text-lg">
                        {review.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{review.name}</h4>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                      {/* Star Rating - Same as Product Page */}
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-5 h-5 ${
                              i < Math.floor(review.rating) 
                                ? 'text-orange-500 fill-current' 
                                : 'text-gray-300 fill-current'
                            }`} 
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
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

      {/* Cart Popup */}
      <CartPopup 
        show={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        product={product}
        quantity={quantity}
      />
    </div>
  );
};

export default ProductDetailPage;
