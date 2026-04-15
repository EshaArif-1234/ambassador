'use client';

import Image from 'next/image';
import { useState } from 'react';

const testimonials = [
  {
    name: 'Restaurant Owner — Lahore',
    image: '/Images/about/person-1.avif',
    title: 'Excellent Service',
    text: 'Ambassadors provided us with top-quality kitchen equipment that transformed our restaurant operations. Their after-sales support is outstanding!',
    rating: 5,
  },
  {
    name: 'Bakery Manager — Karachi',
    image: '/Images/about/person-2.jpg',
    title: 'Reliable Partner',
    text: "We've been working with Ambassadors for 5 years. They always deliver on time and provide the best equipment at competitive prices.",
    rating: 5,
  },
  {
    name: 'Hotel Chef — Islamabad',
    image: '/Images/about/person-3.avif',
    title: 'Professional Quality',
    text: 'The commercial kitchen equipment from Ambassadors meets international standards. Highly recommended for any food service establishment.',
    rating: 4,
  },
  {
    name: 'Catering Service — Faisalabad',
    image: '/Images/about/person-4.avif',
    title: 'Great Value',
    text: 'Outstanding quality equipment at reasonable prices. Their team helped us choose the right products for our catering business.',
    rating: 5,
  },
  {
    name: 'Fast Food Chain Owner',
    image: '/Images/about/person-5.jpg',
    title: 'Exceptional Support',
    text: 'Quick delivery and excellent customer service. The equipment is durable and has improved our efficiency significantly.',
    rating: 4,
  },
  {
    name: 'Hotel Manager — Rawalpindi',
    image: '/Images/about/person-6.jpg',
    title: 'Outstanding Quality',
    text: 'The equipment from Ambassadors has exceeded our expectations. Their professional team and quality products make them our preferred supplier.',
    rating: 5,
  },
];

const StarIcon = () => (
  <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
  </svg>
);

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((p) => (p + 1) % testimonials.length);

  return (
    <section className="bg-[#FAFAFA] py-16 border-t border-gray-100">
      <div className="container mx-auto px-4">

        {/* ── Header ───────────────────────────────────── */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
            <span className="w-8 h-px bg-[#0F4C69]" />
            Client Reviews
            <span className="w-8 h-px bg-[#0F4C69]" />
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            What Our{' '}
            <span className="text-[#E36630]">Clients Say</span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Trusted by hundreds of food service businesses across Pakistan — here's what they have to say.
          </p>
          <div className="mt-5 w-16 h-1 bg-[#E36630] mx-auto rounded-full" />
        </div>

        {/* ── Slider ───────────────────────────────────── */}
        <div className="relative">

          {/* Nav: Prev */}
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:border-[#E36630] hover:text-[#E36630] transition-colors duration-200 text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Nav: Next */}
          <button
            onClick={next}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:border-[#E36630] hover:text-[#E36630] transition-colors duration-200 text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Cards viewport */}
          <div className="overflow-hidden mx-12">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {testimonials.map((t, i) => (
                <div key={i} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white border border-gray-100 rounded-2xl p-8 mx-auto max-w-2xl shadow-sm hover:border-[#E36630]/40 hover:shadow-md transition-all duration-300">

                    {/* Quote icon */}
                    <div className="flex justify-center mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#E36630]/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#E36630]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                    </div>

                    {/* Text */}
                    <p className="text-gray-600 text-lg leading-relaxed text-center mb-8 italic">
                      &ldquo;{t.text}&rdquo;
                    </p>

                    {/* Divider */}
                    <div className="w-12 h-px bg-[#E36630]/30 mx-auto mb-6" />

                    {/* Client info */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-14 h-14 rounded-full border-2 border-[#E36630]/30 overflow-hidden flex-shrink-0">
                        <Image
                          src={t.image}
                          alt={t.name}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                        <p className="text-[#E36630] text-xs font-medium mt-0.5">{t.title}</p>
                        <div className="flex gap-0.5 mt-1.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <svg
                              key={s}
                              className={`w-3.5 h-3.5 fill-current ${s < t.rating ? 'text-amber-400' : 'text-gray-200'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  current === i
                    ? 'w-6 h-2.5 bg-[#E36630]'
                    : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
