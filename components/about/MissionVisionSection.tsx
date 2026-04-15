'use client';

import Image from 'next/image';

const logos = Array.from({ length: 44 }, (_, i) => ({
  id: String(i + 1),
  logo: `/Images/Logo Final/logo${i + 1}.webp`,
  name: `Client ${i + 1}`,
}));

const MissionVisionSection = () => {
  return (
    <section className="bg-white py-16 border-t border-gray-100">
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

        {/* ── Logo Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5">
          {logos.map((logo) => (
            <div key={logo.id} className="group flex items-center justify-center">
              <div className="relative w-full aspect-square rounded-full border-2 border-gray-100 bg-white shadow-sm hover:border-[#E36630] hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <Image
                  src={logo.logo}
                  alt={logo.name}
                  fill
                  className="object-contain p-3 transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/80x80/E36630/ffffff?text=${logo.id}`;
                  }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default MissionVisionSection;
