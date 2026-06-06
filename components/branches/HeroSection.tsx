'use client';

import Image from 'next/image';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
}

const HeroSection = ({
  title = 'Our Branches',
  subtitle = 'Visit our 4 showrooms across Pakistan for premium commercial kitchen equipment',
  backgroundImage = '/Images/our branches dark.jpg',
}: HeroSectionProps) => {
  return (
    <section className="relative h-96 md:h-[560px] overflow-hidden bg-[#06131A]">
      <Image
        src={backgroundImage}
        alt="Ambassador branches across Pakistan"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E36630]" />
            Nationwide Presence
          </span>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight"
            style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          >
            {title.split(' ').map((word, i) =>
              i === title.split(' ').length - 1 ? (
                <span key={i} className="text-[#E36630]">
                  {word}{' '}
                </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>
          <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
