'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SubCategoryCard from '../../../components/Subcategory/SubCategoryCard';

const SubCategoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  const categories = [
    {
      name: 'Stainless Steel Kitchen',
      subCategories: [
        { name: 'Stainless Steel Work Tables', image: '/Images/home/stainless-steal.webp', productCount: 15 },
        { name: 'Stainless Steel Cabinets', image: '/Images/home/stainless-steal.webp', productCount: 12 },
        { name: 'Stainless Steel Shelving', image: '/Images/home/stainless-steal.webp', productCount: 8 },
        { name: 'Stainless Steel Trolleys', image: '/Images/home/stainless-steal.webp', productCount: 10 },
        { name: 'Stainless Steel Sinks', image: '/Images/home/stainless-steal.webp', productCount: 20 },
        { name: 'Stainless Steel Wall Shelves', image: '/Images/home/stainless-steal.webp', productCount: 6 },
        { name: 'Stainless Steel Exhaust Hoods', image: '/Images/home/stainless-steal.webp', productCount: 9 },
        { name: 'Stainless Steel Storage Racks', image: '/Images/home/stainless-steal.webp', productCount: 11 }
      ]
    },
    {
      name: 'Hotel Kitchen Equipment',
      subCategories: [
        { name: 'Commercial Cooking Ranges', image: '/Images/home/hotel.avif', productCount: 18 },
        { name: 'Industrial Ovens', image: '/Images/home/hotel.avif', productCount: 14 },
        { name: 'Food Preparation Tables', image: '/Images/home/hotel.avif', productCount: 12 },
        { name: 'Hot Holding Equipment', image: '/Images/home/hotel.avif', productCount: 8 },
        { name: 'Food Warmers', image: '/Images/home/hotel.avif', productCount: 16 },
        { name: 'Commercial Dishwashers', image: '/Images/home/hotel.avif', productCount: 10 },
        { name: 'Refrigeration Units', image: '/Images/home/hotel.avif', productCount: 22 },
        { name: 'Buffet Display Equipment', image: '/Images/home/hotel.avif', productCount: 7 }
      ]
    },
    {
      name: 'Restaurant Equipment',
      subCategories: [
        { name: 'Gas Ranges', image: '/Images/home/restaurent.jpg', productCount: 25 },
        { name: 'Griddles & Charbroilers', image: '/Images/home/restaurent.jpg', productCount: 15 },
        { name: 'Deep Fryers', image: '/Images/home/restaurent.jpg', productCount: 20 },
        { name: 'Pizza Ovens', image: '/Images/home/restaurent.jpg', productCount: 12 },
        { name: 'Food Prep Equipment', image: '/Images/home/restaurent.jpg', productCount: 30 },
        { name: 'Food Warmers', image: '/Images/home/restaurent.jpg', productCount: 18 },
        { name: 'Serving Counters', image: '/Images/home/restaurent.jpg', productCount: 9 },
        { name: 'Exhaust & Ventilation Systems', image: '/Images/home/restaurent.jpg', productCount: 11 }
      ]
    },
    {
      name: 'Fast Food Equipment',
      subCategories: [
        { name: 'Deep Fryers', image: '/Images/home/fast food.avif', productCount: 16 },
        { name: 'Burger Grills', image: '/Images/home/fast food.avif', productCount: 14 },
        { name: 'Hot Dog Rollers', image: '/Images/home/fast food.avif', productCount: 8 },
        { name: 'Shawarma Machines', image: '/Images/home/fast food.avif', productCount: 10 },
        { name: 'Sandwich Grills', image: '/Images/home/fast food.avif', productCount: 12 },
        { name: 'French Fries Warmers', image: '/Images/home/fast food.avif', productCount: 6 },
        { name: 'Beverage Dispensers', image: '/Images/home/fast food.avif', productCount: 15 },
        { name: 'Display Warmers', image: '/Images/home/fast food.avif', productCount: 9 }
      ]
    },
    {
      name: 'Bakery Equipment',
      subCategories: [
        { name: 'Deck Ovens', image: '/Images/home/bakeries.webp', productCount: 22 },
        { name: 'Convection Ovens', image: '/Images/home/bakeries.webp', productCount: 18 },
        { name: 'Dough Mixers', image: '/Images/home/bakeries.webp', productCount: 25 },
        { name: 'Dough Sheeters', image: '/Images/home/bakeries.webp', productCount: 12 },
        { name: 'Proofing Cabinets', image: '/Images/home/bakeries.webp', productCount: 14 },
        { name: 'Bread Slicers', image: '/Images/home/bakeries.webp', productCount: 8 },
        { name: 'Cake Display Counters', image: '/Images/home/bakeries.webp', productCount: 10 },
        { name: 'Bakery Work Tables', image: '/Images/home/bakeries.webp', productCount: 16 }
      ]
    },
    {
      name: 'Café Equipment',
      subCategories: [
        { name: 'Espresso Coffee Machines', image: '/Images/home/cafes.png', productCount: 30 },
        { name: 'Coffee Grinders', image: '/Images/home/cafes.png', productCount: 15 },
        { name: 'Juice Machines', image: '/Images/home/cafes.png', productCount: 12 },
        { name: 'Ice Makers', image: '/Images/home/cafes.png', productCount: 20 },
        { name: 'Blenders', image: '/Images/home/cafes.png', productCount: 18 },
        { name: 'Refrigerated Cake Displays', image: '/Images/home/cafes.png', productCount: 8 },
        { name: 'Beverage Dispensers', image: '/Images/home/cafes.png', productCount: 14 },
        { name: 'Bar Counters', image: '/Images/home/cafes.png', productCount: 6 }
      ]
    },
    {
      name: 'Banquet Equipment',
      subCategories: [
        { name: 'Buffet Stations', image: '/Images/home/Banquets.jpg', productCount: 12 },
        { name: 'Chafing Dishes', image: '/Images/home/Banquets.jpg', productCount: 25 },
        { name: 'Food Warmers', image: '/Images/home/Banquets.jpg', productCount: 18 },
        { name: 'Banquet Serving Trolleys', image: '/Images/home/Banquets.jpg', productCount: 10 },
        { name: 'Plate Warmers', image: '/Images/home/Banquets.jpg', productCount: 8 },
        { name: 'Catering Equipment', image: '/Images/home/Banquets.jpg', productCount: 20 },
        { name: 'Beverage Dispensers', image: '/Images/home/Banquets.jpg', productCount: 15 },
        { name: 'Portable Cooking Stations', image: '/Images/home/Banquets.jpg', productCount: 6 }
      ]
    },
    {
      name: 'Supermarket Equipment',
      subCategories: [
        { name: 'Display Refrigerators', image: '/Images/home/Super Markets.jpg', productCount: 28 },
        { name: 'Freezer Cabinets', image: '/Images/home/Super Markets.jpg', productCount: 22 },
        { name: 'Deli Display Counters', image: '/Images/home/Super Markets.jpg', productCount: 15 },
        { name: 'Meat Display Units', image: '/Images/home/Super Markets.jpg', productCount: 12 },
        { name: 'Vegetable Display Racks', image: '/Images/home/Super Markets.jpg', productCount: 18 },
        { name: 'Shopping Trolleys', image: '/Images/home/Super Markets.jpg', productCount: 25 },
        { name: 'Checkout Counters', image: '/Images/home/Super Markets.jpg', productCount: 8 },
        { name: 'Storage Shelving', image: '/Images/home/Super Markets.jpg', productCount: 20 }
      ]
    },
    {
      name: 'Hospital Kitchen',
      subCategories: [
        { name: 'Food Preparation Tables', image: '/Images/home/Hospital Kitchen.jpg', productCount: 14 },
        { name: 'Steam Cooking Equipment', image: '/Images/home/Hospital Kitchen.jpg', productCount: 10 },
        { name: 'Food Distribution Trolleys', image: '/Images/home/Hospital Kitchen.jpg', productCount: 16 },
        { name: 'Tray Delivery Systems', image: '/Images/home/Hospital Kitchen.jpg', productCount: 8 },
        { name: 'Industrial Dishwashers', image: '/Images/home/Hospital Kitchen.jpg', productCount: 12 },
        { name: 'Storage Cabinets', image: '/Images/home/Hospital Kitchen.jpg', productCount: 18 },
        { name: 'Refrigeration Units', image: '/Images/home/Hospital Kitchen.jpg', productCount: 20 },
        { name: 'Hygiene Stations', image: '/Images/home/Hospital Kitchen.jpg', productCount: 6 }
      ]
    },
    {
      name: 'Mess Kitchen (Large Catering)',
      subCategories: [
        { name: 'Bulk Cooking Pots', image: '/Images/home/mess kitchen.jfif', productCount: 15 },
        { name: 'Industrial Gas Burners', image: '/Images/home/mess kitchen.jfif', productCount: 12 },
        { name: 'Rice Boilers', image: '/Images/home/mess kitchen.jfif', productCount: 18 },
        { name: 'Chapati Machines', image: '/Images/home/mess kitchen.jfif', productCount: 8 },
        { name: 'Food Storage Containers', image: '/Images/home/mess kitchen.jfif', productCount: 25 },
        { name: 'Serving Counters', image: '/Images/home/mess kitchen.jfif', productCount: 10 },
        { name: 'Food Transport Trolleys', image: '/Images/home/mess kitchen.jfif', productCount: 14 },
        { name: 'Washing Stations', image: '/Images/home/mess kitchen.jfif', productCount: 9 }
      ]
    },
    {
      name: 'University / Institutional Kitchen',
      subCategories: [
        { name: 'Bulk Cooking Equipment', image: '/Images/home/university kitchen.jpg', productCount: 20 },
        { name: 'Industrial Dishwashers', image: '/Images/home/university kitchen.jpg', productCount: 15 },
        { name: 'Food Serving Lines', image: '/Images/home/university kitchen.jpg', productCount: 12 },
        { name: 'Storage Racks', image: '/Images/home/university kitchen.jpg', productCount: 18 },
        { name: 'Refrigeration Systems', image: '/Images/home/university kitchen.jpg', productCount: 22 },
        { name: 'Tray Conveyors', image: '/Images/home/university kitchen.jpg', productCount: 8 },
        { name: 'Cooking Ranges', image: '/Images/home/university kitchen.jpg', productCount: 16 },
        { name: 'Food Distribution Trolleys', image: '/Images/home/university kitchen.jpg', productCount: 10 }
      ]
    },
    {
      name: 'Ambassador Engineering Products',
      subCategories: [
        { name: 'Custom Stainless Steel Fabrication', image: '/Images/home/engeniering products.jfif', productCount: 25 },
        { name: 'Industrial Kitchen Equipment', image: '/Images/home/engeniering products.jfif', productCount: 30 },
        { name: 'Commercial Cooking Equipment', image: '/Images/home/engeniering products.jfif', productCount: 28 },
        { name: 'Exhaust & Ventilation Systems', image: '/Images/home/engeniering products.jfif', productCount: 15 },
        { name: 'Food Preparation Stations', image: '/Images/home/engeniering products.jfif', productCount: 20 },
        { name: 'Storage Systems', image: '/Images/home/engeniering products.jfif', productCount: 18 },
        { name: 'Custom Kitchen Solutions', image: '/Images/home/engeniering products.jfif', productCount: 12 }
      ]
    },
    {
      name: 'Imported Items',
      subCategories: [
        { name: 'Imported Ovens', image: '/Images/home/Imported Items.jfif', productCount: 15 },
        { name: 'Imported Coffee Machines', image: '/Images/home/Imported Items.jfif', productCount: 20 },
        { name: 'Imported Refrigeration Equipment', image: '/Images/home/Imported Items.jfif', productCount: 18 },
        { name: 'Imported Bakery Machines', image: '/Images/home/Imported Items.jfif', productCount: 12 },
        { name: 'Imported Cooking Equipment', image: '/Images/home/Imported Items.jfif', productCount: 25 },
        { name: 'Imported Ice Makers', image: '/Images/home/Imported Items.jfif', productCount: 14 },
        { name: 'Imported Mixers & Blenders', image: '/Images/home/Imported Items.jfif', productCount: 16 },
        { name: 'Imported Display Counters', image: '/Images/home/Imported Items.jfif', productCount: 10 }
      ]
    }
  ];

  const handleSeeMore = (categoryName: string, subCategoryName: string) => {
    console.log(`View products for: ${categoryName} > ${subCategoryName}`);
    setSelectedCategory(`${categoryName} > ${subCategoryName}`);
    setActiveCategory(categoryName);
  };

  const handleCategoryClick = (categoryName: string) => {
    if (activeCategory === categoryName) {
      setActiveCategory(null); // Show all categories if clicked again
    } else {
      setActiveCategory(categoryName); // Show only this category
    }
    setSelectedCategory(null); // Clear subcategory selection
  };

  // Filter categories based on active selection
  const displayedCategories = activeCategory 
    ? categories.filter(cat => cat.name === activeCategory)
    : categories;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Our Sub Categories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of equipment organized by categories and subcategories
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !activeCategory 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.name
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {selectedCategory && (
          <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-orange-800 font-semibold">Currently Viewing:</h3>
                <p className="text-orange-600">{selectedCategory}</p>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-orange-600 hover:text-orange-800 font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="space-y-16">
          {displayedCategories.map((category) => (
            <div key={category.name} className="space-y-8">
              {/* Category Header */}
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-800">{category.name}</h2>
                <span className="text-gray-500 text-sm">
                  ({category.subCategories.length} subcategories)
                </span>
              </div>

              {/* Sub Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.subCategories.map((subCategory) => (
                  <SubCategoryCard
                    key={subCategory.name}
                    title={subCategory.name}
                    image={subCategory.image}
                    productCount={subCategory.productCount}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubCategoriesPage;
