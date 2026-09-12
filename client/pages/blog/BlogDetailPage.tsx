'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import BlogArticleBody from '@/components/blog/BlogArticleBody';
import BlogArticleSidebar from '@/components/blog/BlogArticleSidebar';
import SignupBanner from '@/components/common/signup-banner';
import { extractBlogHeadings, parseBlogContent } from '@/lib/blogContent';
import { formatBlogDate } from '@/lib/blogDisplay';
import type { BlogPost } from '@/lib/blog.types';
import { blogDetailPath, BLOG_PATH } from '@/lib/siteRoutes';
import { absoluteUrl } from '@/lib/siteUrl';

const FALLBACK_COVER = '/Images/ABOUT-US-WEB-BANNER-K.png';

type BlogDetailPageProps = {
  post: BlogPost;
};

const BlogDetailPage = ({ post }: BlogDetailPageProps) => {
  const cover = post.coverImage?.trim() || FALLBACK_COVER;
  const blocks = useMemo(() => parseBlogContent(post.content), [post.content]);
  const headings = useMemo(() => extractBlogHeadings(blocks), [blocks]);

  const shareUrl = absoluteUrl(blogDetailPath(post.slug));

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Hero — title + meta left, cover right (reference layout, Ambassador colors) */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Link
            href={BLOG_PATH}
            className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#0F4C69] hover:text-[#E36630]"
          >
            ← Back to all articles
          </Link>

          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="min-w-0">
              {post.category ? (
                <span className="inline-flex rounded-full bg-[#0F4C69]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0F4C69]">
                  {post.category}
                </span>
              ) : null}
              <h1 className="mt-4 text-2xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-[2.75rem]">
                {post.title}
              </h1>
              <ul className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                <li className="font-medium text-gray-700">{post.author}</li>
                <li aria-hidden className="text-gray-300">
                  ·
                </li>
                <li>{formatBlogDate(post.publishedAt)}</li>
                <li aria-hidden className="text-gray-300">
                  ·
                </li>
                <li>{post.readTimeMinutes} min read</li>
              </ul>
              <p className="mt-5 text-base leading-relaxed text-gray-600 md:text-lg">{post.excerpt}</p>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-lg">
              <Image
                src={cover}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Article + sidebar */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-8">
            <BlogArticleBody blocks={blocks} />

            <div className="mt-10 flex flex-wrap gap-3 border-t border-gray-100 pt-8">
              <Link
                href={BLOG_PATH}
                className="inline-flex rounded-xl border-2 border-[#0F4C69] px-6 py-2.5 text-sm font-semibold text-[#0F4C69] transition-colors hover:bg-[#0F4C69] hover:text-white"
              >
                More Articles
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex rounded-xl bg-[#E36630] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#cc5a2a]"
              >
                Contact Our Team
              </Link>
            </div>
          </article>

          <aside className="lg:col-span-4">
            <BlogArticleSidebar headings={headings} shareUrl={shareUrl} shareTitle={post.title} />
          </aside>
        </div>
      </section>

      <SignupBanner />
    </div>
  );
};

export default BlogDetailPage;
