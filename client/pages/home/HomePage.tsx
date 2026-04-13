'use client';

import ImageSlider from '../../../components/home page/ImageSlider';
import CategoryCard from '../../../components/home page/CategoryCard';
import StatsSection from '../../../components/home page/StatsSection';
import WhyChooseUs from '../../../components/home page/WhyChooseUs';
import SignupSection from '../../../components/home page/SignupSection';
import CTASection from '../../../components/home page/CTASection';

const categories = [
  { name: 'Stainless Steel Kitchen',          image: '/Images/card.png',                          category: 'Stainless Steel Kitchen' },
  { name: 'Hotel',                             image: '/Images/home/hotel.avif',                   category: 'Hotel Kitchen Equipment' },
  { name: 'Restaurant',                        image: '/Images/home/restaurent.jpg',               category: 'Restaurant Equipment' },
  { name: 'Fast Food',                         image: '/Images/home/fast food.avif',               category: 'Fast Food Equipment' },
  { name: 'Bakery',                            image: '/Images/home/bakeries.webp',                category: 'Bakery Equipment' },
  { name: 'Cafes',                             image: '/Images/home/cafes.png',                    category: 'Café Equipment' },
  { name: 'Banquets',                          image: '/Images/home/Banquets.jpg',                 category: 'Banquet Equipment' },
  { name: 'Super Markets',                     image: '/Images/home/Super Markets.jpg',            category: 'Supermarket Equipment' },
  { name: 'Hospital Kitchen',                  image: '/Images/home/Hospital Kitchen.jpg',         category: 'Hospital Kitchen' },
  { name: 'Mess Kitchen',                      image: '/Images/home/mess kitchen.jfif',            category: 'Mess Kitchen (Large Catering)' },
  { name: 'University Kitchen',                image: '/Images/home/university kitchen.jpg',       category: 'University / Institutional Kitchen' },
  { name: 'Ambassador Engineering Products',   image: '/Images/home/engeniering products.jfif',   category: 'Ambassador Engineering Products' },
  { name: 'Imported Items',                    image: '/Images/home/Imported Items.jfif',          category: 'Imported Items' },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* ── 1. Hero Banner Slider ─────────────────────────── */}
      <ImageSlider />

      {/* ── 2. Stats / Trust Bar ─────────────────────────── */}
      <StatsSection />

      {/* ── 3. Product Categories ────────────────────────── */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-orange-100 text-[#E36630] text-sm font-semibold rounded-full mb-3 tracking-wide uppercase">
              What We Offer
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Categories
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Explore our complete range of premium commercial kitchen equipment for every industry and scale.
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
      </section>

      {/* ── 4. Featured Products ─────────────────────────── */}

      {/* ── 5. Why Choose Us ─────────────────────────────── */}
      <WhyChooseUs />

      {/* ── 6. Sign Up Section ───────────────────────────── */}
      <SignupSection />

      {/* ── 7. CTA ───────────────────────────────────────── */}
      <CTASection />

    </div>
  );
};

export default HomePage;
