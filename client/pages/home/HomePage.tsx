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
import { useStorefrontCategories } from '@/hooks/useStorefrontCategories';

const INITIAL_ROWS = 4;
const ROWS_PER_STEP = 4;

function useCategoryGridColumns() {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1280) setColumns(4);
      else if (w >= 1024) setColumns(3);
      else if (w >= 640) setColumns(2);
      else setColumns(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return columns;
}

const HomePage = () => {
  const { categories, loading: categoriesLoading } = useStorefrontCategories();
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  const columns = useCategoryGridColumns();

  const visibleCount = Math.min(visibleRows * columns, categories.length);
  const visibleCategories = categories.slice(0, visibleCount);
  const hasMoreCategories = visibleCount < categories.length;
  const canShowLess = visibleRows > INITIAL_ROWS;

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
      <section className="border-t border-gray-200 bg-[#E3E6E6]">
        <div className="container mx-auto px-4 py-8 sm:py-10 md:py-16">
          <div className="mb-8 text-center sm:mb-10 md:mb-12">
            <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F4C69] sm:mb-4 sm:gap-2 sm:text-sm sm:tracking-widest">
              <span className="h-px w-6 bg-[#0F4C69] sm:w-8" />
              What We Offer
              <span className="h-px w-6 bg-[#0F4C69] sm:w-8" />
            </span>
            <h2 className="mb-3 text-2xl font-bold leading-tight text-gray-900 sm:mb-4 sm:text-3xl md:mb-5 md:text-4xl lg:text-5xl">
              Equipment Built for{' '}
              <span className="text-[#E36630]">Every Kitchen</span>
            </h2>
            <p className="mx-auto max-w-2xl px-1 text-sm leading-relaxed text-gray-500 sm:text-base md:text-lg">
              From fast food counters to hospital canteens — explore our full range of commercial kitchen equipment
              in Pakistan, tailored to every industry.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {categoriesLoading ? (
              Array.from({ length: INITIAL_ROWS * columns }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50 animate-pulse sm:rounded-xl"
                >
                  <div className="aspect-square w-full bg-gray-200" />
                  <div className="space-y-2 p-3 sm:p-4">
                    <div className="h-4 w-3/4 rounded bg-gray-200 sm:h-5" />
                    <div className="h-3 w-1/3 rounded bg-gray-200 sm:h-4" />
                  </div>
                </div>
              ))
            ) : categories.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-gray-500">
                No categories to show yet.
              </p>
            ) : (
              visibleCategories.map((category) => (
                <CategoryCard
                  key={category._id}
                  title={category.title}
                  image={category.image || undefined}
                  category={category.title}
                  categorySlug={category.slug}
                />
              ))
            )}
          </div>

          {!categoriesLoading && categories.length > INITIAL_ROWS * columns && (
            <div className="mt-8 flex flex-col items-stretch justify-center gap-2.5 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              {hasMoreCategories && (
                <button
                  type="button"
                  onClick={handleShowMore}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0F4C69] px-6 py-2.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-[#0d3d55] sm:w-auto sm:px-8 sm:py-3 sm:text-sm"
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#E36630] bg-white px-6 py-2.5 text-xs font-semibold text-[#E36630] transition-colors hover:bg-[#E36630] hover:text-white sm:w-auto sm:px-8 sm:py-3 sm:text-sm"
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
