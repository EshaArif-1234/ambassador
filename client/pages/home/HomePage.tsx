'use client';

import ImageSlider from '../../../components/home page/ImageSlider';
import CategoryCard from '../../../components/home page/CategoryCard';

const HomePage = () => {
  const categories = [
    'Stainless Steel Kitchen',
    'Hotel',
    'Restaurant',
    'Fast Food',
    'Bakery',
    'Cafes',
    'Banquets',
    'Super Markets',
    'Hospital Kitchen',
    'Mess Kitchen',
    'University Kitchen',
    'Ambassador Engineering Products',
    'Imported Items'
  ];

  const handleSeeMore = (category: string) => {
    console.log(`See more for: ${category}`);
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
      
      <ImageSlider />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Our Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of premium kitchen equipment and solutions for every culinary need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category}
              image={`/api/placeholder/300/200`}
              onSeeMore={() => handleSeeMore(category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
