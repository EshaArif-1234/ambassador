'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageSliderProps {
  images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images.length) {
    return null;
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h2 className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-[#0F4C69]">
        Project gallery
      </h2>
      <h3 className="mb-8 text-center text-3xl font-bold text-gray-900 md:text-4xl">
        Kitchen <span className="text-[#E36630]">gallery</span>
      </h3>
      <div className="p-8">
        <div className="relative">
          <div className="relative h-96 rounded-lg overflow-hidden mb-6">
            <Image
              src={images[currentImageIndex]}
              alt={`Kitchen image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
          
          {/* Slider Controls */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevImage}
              className="rounded-full bg-[#E36630] p-3 text-white transition-colors hover:bg-[#cc5a2a]"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-3 w-3 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-[#E36630]' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
            
            <button
              type="button"
              onClick={nextImage}
              className="rounded-full bg-[#E36630] p-3 text-white transition-colors hover:bg-[#cc5a2a]"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
