import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/backend/config/db';
import BlogPost from '@/backend/models/BlogPost.model';
import { toBlogPost } from '@/backend/lib/blogPosts';
import BlogDetailPage from '@/client/pages/blog/BlogDetailPage';
import { absoluteUrl, canonicalMetadata } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connectDB();
  const { slug } = await params;
  const doc = await BlogPost.findOne({ slug: slug.trim().toLowerCase(), status: 'active' }).lean();
  if (!doc) return { title: 'Article Not Found' };

  const post = toBlogPost(doc as never);
  const path = `/blog/${post.slug}`;
  return {
    title: `${post.title} | Blog | Ambassador`,
    description: post.excerpt,
    ...canonicalMetadata(path),
    openGraph: {
      url: absoluteUrl(path),
      title: post.title,
      description: post.excerpt,
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  await connectDB();
  const { slug } = await params;
  const doc = await BlogPost.findOne({ slug: slug.trim().toLowerCase(), status: 'active' }).lean();
  if (!doc) notFound();

  return <BlogDetailPage post={toBlogPost(doc as never)} />;
}
