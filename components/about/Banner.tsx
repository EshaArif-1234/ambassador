'use client';

import Image from 'next/image';

const textShadow = {
  heading:
    '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)',
  body: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)',
};

const Banner = () => {
  return (
    <div className="relative h-96 md:h-[600px] overflow-hidden">
      <Image
        src="/Images/ABOUT-US-WEB-BANNER-K.png"
        alt="About Ambassador Banner"
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
      />

      <div className="absolute inset-0 flex items-center justify-start">
        <div className="w-full max-w-[640px] px-4 sm:px-6 text-center text-white">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight text-[#E36630]"
          >
            About Ambassador
          </h1>
          <p
            className="mx-auto max-w-[520px] text-lg md:text-xl lg:text-2xl leading-relaxed font-semibold"
          >
            Your trusted partner for commercial kitchen equipment and food service solutions
          </p>
        </div>
      </div>
    </div>
  );
};

export default Banner;
