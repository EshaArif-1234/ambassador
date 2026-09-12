'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import type { BlogHeading } from '@/lib/blogContent';
import { PRODUCTS_PATH } from '@/lib/siteRoutes';

type BlogArticleSidebarProps = {
  headings: BlogHeading[];
  shareUrl: string;
  shareTitle: string;
};

export default function BlogArticleSidebar({
  headings,
  shareUrl,
  shareTitle,
}: BlogArticleSidebarProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [shareUrl]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);

  return (
    <div className="space-y-6 lg:sticky lg:top-28">
      {headings.length > 0 ? (
        <nav className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500">On this page</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
                <a
                  href={`#${h.id}`}
                  className="font-medium text-[#0F4C69] hover:text-[#E36630] hover:underline"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="rounded-2xl bg-[#0F4C69] p-5 text-white shadow-md">
        <h2 className="text-lg font-bold">Need equipment advice?</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/85">
          Browse our commercial kitchen range or speak with the Ambassador team for your project.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href={PRODUCTS_PATH}
            className="inline-flex justify-center rounded-xl bg-[#E36630] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#cc5a2a]"
          >
            View Products
          </Link>
          <Link
            href="/contact-us"
            className="inline-flex justify-center rounded-xl border border-white/40 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500">Share</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <a
            href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            WhatsApp
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
