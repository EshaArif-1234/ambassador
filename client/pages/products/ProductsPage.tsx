'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProductRatings from '@/components/ProductRatings';
import ProductRatingDropdown from '@/components/ProductRatingDropdown';

interface Product {
  id: number;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  image: string;
  featured?: boolean;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRatings, setSelectedRatings] = useState<{ [key: number]: string }>({});
  const [features, setFeatures] = useState({
    inStock: false,
    freeShipping: false,
    onSale: false,
    newArrival: false,
    bestSeller: false,
    premiumQuality: false
  });
  const [brands, setBrands] = useState({
    ambassador: false,
    imported: false,
    premiumPlus: false
  });
  const [availability, setAvailability] = useState({
    readyToShip: false,
    customOrder: false
  });
  const searchParams = useSearchParams();

  // Sample products data
  const allProducts: Product[] = [
    // Stainless Steel Kitchen Products
    { id: 1, name: 'Stainless Steel Work Table 6ft', category: 'Stainless Steel Kitchen', subCategory: 'Stainless Steel Work Tables', price: 15000, image: '/Images/home/stainless-steal.webp', featured: true },
    { id: 2, name: 'Stainless Steel Cabinet 4 Door', category: 'Stainless Steel Kitchen', subCategory: 'Stainless Steel Cabinets', price: 25000, image: '/Images/home/stainless-steal.webp' },
    { id: 3, name: 'Stainless Steel Wall Shelf', category: 'Stainless Steel Kitchen', subCategory: 'Stainless Steel Wall Shelves', price: 8000, image: '/Images/home/stainless-steal.webp' },
    { id: 4, name: 'Stainless Steel Sink 2 Compartment', category: 'Stainless Steel Kitchen', subCategory: 'Stainless Steel Sinks', price: 12000, image: '/Images/home/stainless-steal.webp' },
    
    // Hotel Kitchen Equipment Products
    { id: 5, name: 'Commercial Cooking Range 6 Burner', category: 'Hotel Kitchen Equipment', subCategory: 'Commercial Cooking Ranges', price: 35000, image: '/Images/home/hotel.avif', featured: true },
    { id: 6, name: 'Industrial Convection Oven', category: 'Hotel Kitchen Equipment', subCategory: 'Industrial Ovens', price: 45000, image: '/Images/home/hotel.avif' },
    { id: 7, name: 'Food Preparation Table', category: 'Hotel Kitchen Equipment', subCategory: 'Food Preparation Tables', price: 18000, image: '/Images/home/hotel.avif' },
    { id: 8, name: 'Hot Holding Equipment', category: 'Hotel Kitchen Equipment', subCategory: 'Hot Holding Equipment', price: 22000, image: '/Images/home/hotel.avif' },
    
    // Restaurant Equipment Products
    { id: 9, name: 'Gas Range 4 Burner', category: 'Restaurant Equipment', subCategory: 'Gas Ranges', price: 28000, image: '/Images/home/restaurent.jpg', featured: true },
    { id: 10, name: 'Griddle Plate 24 inch', category: 'Restaurant Equipment', subCategory: 'Griddles & Charbroilers', price: 15000, image: '/Images/home/restaurent.jpg' },
    { id: 11, name: 'Deep Fryer 10L', category: 'Restaurant Equipment', subCategory: 'Deep Fryers', price: 32000, image: '/Images/home/restaurent.jpg' },
    { id: 12, name: 'Pizza Oven Deck', category: 'Restaurant Equipment', subCategory: 'Pizza Ovens', price: 38000, image: '/Images/home/restaurent.jpg' },
    
    // Bakery Equipment Products
    { id: 13, name: 'Deck Oven 4 Tray', category: 'Bakery Equipment', subCategory: 'Deck Ovens', price: 42000, image: '/Images/home/bakeries.webp', featured: true },
    { id: 14, name: 'Dough Mixer 30L', category: 'Bakery Equipment', subCategory: 'Dough Mixers', price: 35000, image: '/Images/home/bakeries.webp' },
    { id: 15, name: 'Proofing Cabinet', category: 'Bakery Equipment', subCategory: 'Proofing Cabinets', price: 25000, image: '/Images/home/bakeries.webp' },
    { id: 16, name: 'Bread Slicer', category: 'Bakery Equipment', subCategory: 'Bread Slicers', price: 18000, image: '/Images/home/bakeries.webp' },
    
    // Fast Food Equipment Products
    { id: 17, name: 'Burger Grill', category: 'Fast Food Equipment', subCategory: 'Burger Grills', price: 22000, image: '/Images/home/fast food.avif', featured: true },
    { id: 18, name: 'Shawarma Machine', category: 'Fast Food Equipment', subCategory: 'Shawarma Machines', price: 28000, image: '/Images/home/fast food.avif' },
    { id: 19, name: 'French Fries Warmer', category: 'Fast Food Equipment', subCategory: 'French Fries Warmers', price: 12000, image: '/Images/home/fast food.avif' },
    { id: 20, name: 'Beverage Dispenser', category: 'Fast Food Equipment', subCategory: 'Beverage Dispensers', price: 15000, image: '/Images/home/fast food.avif' }
  ];

  const categories = [
    'All Categories',
    'Stainless Steel Kitchen',
    'Hotel Kitchen Equipment',
    'Restaurant Equipment',
    'Fast Food Equipment',
    'Bakery Equipment',
    'Café Equipment',
    'Banquet Equipment',
    'Supermarket Equipment',
    'Hospital Kitchen',
    'Mess Kitchen (Large Catering)',
    'University / Institutional Kitchen',
    'Ambassador Engineering Products',
    'Imported Items'
  ];

  const subCategories = [
    'All Subcategories',
    'Stainless Steel Work Tables',
    'Stainless Steel Cabinets',
    'Stainless Steel Shelving',
    'Stainless Steel Trolleys',
    'Stainless Steel Sinks',
    'Stainless Steel Wall Shelves',
    'Stainless Steel Exhaust Hoods',
    'Commercial Cooking Ranges',
    'Industrial Ovens',
    'Food Preparation Tables',
    'Hot Holding Equipment',
    'Gas Ranges',
    'Griddles & Charbroilers',
    'Deep Fryers',
    'Pizza Ovens',
    'Deck Ovens',
    'Dough Mixers',
    'Proofing Cabinets'
  ];

  useEffect(() => {
    setProducts(allProducts);
    setFilteredProducts(allProducts);
    
    // Handle URL parameters
    const categoryParam = searchParams.get('category');
    const subCategoryParam = searchParams.get('subcategory');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (subCategoryParam) {
      setSelectedSubCategory(subCategoryParam);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubCategory && selectedSubCategory !== 'All Subcategories') {
      filtered = filtered.filter(product => product.subCategory === selectedSubCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedSubCategory, priceRange, sortBy, searchTerm, features, brands, availability]);

  const handleRatingChange = (productId: number, rating: string) => {
    setSelectedRatings(prev => ({ ...prev, [productId]: rating }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFeatures(prev => ({ ...prev, [feature]: checked }));
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    setBrands(prev => ({ ...prev, [brand]: checked }));
  };

  const handleAvailabilityChange = (availability: string, checked: boolean) => {
    setAvailability(prev => ({ ...prev, [availability]: checked }));
  };

  const clearFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedSubCategory('All Subcategories');
    setPriceRange({ min: 0, max: 50000 });
    setSortBy('name');
    setSearchTerm('');
    setFeatures({
      inStock: false,
      freeShipping: false,
      onSale: false,
      newArrival: false,
      bestSeller: false,
      premiumQuality: false
    });
    setBrands({
      ambassador: false,
      imported: false,
      premiumPlus: false
    });
    setAvailability({
      readyToShip: false,
      customOrder: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Products</h1>
          <p className="text-lg text-gray-600">Browse our extensive collection of kitchen equipment</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Filters</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-gray-400"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mr-2 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subcategory Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Subcategory</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {subCategories.map(subCategory => (
                    <label key={subCategory} className="flex items-center">
                      <input
                        type="radio"
                        name="subcategory"
                        value={subCategory}
                        checked={selectedSubCategory === subCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="mr-2 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{subCategory}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Features</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={features.inStock}
                      onChange={(e) => handleFeatureChange('inStock', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">In Stock</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={features.freeShipping}
                      onChange={(e) => handleFeatureChange('freeShipping', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">Free Shipping</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={features.onSale}
                      onChange={(e) => handleFeatureChange('onSale', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">On Sale</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={features.newArrival}
                      onChange={(e) => handleFeatureChange('newArrival', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">New Arrival</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={features.bestSeller}
                      onChange={(e) => handleFeatureChange('bestSeller', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">Best Seller</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={features.premiumQuality}
                      onChange={(e) => handleFeatureChange('premiumQuality', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">Premium Quality</span>
                  </label>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Brand</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={brands.ambassador}
                      onChange={(e) => handleBrandChange('ambassador', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">Ambassador</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={brands.imported}
                      onChange={(e) => handleBrandChange('imported', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">Imported</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={brands.premiumPlus}
                      onChange={(e) => handleBrandChange('premiumPlus', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">Premium Plus</span>
                  </label>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Availability</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={availability.readyToShip}
                      onChange={(e) => handleAvailabilityChange('readyToShip', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">Ready to Ship</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={availability.customOrder}
                      onChange={(e) => handleAvailabilityChange('customOrder', e.target.checked)}
                      className="mr-2 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">Custom Order</span>
                  </label>
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">Min: ₹{priceRange.min.toLocaleString()}</label>
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="1000"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Max: ₹{priceRange.max.toLocaleString()}</label>
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="1000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Right Content - Products */}
          <div className="flex-1">
            {/* Top Bar with Sort and Results Count */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-gray-600">
                  Showing <span className="font-semibold">{filteredProducts.length}</span> of{' '}
                  <span className="font-semibold">{products.length}</span> products
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="name">Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col sm:flex-row">
                      {/* Left - Image */}
                      <div className="relative h-48 sm:h-auto sm:w-64 flex-shrink-0">
                        <Link href={`/products/${product.id}`} className="block h-full">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, 256px"
                            unoptimized
                          />
                        </Link>
                        {product.featured && (
                          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                            Featured
                          </div>
                        )}
                      </div>
                      
                      {/* Right - Content */}
                      <div className="flex-1 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          {/* Product Info */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                            
                            {/* Product Ratings */}
                            <div className="mb-4">
                              <ProductRatingDropdown 
                                averageRating={4.5}
                                totalReviews={245}
                                productName={product.name}
                              />
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4">
                              <div>
                                <span className="text-xl font-bold text-orange-500">₹{product.price.toLocaleString()}</span>
                                <div className="text-xs text-gray-500 line-through">₹{Math.floor(product.price * 1.2).toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Add to Cart Button */}
                          <div className="flex items-end">
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No products found</div>
                <p className="text-gray-400">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
