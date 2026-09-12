'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatBlogDate } from '@/lib/blogDisplay';
import type { BlogPost } from '@/lib/blog.types';
import { blogDetailPath } from '@/lib/siteRoutes';

const FALLBACK_COVER = '/Images/ABOUT-US-WEB-BANNER-K.png';

type BlogCardProps = {
  post: BlogPost;
};

const BlogCard = ({ post }: BlogCardProps) => {
  const href = blogDetailPath(post.slug);
  const cover = post.coverImage?.trim() || FALLBACK_COVER;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0F4C69]/25 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={cover}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06131A]/50 via-transparent to-transparent opacity-80" />
        {post.category ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0F4C69] shadow-sm">
            {post.category}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {formatBlogDate(post.publishedAt)}
          <span className="mx-2 text-gray-300">·</span>
          {post.readTimeMinutes} min read
          <span className="mx-2 text-gray-300">·</span>
          {post.author}
        </p>
        <h2 className="mt-2 line-clamp-2 text-lg font-bold text-[#0F4C69] transition-colors group-hover:text-[#E36630] md:text-xl">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
          {post.excerpt}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0F4C69] group-hover:text-[#E36630]">
          Read article
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default BlogCard;
