'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DetailPage from '@/app/custom-kitchen/DetailPage';

const CustomKitchenPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80"></div>
        <Image
          src="/Images/home/ratio.jpg"
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
              Custom Kitchen Solutions
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 drop-shadow-lg">
              Professional design, manufacturing, and installation of commercial kitchens
            </p>
          </div>
        </div>
      </div>

      {/* Custom Kitchen Projects Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Custom Kitchen Projects
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our portfolio of custom kitchen installations, from planning and design to complete turnkey solutions
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Fast Food Kitchen Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48">
              <Image
                src="/Images/home/card1.jpg"
                alt="Fast Food Kitchen Installation"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Fast Food Kitchen Installation
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                Complete design and installation of a commercial fast food kitchen including AutoCAD layout planning, stainless steel equipment manufacturing, ventilation systems, and full kitchen setup.
              </p>
              
              <Link 
                href="/custom-kitchen/fast-food-kitchen"
                className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                View Project Detail
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Restaurant Kitchen Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48">
              <Image
                src="/Images/home/card2.webp"
                alt="Restaurant Kitchen Setup"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Restaurant Kitchen Setup
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                Full-service restaurant kitchen design and installation with custom equipment layout, professional cooking stations, and optimized workflow solutions for fine dining establishments.
              </p>
              
              <Link 
                href="/custom-kitchen/restaurant-kitchen"
                className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                View Project Detail
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Industrial Kitchen Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48">
              <Image
                src="/Images/home/card3.jpg"
                alt="Industrial Kitchen Solutions"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Industrial Kitchen Solutions
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                Large-scale industrial kitchen installations for food processing facilities, institutional kitchens, and high-volume food service operations with advanced automation systems.
              </p>
              
              <Link 
                href="/custom-kitchen/industrial-kitchen"
                className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                View Project Detail
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Our Kitchen Design Process Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Kitchen Design Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From concept to completion, we follow a systematic approach to deliver your perfect custom kitchen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Step 1: Consultation */}
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                1 Consultation
              </h3>
              <p className="text-gray-600 text-sm">
                Understand your kitchen requirements.
              </p>
            </div>

            {/* Step 2: Kitchen Layout Design */}
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                2 Kitchen Layout Design
              </h3>
              <p className="text-gray-600 text-sm">
                Engineers design layout using AutoCAD.
              </p>
            </div>

            {/* Step 3: Equipment Manufacturing */}
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                3 Equipment Manufacturing
              </h3>
              <p className="text-gray-600 text-sm">
                Custom stainless steel equipment production.
              </p>
            </div>

            {/* Step 4: Installation */}
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                4 Installation
              </h3>
              <p className="text-gray-600 text-sm">
                Professional installation by expert technicians.
              </p>
            </div>

            {/* Step 5: Testing & Handover */}
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                5 Testing & Handover
              </h3>
              <p className="text-gray-600 text-sm">
                Complete system testing before delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-orange-500 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your Custom Kitchen?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Contact us today for a free consultation and let our experts design the perfect kitchen solution for your business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Free Consultation
            </Link>
            <Link 
              href="/products"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-500 transition-colors"
            >
              View Our Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomKitchenPage;