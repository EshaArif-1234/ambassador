import Link from 'next/link';

const trustItems = [
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    ),
    label: '500+ Products',
    sub: 'In Stock & Ready',
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
    label: 'Fast Delivery',
    sub: 'Nationwide Coverage',
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    ),
    label: 'Expert Support',
    sub: 'Mon–Sat 9am–6pm',
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
    label: '1-Year Warranty',
    sub: 'On All Products',
  },
];

const CTASection = () => (
  <section className="relative overflow-hidden bg-[#0F4C69] py-10 sm:py-12 md:py-20">
    <div className="container relative mx-auto px-4">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#E36630] sm:mb-6 sm:px-4 sm:text-sm">
          Get Started Today
        </span>

        <h2 className="mb-4 px-1 text-2xl font-bold leading-tight text-white sm:mb-5 sm:text-3xl md:mb-6 md:text-5xl">
          Ready to Equip Your <span className="text-[#E36630]">Commercial Kitchen?</span>
        </h2>

        <p className="mx-auto mb-8 max-w-2xl px-1 text-sm leading-relaxed text-white/60 sm:mb-10 sm:text-base md:text-lg">
          Whether you&apos;re opening a new restaurant, upgrading a hotel kitchen, or setting up a large-scale
          institutional kitchen — our team is ready to help you build the perfect setup.
        </p>

        <div className="mb-10 flex flex-col justify-center gap-3 sm:mb-12 sm:flex-row sm:gap-4 md:mb-14">
          <Link
            href="/products"
            className="w-full rounded-xl bg-[#E36630] px-6 py-3 text-center text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#cc5a2a] sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            Browse All Products
          </Link>
          <Link
            href="/contact-us"
            className="w-full rounded-xl border-2 border-white/20 px-6 py-3 text-center text-sm font-bold text-white transition-colors hover:border-[#E36630] hover:text-[#E36630] sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            Request a Quote
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-8 sm:gap-5 sm:pt-9 md:grid-cols-4 md:gap-6 md:pt-10">
          {trustItems.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 px-1 sm:gap-2">
              <svg
                className="h-6 w-6 text-[#E36630] sm:h-7 sm:w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                {item.icon}
              </svg>
              <span className="text-center text-xs font-semibold text-white sm:text-sm">{item.label}</span>
              <span className="text-center text-[10px] text-white/60 sm:text-xs">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
