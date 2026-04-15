'use client';

import Image from 'next/image';

const Banner = () => {
  return (
    <div className="relative h-96 md:h-[600px]">
      {/* Background Image */}
      <Image
        src="/Images/About-Us-Banner.jpg"
        alt="About Ambassadors Banner"
        fill
        className="object-cover"
        priority
      />
      
      {/* Centered Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)'
            }}
          >
            About Ambassadors
          </h1>
          <p 
            className="text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-semibold"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'
            }}
          >
            Your trusted partner for commercial kitchen equipment and food service solutions
          </p>
        </div>
      </div>
    </div>
  );
};

export default Banner;
