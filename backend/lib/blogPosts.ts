import type { IBlogPost } from '@/backend/models/BlogPost.model';
import type { BlogPost } from '@/lib/blog.types';
import { estimateReadMinutes } from '@/lib/blogContent';

type BlogPostDoc = IBlogPost | (IBlogPost & { _id: unknown });

export function toBlogPost(doc: BlogPostDoc): BlogPost {
  const row = doc as IBlogPost & { _id: { toString(): string } };
  return {
    id: String(row._id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.coverImage?.trim() || undefined,
    coverImagePublicId: row.coverImagePublicId?.trim() || undefined,
    author: row.author?.trim() || 'Ambassador Team',
    category: row.category?.trim() || undefined,
    status: row.status === 'inactive' ? 'inactive' : 'active',
    publishedAt: new Date(row.publishedAt).toISOString(),
    readTimeMinutes: estimateReadMinutes(row.content),
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

