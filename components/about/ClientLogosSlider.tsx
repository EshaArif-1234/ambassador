'use client';

import Image from 'next/image';

/**
 * Client logo slider — edit this list to swap images or reorder.
 * Paths are under `/public` (leading `/` in URL).
 * First half of the list → top row (scrolls left); second half → bottom row (scrolls right).
 */
const CLIENT_LOGO_IMAGES: string[] = [
  '/Images/Logo Final/logo1.webp',
  '/Images/Logo Final/logo2.webp',
  '/Images/Logo Final/logo3.webp',
  '/Images/Logo Final/logo4.webp',
  '/Images/Logo Final/logo5.webp',
  '/Images/Logo Final/logo6.webp',
  '/Images/slider-images-new/logo-7.png',
  '/Images/slider-images-new/logo-8.png',
  '/Images/slider-images-new/logo-9.png',
  '/Images/Logo Final/logo10.webp',
  '/Images/slider-images-new/logo-11.png',
  '/Images/Logo Final/logo12.webp',
  '/Images/Logo Final/logo13.webp',
  '/Images/Logo Final/logo14.webp',
  '/Images/Logo Final/logo15.webp',
  '/Images/Logo Final/logo16.webp',
  '/Images/Logo Final/logo17.webp',
  '/Images/Logo Final/logo18.webp',
  '/Images/Logo Final/logo19.webp',
  '/Images/Logo Final/logo20.webp',
  '/Images/Logo Final/logo21.webp',
  '/Images/Logo Final/logo22.webp',
  '/Images/Logo Final/logo23.webp',
  '/Images/Logo Final/logo24.webp',
  '/Images/Logo Final/logo25.webp',
  '/Images/Logo Final/logo26.webp',
  '/Images/Logo Final/logo27.webp',
  '/Images/Logo Final/logo28.webp',
  '/Images/Logo Final/logo29.webp',
  '/Images/Logo Final/logo30.webp',
  '/Images/Logo Final/logo31.webp',
  '/Images/Logo Final/logo32.webp',
  '/Images/Logo Final/logo33.webp',
  '/Images/Logo Final/logo34.webp',
  '/Images/Logo Final/logo35.webp',
  '/Images/Logo Final/logo36.webp',
  '/Images/Logo Final/logo37.webp',
  '/Images/Logo Final/logo38.webp',
  '/Images/Logo Final/logo39.webp',
  '/Images/Logo Final/logo40.webp',
  '/Images/Logo Final/logo41.webp',
  '/Images/Logo Final/logo42.webp',
  '/Images/Logo Final/logo43.webp',
  '/Images/Logo Final/logo44.webp',
];

const logos = CLIENT_LOGO_IMAGES.map((logo, i) => ({
  id: String(i + 1),
  logo,
  name: `Client ${i + 1}`,
}));

const half = Math.ceil(logos.length / 2);
const row1 = logos.slice(0, half);
const row2 = logos.slice(half);

interface LogoCardProps {
  logo: { id: string; logo: string; name: string };
}

const LogoCard = ({ logo }: LogoCardProps) => (
  <div className="group flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 mx-2 sm:mx-3">
    <div className="relative w-full h-full rounded-full border-2 border-gray-100 bg-white shadow-sm hover:border-[#E36630] hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <Image
        src={logo.logo}
        alt={logo.name}
        fill
        className="object-contain transition-transform duration-300 group-hover:scale-110"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://placehold.co/80x80/E36630/ffffff?text=${logo.id}`;
        }}
      />
    </div>
  </div>
);

const ClientLogosSlider = () => {
  return (
    <>
      <style>{`
        @keyframes scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-left {
          animation: scroll-left 30s linear infinite;
        }
        .marquee-right {
          animation: scroll-right 30s linear infinite;
        }
        .marquee-track:hover .marquee-left,
        .marquee-track:hover .marquee-right {
          animation-play-state: paused;
        }
      `}</style>

      <section className="bg-[#FAFAFA] py-10 md:py-16 border-t border-gray-100 overflow-hidden">
        <div className="container mx-auto px-4">

          {/* ── Header ───────────────────────────────────── */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
              <span className="w-8 h-px bg-[#0F4C69]" />
              Trusted By
              <span className="w-8 h-px bg-[#0F4C69]" />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Businesses That{' '}
              <span className="text-[#E36630]">Rely on Us</span>
            </h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              From five-star hotels to fast-food chains — over 1,200 businesses across Pakistan trust Ambassador for their commercial kitchen needs.
            </p>
            <div className="mt-5 w-16 h-1 bg-[#E36630] mx-auto rounded-full" />
          </div>

        </div>

        {/* ── Row 1 — scrolls left ──────────────────────── */}
        <div className="marquee-track relative mb-6">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none" />

          <div className="flex marquee-left">
            {[...row1, ...row1].map((logo, i) => (
              <LogoCard key={`r1-${i}-${logo.id}`} logo={logo} />
            ))}
          </div>
        </div>

        {/* ── Row 2 — scrolls right ─────────────────────── */}
        <div className="marquee-track relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none" />

          <div className="flex marquee-right">
            {[...row2, ...row2].map((logo, i) => (
              <LogoCard key={`r2-${i}-${logo.id}`} logo={logo} />
            ))}
          </div>
        </div>

      </section>
    </>
  );
};

export default ClientLogosSlider;
