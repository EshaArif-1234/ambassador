'use client';

import BlogHeroSection from '@/components/blog/BlogHeroSection';
import BlogGridSection from '@/components/blog/BlogGridSection';
import SignupBanner from '@/components/common/signup-banner';

const BlogsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <BlogHeroSection />
      <BlogGridSection />
      <SignupBanner />
    </div>
  );
};

export default BlogsPage;
