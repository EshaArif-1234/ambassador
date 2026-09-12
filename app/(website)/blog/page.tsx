import type { Metadata } from 'next';
import BlogsPage from '@/client/pages/blog/BlogsPage';
import { canonicalMetadata } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Blog | Ambassador Commercial Kitchen Equipment',
  description:
    'Read Ambassador blog articles — commercial kitchen tips, product insights, and industry news from Pakistan’s trusted equipment partner.',
  ...canonicalMetadata('/blog'),
};

export default function Blog() {
  return <BlogsPage />;
}
