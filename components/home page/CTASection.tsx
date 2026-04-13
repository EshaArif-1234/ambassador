import Link from 'next/link';

const CTASection = () => (
  <section className="bg-gray-900 py-20 relative overflow-hidden">
    {/* Subtle decorative blobs */}
    <div className="absolute top-0 left-0 w-72 h-72 bg-[#E36630] rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#0F4C69] rounded-full opacity-10 translate-x-1/3 translate-y-1/3 pointer-events-none" />

    <div className="relative container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center">

        <span className="inline-block px-4 py-1 bg-white/10 text-orange-400 text-sm font-semibold rounded-full mb-6 tracking-wide uppercase">
          Get Started Today
        </span>

        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
          Ready to Equip Your{' '}
          <span className="text-[#E36630]">Commercial Kitchen?</span>
        </h2>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Whether you&apos;re opening a new restaurant, upgrading a hotel kitchen, or setting up a large-scale institutional kitchen — our team is ready to help you build the perfect setup.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            href="/products"
            className="px-8 py-4 bg-[#E36630] hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-base shadow-lg"
          >
            Browse All Products
          </Link>
          <Link
            href="/contact-us"
            className="px-8 py-4 border-2 border-white/20 hover:border-[#E36630] text-white hover:text-[#E36630] font-bold rounded-xl transition-colors text-base"
          >
            Request a Quote
          </Link>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-10">
          {[
            { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />, label: '500+ Products', sub: 'In Stock & Ready' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />, label: 'Fast Delivery', sub: 'Nationwide Coverage' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />, label: 'Expert Support', sub: 'Mon–Sat 9am–6pm' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />, label: '1-Year Warranty', sub: 'On All Products' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <svg className="w-7 h-7 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
              <span className="text-white text-sm font-semibold">{item.label}</span>
              <span className="text-gray-500 text-xs">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
