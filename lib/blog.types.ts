export const BLOG_TITLE_MAX = 200;
export const BLOG_EXCERPT_MAX = 320;
export const BLOG_CONTENT_MAX = 50_000;
export const BLOG_CATEGORY_MAX = 80;
export const BLOG_PAGE_SIZE = 10;

export type BlogPostStatus = 'active' | 'inactive';

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  coverImagePublicId?: string;
  author: string;
  category?: string;
  status: BlogPostStatus;
  publishedAt: string;
  readTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export const BLOG_CATEGORIES = [
  'Industry Insights',
  'Product Tips',
  'Kitchen Design',
  'Company News',
  'Maintenance & Care',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
