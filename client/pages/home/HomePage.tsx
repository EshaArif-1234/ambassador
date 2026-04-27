'use client';

import { useState, useEffect } from 'react';
import ImageSlider from '../../../components/home page/ImageSlider';
import CategoryCard from '../../../components/home page/CategoryCard';
import StatsSection from '../../../components/home page/StatsSection';
import WhyChooseUs from '../../../components/home page/WhyChooseUs';
import SignupSection from '../../../components/home page/SignupSection';
import CTASection from '../../../components/home page/CTASection';
import ClientLogosSlider from '../../../components/about/ClientLogosSlider';

interface StorefrontCategory {
  _id: string;
  title: string;
  slug: string;
  image: string;
}

const HomePage = () => {
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (!cancelled && data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ── 1. Hero Banner Slider ─────────────────────────── */}
      <ImageSlider />
      <ClientLogosSlider />

      {/* ── 2. Stats / Trust Bar ─────────────────────────── */}

      {/* ── 3. Product Categories ────────────────────────── */}
      <section className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 py-10 md:py-16">
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
            {categoriesLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-100 bg-gray-50 overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : categories.length === 0 ? (
              <p className="col-span-full text-center text-sm text-gray-500 py-8">
                No categories to show yet.
              </p>
            ) : (
              categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  title={category.title}
                  image={category.image || undefined}
                  category={category.title}
                />
              ))
            )}
          </div>
        </div>
      </section>
      <StatsSection />

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
