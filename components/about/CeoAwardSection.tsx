'use client';

import Image from 'next/image';

const highlights = [
  { value: 'Brand', label: 'Of The Year' },
  { value: 'Rising', label: 'Brand Award' },
  { value: '15+', label: 'Years Leading' },
  { value: '1000+', label: 'Kitchens Served' },
];

const CeoAwardSection = () => {
  return (
    <section className="py-16 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* ── Left: Content ───────────────────────────── */}
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
              <span className="w-8 h-px bg-[#0F4C69]" />
              Leadership & Recognition
              <span className="w-8 h-px bg-[#0F4C69]" />
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">
              A Message from{' '}
              <span className="text-[#E36630]">Our CEO</span>
            </h2>

            <div className="w-16 h-1 bg-[#E36630] rounded-full mb-6" />

            <div className="space-y-4 text-gray-500 text-base leading-relaxed">
              <p>
                At Ambassador Commercial Kitchen Equipment, our journey began in 2005 with a simple
                vision — to build Pakistan&apos;s most trusted name in commercial kitchen equipment
                manufacturing. Today, as the leading manufacturer of premium, Made-in-Pakistan cooking
                ranges, chillers, bakery display units, and complete kitchen solutions, we take pride
                in serving restaurants, cafés, bakeries, and hotels across Pakistan and beyond.
              </p>
              <p>
                Our commitment to quality, innovation, and craftsmanship has earned the trust of chefs
                and hospitality professionals worldwide — from Pakistan to Switzerland, Sri Lanka, Iran,
                the UAE, and beyond. Every product we design reflects our dedication to durability,
                performance, and world-class engineering.
              </p>
              <p>
                As we continue to grow, our mission remains the same: to equip every commercial kitchen
                with reliable, high-performance solutions that help our clients&apos; businesses thrive.
                Thank you for trusting Ambassador — your partner in building better kitchens, one
                solution at a time.
              </p>
              <p className="text-gray-900 font-semibold pt-2">
                — Ali Mehmood
                <br />
                <span className="text-sm font-medium text-[#0F4C69]">
                  Founder &amp; CEO, Ambassador Commercial Kitchen Equipment
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-gray-100">
              {highlights.map((item) => (
                <div key={item.label} className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-[#E36630]">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Image ────────────────────────────── */}
          <div className="relative w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[1536/1460]">
              <Image
                src="/Images/Boss-Picture.png"
                alt="Ambassador CEO receiving the Brand of the Year Award"
                fill
                sizes="(max-width: 1024px) 90vw, 480px"
                className="object-cover object-center"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E36630]" />
            </div>

            <div className="absolute -bottom-5 -left-5 bg-[#0F4C69] text-white rounded-2xl px-6 py-4 shadow-lg hidden md:block">
              <p className="text-lg font-bold leading-tight">Brand of the</p>
              <p className="text-xs text-white/70 mt-1 uppercase tracking-wide">Year Awards</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CeoAwardSection;
