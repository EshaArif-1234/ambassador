'use client';

import Image from 'next/image';

const BANNER_WIDTH = 2752;
const BANNER_HEIGHT = 1536;

const BlogHeroSection = () => {
  return (
    <section className="w-full overflow-hidden bg-white">
      <Image
        src="/Images/blog-image.png"
        alt="Ambassador blog"
        width={BANNER_WIDTH}
        height={BANNER_HEIGHT}
        className="h-auto w-full"
        sizes="100vw"
        priority
      />
    </section>
  );
};

export default BlogHeroSection;
