'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageSliderProps {
  images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="container mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
        Kitchen Gallery
      </h2>
      <div className="p-8">
        <div className="relative">
          <div className="relative h-96 rounded-lg overflow-hidden mb-6">
            <Image
              src={images[currentImageIndex]}
              alt={`Kitchen Image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
            />
          </div>
          
          {/* Slider Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevImage}
              className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextImage}
              className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-colors"
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
