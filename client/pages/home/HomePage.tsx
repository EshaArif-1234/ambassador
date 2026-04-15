'use client';

import ImageSlider from '../../../components/home page/ImageSlider';
import CategoryCard from '../../../components/home page/CategoryCard';
import StatsSection from '../../../components/home page/StatsSection';
import WhyChooseUs from '../../../components/home page/WhyChooseUs';
import SignupSection from '../../../components/home page/SignupSection';
import CTASection from '../../../components/home page/CTASection';

const categories = [
  { name: 'Stainless Steel Kitchen',          image: '/Images/card.png',                          category: 'Stainless Steel Kitchen' },
  { name: 'Hotel',                             image: '/Images/Banquets.jpg',                   category: 'Hotel Kitchen Equipment' },
  { name: 'Restaurant',                        image: '/Images/Restaurant-Card.png',               category: 'Restaurant Equipment' },
  { name: 'Fast Food',                         image: '/Images/Fast-Food-Card-Banner.jpg',               category: 'Fast Food Equipment' },
  { name: 'Bakery',                            image: '/Images/Bakery-Card-banner.jpg',                category: 'Bakery Equipment' },
  { name: 'Cafes',                             image: '/Images/Cafes-Card-banner.jpg',                    category: 'Café Equipment' },
  { name: 'Banquets',                          image: '/Images/Banquets.jpg',                 category: 'Banquet Equipment' },
  { name: 'Super Markets',                     image: '/Images/Super-market.jpg',            category: 'Supermarket Equipment' },
  { name: 'Hospital Kitchen',                  image: '/Images/home/Hospital Kitchen.jpg',         category: 'Hospital Kitchen' },
  { name: 'Mess Kitchen',                      image: '/Images/Mess-Card.png',            category: 'Mess Kitchen (Large Catering)' },
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
      <section className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
              <span className="w-8 h-px bg-[#0F4C69]" />
              What We Offer
              <span className="w-8 h-px bg-[#0F4C69]" />
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
              Equipment Built for<br className="hidden sm:block" />{' '}
              <span className="text-[#E36630]">Every Kitchen</span>
            </h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              From fast food counters to hospital canteens — explore our full range of commercial kitchen solutions tailored to your industry.
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
