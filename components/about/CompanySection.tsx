'use client';

import Image from 'next/image';

const highlights = [
  { value: '15+', label: 'Years of Experience' },
  { value: '500+', label: 'Products Supplied' },
  { value: '1200+', label: 'Happy Clients' },
  { value: '50+', label: 'Cities Covered' },
];

const CompanySection = () => {
  return (
    <section className="bg-white py-16 border-t border-gray-100">
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* ── Left: Image ───────────────────────────────── */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/Images/about/chef.jpg"
                alt="Ambassador commercial kitchen"
                width={600}
                height={700}
                className="w-full object-cover"
              />
              {/* Orange accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E36630]" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 -right-5 bg-[#0F4C69] text-white rounded-2xl px-6 py-4 shadow-lg hidden md:block">
              <p className="text-3xl font-bold leading-none">15+</p>
              <p className="text-xs text-white/70 mt-1 uppercase tracking-wide">Years Trusted</p>
            </div>
          </div>

          {/* ── Right: Content ────────────────────────────── */}
          <div>
            {/* Section label */}
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
              <span className="w-8 h-px bg-[#0F4C69]" />
              Who We Are
              <span className="w-8 h-px bg-[#0F4C69]" />
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">
              Pakistan&apos;s Trusted Partner in{' '}
              <span className="text-[#E36630]">Commercial Kitchen Equipment</span>
            </h2>

            <div className="w-16 h-1 bg-[#E36630] rounded-full mb-6" />

            <div className="space-y-4 text-gray-500 text-base leading-relaxed">
              <p>
                Ambassadors is a trusted provider of commercial kitchen equipment and professional food service solutions in Pakistan. With more than 15 years of industry experience, we specialize in supplying high-quality equipment sourced from leading international brands.
              </p>
              <p>
                Our company supports restaurants, hotels, bakeries, cafés, supermarkets, and institutional kitchens with reliable, efficient equipment designed to meet modern culinary and operational demands — from cooking ranges and refrigeration systems to stainless steel workstations.
              </p>
              <p>
                At Ambassadors, our goal is to help businesses build fully functional, durable kitchen environments, backed by dependable service and practical solutions that keep operations running at the highest standard.
              </p>
            </div>

            {/* Mini stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-gray-100">
              {highlights.map((item) => (
                <div key={item.label} className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-[#E36630]">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CompanySection;
