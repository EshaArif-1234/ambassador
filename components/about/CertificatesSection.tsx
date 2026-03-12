'use client';

import Image from 'next/image';
import { useState } from 'react';

const CertificatesSection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const certificates = [
    {
      name: "ISO 9001:2015 Quality Management",
      image: "/Images/about/certificate-1.png",
      description: "International standard for quality management systems"
    },
    {
      name: "Food Safety Certification",
      image: "/Images/about/certificate 2.png",
      description: "Ensures compliance with food safety regulations"
    },
    {
      name: "CE Marking European Conformity",
      image: "/Images/about/certificate-3.png",
      description: "European conformity marking for safety standards"
    },
    {
      name: "Commercial Equipment License",
      image: "/Images/about/certificate-4.jpg",
      description: "Authorized dealer for commercial kitchen equipment"
    }
  ];

  const openImagePopup = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const closeImagePopup = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              <span className="text-orange-500">Our</span> Certifications
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Recognized standards and certifications that ensure quality and compliance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certificates.map((certificate, index) => (
              <div key={index} className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                {/* Certificate Image - Covers whole card */}
                <div 
                  className="relative h-64 w-full"
                  onClick={() => openImagePopup(certificate.image)}
                >
                  <Image
                    src={certificate.image}
                    alt={certificate.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Overlay with certificate info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-bold text-lg mb-1">{certificate.name}</h3>
                      <p className="text-sm opacity-90">{certificate.description}</p>
                    </div>
                  </div>
                  
                  {/* Click to view indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white bg-opacity-90 rounded-full p-3">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Popup */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-gray bg-opacity-30 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeImagePopup}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeImagePopup}
              className="absolute -top-12 right-0 text-black hover:text-gray-700 transition-colors bg-white rounded-full p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image in Popup */}
            <div className="bg-white rounded-lg overflow-hidden">
              <Image
                src={selectedImage as string}
                alt="Certificate"
                width={800}
                height={600}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificatesSection;
