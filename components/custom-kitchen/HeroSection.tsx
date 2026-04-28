'use client';

import React from 'react';
import Image from 'next/image';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, imageSrc, imageAlt }) => {
  return (
    <div className="relative min-h-[22rem] overflow-hidden md:h-[28rem] lg:h-[32rem]">
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/50" />
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover"
        priority
        sizes="100vw"
        style={{ objectPosition: 'center center' }}
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 flex h-full min-h-[22rem] items-center justify-center px-6 text-white md:min-h-0 md:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#E36630] md:text-sm">
            Case study
          </p>
          <h1 className="mb-4 text-3xl font-bold leading-tight drop-shadow-lg md:text-5xl">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/85 drop-shadow-md md:text-xl md:leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
