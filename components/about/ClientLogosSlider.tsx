'use client';

import Image from 'next/image';

const logos = Array.from({ length: 44 }, (_, i) => ({
  id: String(i + 1),
  logo: `/Images/Logo Final/logo${i + 1}.webp`,
  name: `Client ${i + 1}`,
}));

const row1 = logos.slice(0, 22);
const row2 = logos.slice(22, 44);

interface LogoCardProps {
  logo: { id: string; logo: string; name: string };
}

const LogoCard = ({ logo }: LogoCardProps) => (
  <div className="group flex-shrink-0 w-20 h-20 mx-3">
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

      <section className="bg-[#FAFAFA] py-32 border-t border-gray-100 overflow-hidden">
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
              <LogoCard key={`r1-${i}`} logo={logo} />
            ))}
          </div>
        </div>

        {/* ── Row 2 — scrolls right ─────────────────────── */}
        <div className="marquee-track relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none" />

          <div className="flex marquee-right">
            {[...row2, ...row2].map((logo, i) => (
              <LogoCard key={`r2-${i}`} logo={logo} />
            ))}
          </div>
        </div>

      </section>
    </>
  );
};

export default ClientLogosSlider;
