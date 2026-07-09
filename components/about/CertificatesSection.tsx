'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

const certificates = [
  { name: 'ISO 9001:2015 Quality Management', image: '/Images/about/Testing.png' },
  { name: 'Brand of the Year Award', image: '/Images/about/Brand-Of-the-Year-Award.png' },
  { name: 'Brand of the Year Award', image: '/Images/about/Awards/Brand-of-the-Year-Award-2.png' },
  { name: 'Certificate of Appreciation', image: '/Images/about/Awards/Certificate-Of-Appreciation.png' },
  { name: 'Certificate of Participation', image: '/Images/about/Awards/Certificate-Of-Participation.png' },
  { name: 'Chinese Commercial Kitchen Awards', image: '/Images/about/Awards/Chinese-Commercial-Kitchen--Awards.png' },
  { name: 'Iapex Awards', image: '/Images/about/Awards/Iapex-Awards.png' },
  { name: 'Italian Development Committee', image: '/Images/about/Awards/Italian-Development-Committee.png' },
  { name: 'Naval Staff Award', image: '/Images/about/Awards/Naval-Staff-award.png' },
  { name: 'PAF Excellence Certificate', image: '/Images/about/Awards/PAF-EXCELLENCE-CERTIFACTE.png' },
  { name: 'Web Excels Award', image: '/Images/about/Awards/Web-Excels-award-s.png' },
];

const SLIDE_COUNT = certificates.length;
const LOOP_SLIDES = [...certificates, ...certificates];

function getSlidesPerView(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 640) return 2;
  return 1;
}

function CertificateCard({
  cert,
  onSelect,
}: {
  cert: (typeof certificates)[number];
  onSelect: (image: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(cert.image)}
      aria-label={`View ${cert.name}`}
      className="group w-full cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-[0_8px_28px_rgba(0,0,0,0.12),0_2px_10px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#E36630]/50 hover:shadow-[0_16px_44px_rgba(0,0,0,0.18),0_6px_16px_rgba(227,102,48,0.14)]"
    >
      <div className="bg-white px-4 py-6">
        <div className="relative h-56 w-full">
          <Image src={cert.image} alt={cert.name} fill className="object-contain" />

          <div className="absolute inset-0 flex items-center justify-center bg-[#0F4C69]/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="rounded-full bg-white p-3 shadow-md">
              <svg className="h-5 w-5 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-3 pb-4 group-hover:border-[#E36630]/30">
        <h3 className="line-clamp-2 text-center text-sm font-bold leading-snug text-gray-800 transition-colors duration-300 group-hover:text-[#E36630]">
          {cert.name}
        </h3>
      </div>
    </button>
  );
}

const CertificatesSection = () => {
  const [current, setCurrent] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const [paused, setPaused] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [animate, setAnimate] = useState(true);

  const selectedCert = selectedImage
    ? certificates.find((c) => c.image === selectedImage)
    : null;

  const activeDot = ((current % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;

  const updateSlidesPerView = useCallback(() => {
    setSlidesPerView(getSlidesPerView(window.innerWidth));
  }, []);

  useEffect(() => {
    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, [updateSlidesPerView]);

  const next = useCallback(() => {
    setAnimate(true);
    setCurrent((p) => p + 1);
  }, []);

  const prev = useCallback(() => {
    setAnimate(true);
    setCurrent((p) => p - 1);
  }, []);

  // Seamless loop — jump back without animation after reaching duplicate set
  useEffect(() => {
    if (current >= SLIDE_COUNT) {
      const timer = setTimeout(() => {
        setAnimate(false);
        setCurrent((p) => p - SLIDE_COUNT);
      }, 500);
      return () => clearTimeout(timer);
    }

    if (current < 0) {
      const timer = setTimeout(() => {
        setAnimate(false);
        setCurrent((p) => p + SLIDE_COUNT);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [current]);

  // Re-enable transition after instant reset
  useEffect(() => {
    if (!animate) {
      const frame = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [animate]);

  // Auto-play loop
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(next, 3500);
    return () => clearInterval(interval);
  }, [paused, next]);

  return (
    <>
      <section className="border-t border-gray-200 bg-gray-50/80 py-16 pb-20">
        <div className="container mx-auto mb-12 px-4 text-center">
          <span className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#0F4C69]">
            <span className="h-px w-8 bg-[#0F4C69]" />
            Accreditations
            <span className="h-px w-8 bg-[#0F4C69]" />
          </span>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            Standards That Back{' '}
            <span className="text-[#E36630]">Our Quality</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg">
            Recognized international certifications that confirm our commitment to quality, safety,
            and compliance at every level.
          </p>
          <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-[#E36630]" />
        </div>

        <div
          className="w-full"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative mb-8 w-full">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous certificate"
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-all duration-200 hover:border-[#E36630] hover:text-[#E36630] sm:left-5 md:left-8"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next certificate"
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-all duration-200 hover:border-[#E36630] hover:text-[#E36630] sm:right-5 md:right-8"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="w-full overflow-x-hidden overflow-y-visible px-14 pt-2 sm:px-16 md:px-20">
              <div
                className={`flex ${animate ? 'transition-transform duration-500 ease-in-out' : ''}`}
                style={{
                  width: `${(LOOP_SLIDES.length / slidesPerView) * 100}%`,
                  transform: `translateX(-${(current / LOOP_SLIDES.length) * 100}%)`,
                }}
              >
                {LOOP_SLIDES.map((cert, index) => (
                  <div
                    key={`${cert.image}-${index}`}
                    className="flex-shrink-0 px-2 pb-4 sm:px-3"
                    style={{ width: `${100 / LOOP_SLIDES.length}%` }}
                  >
                    <CertificateCard cert={cert} onSelect={setSelectedImage} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2 pb-4">
              {certificates.map((cert, i) => (
                <button
                  key={cert.image}
                  type="button"
                  onClick={() => {
                    setAnimate(true);
                    setCurrent(i);
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    activeDot === i
                      ? 'h-2.5 w-6 bg-[#E36630]'
                      : 'h-2.5 w-2.5 bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white transition-colors hover:text-[#E36630]"
              aria-label="Close"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="overflow-hidden rounded-2xl border-t-4 border-[#E36630] bg-white px-6 py-8 shadow-2xl">
              <Image
                src={selectedImage}
                alt={selectedCert?.name ?? 'Certificate'}
                width={900}
                height={650}
                className="w-full object-contain"
              />
              {selectedCert?.name && (
                <p className="mt-4 text-center text-base font-bold text-gray-900">
                  {selectedCert.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificatesSection;
