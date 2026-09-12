import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import BlogPost from '@/backend/models/BlogPost.model';
import { toBlogPost } from '@/backend/lib/blogPosts';
import { requireAdmin, rejectManagerStatusChange } from '@/backend/lib/adminAuth';
import {
  BLOG_CATEGORY_MAX,
  BLOG_CONTENT_MAX,
  BLOG_EXCERPT_MAX,
  BLOG_TITLE_MAX,
} from '@/lib/blog.types';

function validateBlogBody(body: Record<string, unknown>, isCreate: boolean) {
  const errors: Record<string, string> = {};

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const coverImage = typeof body.coverImage === 'string' ? body.coverImage.trim() : '';
  const coverImagePublicId =
    typeof body.coverImagePublicId === 'string' ? body.coverImagePublicId.trim() : '';
  const author = typeof body.author === 'string' ? body.author.trim() : 'Ambassador Team';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const status = body.status === 'inactive' ? 'inactive' : 'active';
  const publishedAtRaw = body.publishedAt;

  if (isCreate && !title) errors.title = 'Title is required.';
  if (isCreate && !excerpt) errors.excerpt = 'Excerpt is required.';
  if (isCreate && !content) errors.content = 'Content is required.';
  if (title.length > BLOG_TITLE_MAX) {
    errors.title = `Title cannot exceed ${BLOG_TITLE_MAX} characters.`;
  }
  if (excerpt.length > BLOG_EXCERPT_MAX) {
    errors.excerpt = `Excerpt cannot exceed ${BLOG_EXCERPT_MAX} characters (short summary for blog cards).`;
  }
  if (content.length > BLOG_CONTENT_MAX) {
    errors.content = `Content is too long (max ${BLOG_CONTENT_MAX} characters).`;
  }
  if (category.length > BLOG_CATEGORY_MAX) {
    errors.category = `Category cannot exceed ${BLOG_CATEGORY_MAX} characters.`;
  }

  if (Object.keys(errors).length > 0) return { errors, data: undefined };

  let publishedAt = new Date();
  if (publishedAtRaw) {
    const parsed = new Date(String(publishedAtRaw));
    if (!Number.isNaN(parsed.getTime())) publishedAt = parsed;
  }

  return {
    data: {
      title,
      excerpt,
      content,
      coverImage,
      coverImagePublicId,
      author: author || 'Ambassador Team',
      category: category || undefined,
      status,
      publishedAt,
    },
    errors,
  };
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() ?? '';

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const docs = await BlogPost.find(filter).sort({ publishedAt: -1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: docs.map((d) => toBlogPost(d as never)) });
  } catch (error) {
    console.error('[GET /api/admin/blogs]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await req.json();
    const deactivateError = await rejectManagerStatusChange(req, body, { isCreate: true });
    if (deactivateError) return deactivateError;

    const { data, errors } = validateBlogBody(body, true);
    if (!data) {
      const firstError = Object.values(errors)[0] ?? 'Please check the form.';
      return NextResponse.json({ success: false, message: firstError, errors }, { status: 422 });
    }

    const doc = await BlogPost.create(data);
    return NextResponse.json(
      { success: true, message: 'Blog post created.', data: toBlogPost(doc) },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/admin/blogs]', error);
    const msg =
      error && typeof error === 'object' && 'errors' in error
        ? Object.values((error as { errors: Record<string, { message?: string }> }).errors)
            .map((e) => e.message)
            .filter(Boolean)
            .join(' ') || 'Validation failed.'
        : 'Server error.';
    const status = msg !== 'Server error.' ? 422 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
