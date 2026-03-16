'use client';

import React from 'react';
import Image from 'next/image';

const HeroSection: React.FC = () => {
  return (
    <div className="relative h-96 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80"></div>
      <Image
        src="/images/home/ratio.jpg"
        alt="Custom Kitchen Solutions"
        fill
        className="object-cover"
        priority
        style={{
          objectPosition: 'center center'
        }}
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 h-full flex items-center justify-center text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            Fast Food Kitchen Installation
          </h1>
          <p className="text-xl md:text-2xl text-orange-100 drop-shadow-lg">
            Professional design, manufacturing, and installation of commercial kitchens
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
