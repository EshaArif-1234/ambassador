'use client';

import Image from 'next/image';

/**
 * Client logo slider — edit this list to swap images or reorder.
 * Paths are under `/public` (leading `/` in URL).
 * First half of the list → top row (scrolls left); second half → bottom row (scrolls right).
 */
const CLIENT_LOGO_IMAGES: string[] = [
  '/Images/SizeUpdated/Avari-Xpress.png',
  '/Images/SizeUpdated/BABA-BAKERS.png',
  '/Images/SizeUpdated/Baked.png',
  '/Images/SizeUpdated/Bamboo-Union.png',
  '/Images/SizeUpdated/Brim.png',
  '/Images/SizeUpdated/Burger-Lab-Logo.png',
  '/Images/SizeUpdated/Cafe-Aylanto.png',
  '/Images/SizeUpdated/Cafe-Brie.png',
  '/Images/SizeUpdated/CarreFour.png',
  '/Images/SizeUpdated/Cheezious-Logo.png',
  '/Images/SizeUpdated/Cheezious.png',
  '/Images/SizeUpdated/CN.png',
  '/Images/SizeUpdated/CoThm-College.png',
  '/Images/SizeUpdated/Crave-Kitchen.png',
  '/Images/SizeUpdated/DAHLIA.png',
  '/Images/SizeUpdated/DAN-And-DAN.png',
  '/Images/SizeUpdated/Dominos.png',
  '/Images/SizeUpdated/DOUBLESHOT.png',
  '/Images/SizeUpdated/Drip.png',
  '/Images/SizeUpdated/English-Tea-House.png',
  '/Images/SizeUpdated/FRED.png',
  '/Images/SizeUpdated/Fuoco.png',
  '/Images/SizeUpdated/Howdy.png',
  '/Images/SizeUpdated/Jalal-Sons.png',
  '/Images/SizeUpdated/Johnny-Jugnu.png',
  '/Images/SizeUpdated/Khan-baba.png',
  '/Images/SizeUpdated/KITE.png',
  '/Images/SizeUpdated/LUMS-UNI.png',
  '/Images/SizeUpdated/MANDARIN-ORIENTAL.png',
  '/Images/SizeUpdated/MarriottHotel.png',
  '/Images/SizeUpdated/Nisa-Sultan.png',
  '/Images/SizeUpdated/Pc-Hotel.png',
  '/Images/SizeUpdated/Poly-MATH.png',
  '/Images/SizeUpdated/Pop-Up-Kitchen.png',
  '/Images/SizeUpdated/Rina-Kitchen.png',
  '/Images/SizeUpdated/Salt-Logo.png',
  '/Images/SizeUpdated/Sarpinos.png',
  '/Images/SizeUpdated/Sashas.png',
  '/Images/SizeUpdated/Serena-Hotel.png',
  '/Images/SizeUpdated/Steak-Away.png',
  '/Images/SizeUpdated/Subway.png',
  '/Images/SizeUpdated/Suleman-Logo.png',
  '/Images/SizeUpdated/Sumo.png',
  '/Images/SizeUpdated/Tariq-Sweets.png',
  '/Images/SizeUpdated/The-Cakery.png',
  '/Images/SizeUpdated/The-Coffee-Bean.png',
  '/Images/SizeUpdated/Third-Culture.png',
  '/Images/SizeUpdated/TLT.png',

];

const logos = CLIENT_LOGO_IMAGES.map((logo, i) => ({
  id: String(i + 1),
  logo,
  name: `Client ${i + 1}`,
}));

const half = Math.ceil(logos.length / 2);
const row1 = logos.slice(0, half);
const row2 = logos.slice(half);

const SEGMENT_GAP  = 'gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7';
/** Matches gap so the seam between duplicated segments has the same spacing as between logos; keeps -50% loop exact. */
const SEGMENT_TAIL = 'pr-3 sm:pr-4 md:pr-5 lg:pr-6 xl:pr-7';

const FADE_LEFT  = 'pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#E3E6E6] to-transparent sm:w-12 md:w-16 lg:w-24';
const FADE_RIGHT = 'pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#E3E6E6] to-transparent sm:w-12 md:w-16 lg:w-24';

interface LogoCardProps {
  logo: { id: string; logo: string; name: string };
}

const LogoCard = ({ logo }: LogoCardProps) => (
  <div className="group h-14 w-14 shrink-0 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 xl:h-28 xl:w-28">
    <div className="relative h-full w-full overflow-hidden rounded-full border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-[#E36630] hover:shadow-md hover:-translate-y-1 sm:border-2">
      <div className="absolute inset-1.5 sm:inset-2 md:inset-2.5 lg:inset-3 xl:inset-4">
        <div className="relative h-full w-full">
          <Image
            src={logo.logo}
            alt={logo.name}
            fill
            sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, (max-width: 1024px) 80px, 112px"
            className="object-contain transition-transform duration-300 group-hover:scale-110"
            draggable={false}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/80x80/E36630/ffffff?text=${logo.id}`;
            }}
          />
        </div>
      </div>
    </div>
  </div>
);

function LogoSegment({
  items,
  prefix,
  ariaHidden,
}: {
  items: typeof logos;
  prefix: string;
  ariaHidden?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 flex-nowrap items-center ${SEGMENT_GAP} ${SEGMENT_TAIL}`}
      aria-hidden={ariaHidden}
    >
      {items.map((logo) => (
        <LogoCard key={`${prefix}-${logo.id}`} logo={logo} />
      ))}
    </div>
  );
}

const ClientLogosSlider = () => {
  return (
    <>
      <style>{`
        @keyframes marquee-left {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-right {
          from { transform: translate3d(-50%, 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
        .marquee-inner {
          display: flex;
          width: max-content;
          flex-wrap: nowrap;
          align-items: center;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .marquee-inner-left {
          animation: marquee-left 55s linear infinite;
        }
        .marquee-inner-right {
          animation: marquee-right 55s linear infinite;
        }
        @media (min-width: 640px) {
          .marquee-inner-left,
          .marquee-inner-right {
            animation-duration: 50s;
          }
        }
        @media (min-width: 768px) {
          .marquee-inner-left,
          .marquee-inner-right {
            animation-duration: 45s;
          }
        }
        .marquee-track:hover .marquee-inner {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-inner-left,
          .marquee-inner-right {
            animation: none;
            transform: none;
          }
        }
      `}</style>

      <section className="border-t border-gray-200 bg-[#E3E6E6] py-8 sm:py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center sm:mb-10 md:mb-12">
            <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F4C69] sm:mb-4 sm:gap-2 sm:text-sm sm:tracking-widest">
              <span className="h-px w-6 bg-[#0F4C69] sm:w-8" />
              Trusted By
              <span className="h-px w-6 bg-[#0F4C69] sm:w-8" />
            </span>
            <h2 className="mb-3 text-2xl font-bold leading-tight text-gray-900 sm:mb-4 sm:text-3xl md:text-4xl">
              Businesses That <span className="text-[#E36630]">Rely on Us</span>
            </h2>
            <p className="mx-auto max-w-2xl px-1 text-sm leading-relaxed text-gray-500 sm:text-base md:text-lg">
              From five-star hotels to fast-food chains — over 1,200 businesses across Pakistan trust Ambassador
              for their commercial kitchen needs.
            </p>
            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-[#E36630] sm:mt-5 sm:w-16" />
          </div>
        </div>

        <div className="overflow-x-hidden overflow-y-visible">
          {/* Row 1 — scrolls left */}
          <div className="marquee-track relative mb-4 sm:mb-5 md:mb-6">
            <div className={FADE_LEFT} aria-hidden />
            <div className={FADE_RIGHT} aria-hidden />

            <div className="marquee-inner marquee-inner-left">
              <LogoSegment items={row1} prefix="r1a" />
              <LogoSegment items={row1} prefix="r1b" ariaHidden />
            </div>
          </div>

          {/* Row 2 — scrolls right */}
          <div className="marquee-track relative">
            <div className={FADE_LEFT} aria-hidden />
            <div className={FADE_RIGHT} aria-hidden />

            <div className="marquee-inner marquee-inner-right">
              <LogoSegment items={row2} prefix="r2a" />
              <LogoSegment items={row2} prefix="r2b" ariaHidden />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ClientLogosSlider;
