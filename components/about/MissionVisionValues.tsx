'use client';

const values = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Quality First',
    description: 'We never compromise on material, craftsmanship, or performance. Every piece of equipment we supply meets international food-grade and safety standards.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Customer Focus',
    description: 'We build long-term partnerships, not one-off transactions. Our team listens, advises, and stays with you from enquiry to installation and beyond.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Innovation',
    description: 'We continuously source the latest equipment and technologies so your kitchen stays ahead — energy-efficient, smarter, and more productive.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    title: 'Integrity',
    description: 'Transparent pricing, honest timelines, and straightforward advice — we say what we mean and deliver what we promise.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Nation-wide Reach',
    description: 'From Karachi to Khyber, our distribution and service network ensures every client gets equal support regardless of location.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'After-Sales Care',
    description: 'Our in-house service team provides maintenance, repairs, and spare parts support — keeping your kitchen running at peak efficiency every day.',
  },
];

const MissionVisionValues = () => {
  return (
    <section className="py-20 border-t border-gray-200">
      <div className="container mx-auto px-4">

        {/* ── Section label ── */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
            <span className="w-8 h-px bg-[#0F4C69]" />
            What Drives Us
            <span className="w-8 h-px bg-[#0F4C69]" />
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Our Mission, Vision &{' '}
            <span className="text-[#E36630]">Core Values</span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Everything we do is guided by a clear purpose — to empower Pakistan&apos;s food service industry with world-class kitchen solutions.
          </p>
          <div className="mt-5 w-16 h-1 bg-[#E36630] mx-auto rounded-full" />
        </div>

        {/* ── Mission & Vision cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

          {/* Mission */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0F4C69] p-8 text-white shadow-lg">
            {/* decorative circle */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#E36630] mb-6 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              <p className="text-[#E36630] text-xs font-bold uppercase tracking-widest mb-2">Our Mission</p>
              <h3 className="text-2xl font-bold mb-4 leading-snug">
                Equipping Pakistan&apos;s Kitchens for Excellence
              </h3>
              <p className="text-white/75 text-sm leading-relaxed">
                To provide every restaurant, hotel, bakery, and food business in Pakistan with premium commercial kitchen equipment — delivered with expert guidance, honest pricing, and reliable after-sales support — so they can focus on what matters most: great food and great service.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="relative overflow-hidden rounded-2xl bg-[#E36630] p-8 text-white shadow-lg">
            {/* decorative circle */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 mb-6 shadow-md border border-white/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Our Vision</p>
              <h3 className="text-2xl font-bold mb-4 leading-snug">
                Pakistan&apos;s #1 Commercial Kitchen Partner
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                To become the most trusted name in commercial kitchen equipment across South Asia — recognised not only for the products we supply but for the expertise, integrity, and lifelong partnerships we build with every client we serve.
              </p>
            </div>
          </div>

        </div>

        {/* ── Values grid ── */}
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-gray-900">
            The Values Behind Every Decision
          </h3>
          <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
            Six principles that shape how we work, how we talk to our customers, and how we grow.
          </p>
        </div>

        
        <div className="w-full h-full">
          <img src="/Images/value2.png" alt="Values" className="w-full h-full object-cover" />
        </div>

      </div>
    </section>
  );
};

export default MissionVisionValues;
