'use client';

import Image from 'next/image';
import { useState } from 'react';

const certificates = [
  {
    name: 'ISO 9001:2015 Quality Management',
    image: '/Images/about/certificate-1.png',
    description: 'International standard for quality management systems',
  },
  {
    name: 'Food Safety Certification',
    image: '/Images/about/certificate 2.png',
    description: 'Ensures compliance with food safety regulations',
  },
  {
    name: 'CE Marking — European Conformity',
    image: '/Images/about/certificate-3.png',
    description: 'European conformity marking for safety standards',
  },
  {
    name: 'Commercial Equipment License',
    image: '/Images/about/certificate-4.jpg',
    description: 'Authorized dealer for commercial kitchen equipment',
  },
];

const CertificatesSection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <section className="bg-[#FAFAFA] py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">

          {/* ── Header ───────────────────────────────────── */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
              <span className="w-8 h-px bg-[#0F4C69]" />
              Accreditations
              <span className="w-8 h-px bg-[#0F4C69]" />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Standards That Back{' '}
              <span className="text-[#E36630]">Our Quality</span>
            </h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Recognized international certifications that confirm our commitment to quality, safety, and compliance at every level.
            </p>
            <div className="mt-5 w-16 h-1 bg-[#E36630] mx-auto rounded-full" />
          </div>

          {/* ── Certificate Cards ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certificates.map((cert, index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(cert.image)}
                className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-[#E36630] hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                {/* Image area */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={cert.image}
                    alt={cert.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#0F4C69]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white rounded-full p-3 shadow-md">
                      <svg className="w-5 h-5 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="p-4 border-t border-gray-100 group-hover:border-[#E36630]/30 transition-colors duration-300">
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#E36630] transition-colors duration-300 mb-1 leading-snug">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{cert.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────── */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#E36630] transition-colors"
              aria-label="Close"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border-t-4 border-[#E36630]">
              <Image
                src={selectedImage}
                alt="Certificate"
                width={900}
                height={650}
                className="w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificatesSection;
