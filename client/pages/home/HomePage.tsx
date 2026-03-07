'use client';

import ImageSlider from '../../../components/home page/ImageSlider';
import CategoryCard from '../../../components/home page/CategoryCard';

const HomePage = () => {
  const categories = [
    { name: 'Stainless Steel Kitchen', image: 'https://via.placeholder.com/400x300/C0C0C0/FFFFFF?text=Stainless+Steel', category: 'Stainless Steel Kitchen' },
    { name: 'Hotel', image: 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Hotel+Kitchen', category: 'Hotel Kitchen Equipment' },
    { name: 'Restaurant', image: 'https://via.placeholder.com/400x300/4169E1/FFFFFF?text=Restaurant', category: 'Restaurant Equipment' },
    { name: 'Fast Food', image: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Fast+Food', category: 'Fast Food Equipment' },
    { name: 'Bakery', image: 'https://via.placeholder.com/400x300/D2691E/FFFFFF?text=Bakery', category: 'Bakery Equipment' },
    { name: 'Cafes', image: 'https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Cafes', category: 'Café Equipment' },
    { name: 'Banquets', image: 'https://via.placeholder.com/400x300/7B3CC4/FFFFFF?text=Banquets', category: 'Banquet Equipment' },
    { name: 'Super Markets', image: 'https://via.placeholder.com/400x300/00897B/FFFFFF?text=Super+Markets', category: 'Supermarket Equipment' },
    { name: 'Hospital Kitchen', image: 'https://via.placeholder.com/400x300/6C757D/FFFFFF?text=Hospital+Kitchen', category: 'Hospital Kitchen' },
    { name: 'Mess Kitchen', image: 'https://via.placeholder.com/400x300/4A5568/FFFFFF?text=Mess+Kitchen', category: 'Mess Kitchen (Large Catering)' },
    { name: 'University Kitchen', image: 'https://via.placeholder.com/400x300/2563EB/FFFFFF?text=University+Kitchen', category: 'University / Institutional Kitchen' },
    { name: 'Ambassador Engineering Products', image: 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Engineering', category: 'Ambassador Engineering Products' },
    { name: 'Imported Items', image: 'https://via.placeholder.com/400x300/9333EA/FFFFFF?text=Imported+Items', category: 'Imported Items' }
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
      
      <div className="container mx-auto px-4">
        <ImageSlider />

        <div className="py-12">
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
                title={category.name}
                image={category.image}
                category={category.category}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
