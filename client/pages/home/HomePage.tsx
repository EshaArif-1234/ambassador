'use client';

import { useState, useEffect } from 'react';
import ImageSlider from '../../../components/home page/ImageSlider';
import SaleSection from '../../../components/home page/SaleSection';
import CategoryCard from '../../../components/home page/CategoryCard';
import StatsSection from '../../../components/home page/StatsSection';
import WhyChooseUs from '../../../components/home page/WhyChooseUs';
import SignupSection from '../../../components/home page/SignupSection';
import CTASection from '../../../components/home page/CTASection';
import ClientLogosSlider from '../../../components/about/ClientLogosSlider';
import CustomKitchenHighlight from '../../../components/home page/CustomKitchenHighlight';

interface StorefrontCategory {
  _id: string;
  title: string;
  slug: string;
  image: string;
}

const INITIAL_ROWS = 4;
const ROWS_PER_STEP = 4;

function useCategoryGridColumns() {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1280) setColumns(4);
      else if (w >= 1024) setColumns(3);
      else if (w >= 768) setColumns(2);
      else setColumns(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return columns;
}

const HomePage = () => {
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  const columns = useCategoryGridColumns();

  const visibleCount = Math.min(visibleRows * columns, categories.length);
  const visibleCategories = categories.slice(0, visibleCount);
  const hasMoreCategories = visibleCount < categories.length;
  const canShowLess = visibleRows > INITIAL_ROWS;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' });
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

  const handleShowMore = () => {
    const totalRows = Math.ceil(categories.length / columns);
    setVisibleRows((rows) => Math.min(rows + ROWS_PER_STEP, totalRows));
  };

  const handleShowLess = () => {
    setVisibleRows(INITIAL_ROWS);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── 1. Hero Banner Slider ─────────────────────────── */}
      <ImageSlider />

      {/* ── 2. On Sale Products ───────────────────────────── */}
      <SaleSection />

      <ClientLogosSlider />
      <CustomKitchenHighlight />

      {/* ── 2. Stats / Trust Bar ─────────────────────────── */}

      {/* ── 3. Product Categories ────────────────────────── */}
      <section className="bg-[#E3E6E6] border-t border-gray-200">
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
              Array.from({ length: INITIAL_ROWS * columns }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-100 bg-gray-50 overflow-hidden animate-pulse"
                >
                  <div className="h-56 sm:h-64 md:h-72 bg-gray-200" />
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
              visibleCategories.map((category) => (
                <CategoryCard
                  key={category._id}
                  title={category.title}
                  image={category.image || undefined}
                  category={category.title}
                />
              ))
            )}
          </div>

          {!categoriesLoading && categories.length > INITIAL_ROWS * columns && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {hasMoreCategories && (
                <button
                  type="button"
                  onClick={handleShowMore}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0F4C69] px-8 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0d3d55]"
                >
                  Show More
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
              {canShowLess && (
                <button
                  type="button"
                  onClick={handleShowLess}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#E36630] bg-white px-8 py-3 text-sm font-semibold text-[#E36630] transition-colors hover:bg-[#E36630] hover:text-white"
                >
                  Show Less
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}
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
