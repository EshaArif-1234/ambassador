'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const TeamSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const teamMembers = [
    {
      name: "Ahmed Hassan",
      role: "CEO & Founder",
      image: "/Images/about/person-1.avif",
      description: "Visionary leader with 15+ years in commercial equipment industry",
      details: "Ahmed founded Ambassadors with a vision to provide premium commercial kitchen equipment to businesses across Pakistan. His leadership has driven the company's growth and success."
    },
    {
      name: "Sarah Khan",
      role: "Operations Manager", 
      image: "/Images/about/person-2.jpg",
      description: "Expert in supply chain management and customer relations",
      details: "Sarah manages all operational aspects of the business, ensuring smooth delivery processes and maintaining excellent customer relationships."
    },
    {
      name: "Muhammad Ali",
      role: "Technical Director",
      image: "/Images/about/person-3.avif",
      description: "Product specialist with deep knowledge of kitchen equipment",
      details: "Muhammad provides technical expertise and product knowledge, helping clients choose the right equipment for their specific needs."
    },
    {
      name: "Fatima Sheikh",
      role: "Sales Manager",
      image: "/Images/about/person-4.avif",
      description: "Dedicated to helping businesses find the perfect equipment solutions",
      details: "Fatima leads the sales team with a customer-first approach, ensuring clients receive personalized service and expert guidance."
    },
    {
      name: "Bilal Ahmed",
      role: "Marketing Director",
      image: "/Images/about/person-5.jpg",
      description: "Creative strategist driving brand awareness and growth",
      details: "Bilal develops marketing strategies that showcase Ambassadors' commitment to quality and service excellence."
    },
    {
      name: "Ayesha Malik",
      role: "Customer Service Lead",
      image: "/Images/about/person-6.jpg",
      description: "Committed to exceptional customer support and satisfaction",
      details: "Ayesha ensures every customer receives outstanding support throughout their journey with Ambassadors."
    }
  ];

  // Create infinite array for smooth continuous cycle
  const infiniteTeamMembers = [...teamMembers, ...teamMembers, ...teamMembers]; // 18 cards total

  const nextSlide = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => prev - 1);
  };

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => prev + 1);
    }, 3000); // Move every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Smooth reset when reaching boundaries to maintain infinite feel
  useEffect(() => {
    if (currentSlide >= teamMembers.length) {
      // When we reach the first duplicate, reset to original position
      setTimeout(() => {
        setCurrentSlide(currentSlide - teamMembers.length);
      }, 0);
    } else if (currentSlide < 0) {
      // When we go backwards past first card, reset to end position
      setTimeout(() => {
        setCurrentSlide(currentSlide + teamMembers.length);
      }, 0);
    }
  }, [currentSlide]);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            <span className="text-orange-500">Our</span> Team
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet the passionate professionals behind Ambassadors
          </p>
        </div>
        
        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors -translate-y-1/2"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors -translate-y-1/2"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7 7" />
            </svg>
          </button>

          {/* Team Cards Slider */}
          <div className="overflow-hidden mx-8 pb-8">
            <div 
              className="flex transition-all duration-700 ease-in-out gap-6 items-center justify-center"
              style={{ 
                transform: `translateX(-${currentSlide * 25}%)`,
                transition: 'transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1)'
              }}
            >
              {infiniteTeamMembers.map((member, index) => (
                <div key={index} className="w-1/4 flex-shrink-0 flex items-center justify-center">
                  <div className="group relative w-56 h-56 transform transition-all duration-500 hover:scale-105">
                    {/* Team Card - Perfect circle */}
                    <div className="w-full h-full rounded-full shadow-xl transition-all duration-500 hover:shadow-2xl cursor-pointer overflow-hidden relative hover:rotate-3">
                      <div className="w-full h-full rounded-full overflow-hidden transition-transform duration-700 group-hover:scale-110">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover transition-all duration-500 group-hover:brightness-110"
                        />
                      </div>
                    </div>

                    {/* Hover Details - Shows on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#101827] via-[#1a2332] to-[#101827] bg-opacity-95 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
                      <div className="text-center p-6 transform transition-all duration-500 group-hover:scale-110">
                        <h3 className="text-xl font-bold mb-2 text-white transform transition-all duration-300 group-hover:translate-y-1">{member.name}</h3>
                        <p className="text-sm text-orange-400 font-medium transform transition-all duration-300 group-hover:translate-y-1">{member.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          </div>
      </div>
    </div>
  );
};

export default TeamSection;
