const reasons = [
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
    title: 'Premium Quality',
    description: 'Food-grade stainless steel manufacturing meeting international standards for commercial kitchen equipment.',
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    title: 'Nationwide Delivery',
    description: 'Professional delivery and installation across all major cities in Pakistan — Karachi, Lahore, Islamabad & beyond.',
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
    title: 'Custom Solutions',
    description: 'Fully tailored kitchen layouts designed and fabricated to your exact space, capacity and menu requirements.',
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    title: 'Expert After-Sales Support',
    description: 'Dedicated in-house service team for maintenance, repairs, and spare parts — keeping your kitchen running.',
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Competitive Pricing',
    description: 'Factory-direct pricing with flexible payment options and installment plans for businesses of all sizes.',
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    title: '1-Year Warranty',
    description: 'Every product carries a full 1-year warranty backed by our engineering and fabrication team on-site.',
  },
];

const WhyChooseUs = () => (
  <section className="bg-white py-16">
    <div className="container mx-auto px-4">

      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
          <span className="w-6 h-px bg-[#0F4C69]" />
          Why Ambassador
          <span className="w-6 h-px bg-[#0F4C69]" />
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Why Pakistan&apos;s Top Kitchens Choose Us
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Over 25 years of expertise designing, manufacturing, and supplying commercial kitchen equipment for every industry.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reasons.map((reason, i) => (
          <div
            key={i}
            className="group bg-white border border-gray-100 rounded-xl p-6 hover:border-[#E36630] hover:shadow-md transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-[#E36630] flex items-center justify-center mb-4 transition-colors duration-300 text-[#E36630] group-hover:text-white">
              {reason.icon}
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-[#E36630] transition-colors duration-300">
              {reason.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">{reason.description}</p>
          </div>
        ))}
      </div>

      {/* Testimonial strip */}
      <div className="mt-12 rounded-2xl border border-gray-100 bg-gray-50 p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#E36630] flex items-center justify-center text-white text-xl font-black">
          &quot;
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="text-gray-700 text-lg italic leading-relaxed">
            Ambassador equipped our entire 5-star hotel kitchen from scratch. The quality is outstanding and the after-sales service is unmatched in Pakistan.
          </p>
          <div className="mt-3 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
            <span className="font-bold text-gray-900">Chef Imran Malik</span>
            <span className="hidden md:inline text-gray-300">·</span>
            <span className="text-gray-500 text-sm">Executive Chef, Pearl Continental Hotel Lahore</span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {[1,2,3,4,5].map((s) => (
            <svg key={s} className="w-5 h-5 text-[#E36630]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
