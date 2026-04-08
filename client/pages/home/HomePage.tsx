'use client';

import ImageSlider from '../../../components/home page/ImageSlider';
import CategoryCard from '../../../components/home page/CategoryCard';

const HomePage = () => {
  const categories = [
    { name: 'Stainless Steel Kitchen', image: '/Images/home/stainless-steal.webp', category: 'Stainless Steel Kitchen' },
    { name: 'Hotel', image: '/Images/home/hotel.avif', category: 'Hotel Kitchen Equipment' },
    { name: 'Restaurant', image: '/Images/home/restaurent.jpg', category: 'Restaurant Equipment' },
    { name: 'Fast Food', image: '/Images/home/fast food.avif', category: 'Fast Food Equipment' },
    { name: 'Bakery', image: '/Images/home/bakeries.webp', category: 'Bakery Equipment' },
    { name: 'Cafes', image: '/Images/home/cafes.png', category: 'Café Equipment' },
    { name: 'Banquets', image: '/Images/home/Banquets.jpg', category: 'Banquet Equipment' },
    { name: 'Super Markets', image: '/Images/home/Super Markets.jpg', category: 'Supermarket Equipment' },
    { name: 'Hospital Kitchen', image: '/Images/home/Hospital Kitchen.jpg', category: 'Hospital Kitchen' },
    { name: 'Mess Kitchen', image: '/Images/home/mess kitchen.jfif', category: 'Mess Kitchen (Large Catering)' },
    { name: 'University Kitchen', image: '/Images/home/university kitchen.jpg', category: 'University / Institutional Kitchen' },
    { name: 'Ambassador Engineering Products', image: '/Images/home/engeniering products.jfif', category: 'Ambassador Engineering Products' },
    { name: 'Imported Items', image: '/Images/home/Imported Items.jfif', category: 'Imported Items' }
  ];

  const handleSeeMore = (category: string) => {
    console.log(`See more for: ${category}`);
  };

  return (
    <div className="min-h-screen bg-white">
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
      <div className="container mx-auto px-4">
       

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
              >
                <div className="relative h-48 overflow-hidden rounded-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </CategoryCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
