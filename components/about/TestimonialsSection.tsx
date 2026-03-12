'use client';

import Image from 'next/image';
import { useState } from 'react';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Restaurant Owner - Lahore",
      image: "/Images/about/person-1.avif",
      title: "Excellent Service",
      text: "Ambassadors provided us with top-quality kitchen equipment that transformed our restaurant operations. Their after-sales support is outstanding!",
      rating: 5
    },
    {
      name: "Bakery Manager - Karachi",
      image: "/Images/about/person-2.jpg",
      title: "Reliable Partner",
      text: "We've been working with Ambassadors for 5 years. They always deliver on time and provide the best equipment at competitive prices.",
      rating: 5
    },
    {
      name: "Hotel Chef - Islamabad",
      image: "/Images/about/person-3.avif",
      title: "Professional Quality",
      text: "The commercial kitchen equipment from Ambassadors meets international standards. Highly recommended for any food service establishment.",
      rating: 4
    },
    {
      name: "Catering Service - Faisalabad",
      image: "/Images/about/person-4.avif",
      title: "Great Value",
      text: "Outstanding quality equipment at reasonable prices. Their team helped us choose the right products for our catering business.",
      rating: 5
    },
    {
      name: "Fast Food Chain Owner",
      image: "/Images/about/person-5.jpg",
      title: "Exceptional Support",
      text: "Quick delivery and excellent customer service. The equipment is durable and has improved our efficiency significantly.",
      rating: 4
    },
    {
      name: "Hotel Manager - Rawalpindi",
      image: "/Images/about/person-6.jpg",
      title: "Outstanding Quality",
      text: "The equipment from Ambassadors has exceeded our expectations. Their professional team and quality products make them our preferred supplier.",
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            <span className="text-orange-500">What Our</span> Clients Say
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Trusted by hundreds of businesses across Pakistan
          </p>
        </div>
        
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors -translate-y-1/2"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" />
            </svg>
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors -translate-y-1/2"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7 7" />
            </svg>
          </button>

          {/* Testimonial Cards */}
          <div className="overflow-hidden mx-12">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-xl shadow-lg p-8 mx-auto max-w-2xl">
                    {/* Quote Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                    </div>

                    {/* Testimonial Content */}
                    <p className="text-gray-700 text-lg leading-relaxed text-center mb-8 italic">
                      "{testimonial.text}"
                    </p>

                    {/* Client Info */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16">
                          <div className="w-full h-full rounded-full border-4 border-orange-200 overflow-hidden">
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              fill
                              className="object-cover rounded-full"
                            />
                          </div>
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-gray-800 text-lg">{testimonial.name}</h4>
                          <h5 className="text-orange-500 font-medium">{testimonial.title}</h5>
                          
                          {/* Star Rating */}
                          <div className="flex mt-2">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentTestimonial === index ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
