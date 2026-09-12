import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/backend/config/db';
import BlogPost from '@/backend/models/BlogPost.model';
import { toBlogPost } from '@/backend/lib/blogPosts';
import { requireAdmin, requireFullAdmin, rejectManagerStatusChange } from '@/backend/lib/adminAuth';
import {
  BLOG_CATEGORY_MAX,
  BLOG_CONTENT_MAX,
  BLOG_EXCERPT_MAX,
  BLOG_TITLE_MAX,
} from '@/lib/blog.types';

function mongooseValidationMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('errors' in error)) return null;
  const messages = Object.values((error as { errors: Record<string, { message?: string }> }).errors)
    .map((e) => e.message)
    .filter(Boolean);
  return messages.length ? messages.join(' ') : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid id.' }, { status: 400 });
    }

    const doc = await BlogPost.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: toBlogPost(doc as never) });
  } catch (error) {
    console.error('[GET /api/admin/blogs/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid id.' }, { status: 400 });
    }

    const body = await req.json();
    const deactivateError = await rejectManagerStatusChange(req, body);
    if (deactivateError) return deactivateError;

    const doc = await BlogPost.findById(id);
    if (!doc) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        return NextResponse.json({ success: false, message: 'Title cannot be empty.' }, { status: 400 });
      }
      if (title.length > BLOG_TITLE_MAX) {
        return NextResponse.json(
          { success: false, message: `Title cannot exceed ${BLOG_TITLE_MAX} characters.` },
          { status: 422 },
        );
      }
      doc.title = title;
    }
    if (body.excerpt !== undefined) {
      const excerpt = String(body.excerpt).trim();
      if (excerpt.length > BLOG_EXCERPT_MAX) {
        return NextResponse.json(
          {
            success: false,
            message: `Excerpt cannot exceed ${BLOG_EXCERPT_MAX} characters (short summary for blog cards).`,
          },
          { status: 422 },
        );
      }
      doc.excerpt = excerpt;
    }
    if (body.content !== undefined) {
      const content = String(body.content).trim();
      if (content.length > BLOG_CONTENT_MAX) {
        return NextResponse.json(
          { success: false, message: `Content is too long (max ${BLOG_CONTENT_MAX} characters).` },
          { status: 422 },
        );
      }
      doc.content = content;
    }
    if (body.coverImage !== undefined) doc.coverImage = String(body.coverImage).trim();
    if (body.coverImagePublicId !== undefined) {
      doc.coverImagePublicId = String(body.coverImagePublicId).trim();
    }
    if (body.author !== undefined) doc.author = String(body.author).trim() || 'Ambassador Team';
    if (body.category !== undefined) {
      const category = String(body.category).trim();
      if (category.length > BLOG_CATEGORY_MAX) {
        return NextResponse.json(
          { success: false, message: `Category cannot exceed ${BLOG_CATEGORY_MAX} characters.` },
          { status: 422 },
        );
      }
      doc.category = category;
    }
    if (body.status !== undefined) doc.status = body.status === 'inactive' ? 'inactive' : 'active';
    if (body.publishedAt !== undefined) {
      const parsed = new Date(String(body.publishedAt));
      if (!Number.isNaN(parsed.getTime())) doc.publishedAt = parsed;
    }

    await doc.save();

    return NextResponse.json(
      { success: true, message: 'Blog post updated.', data: toBlogPost(doc) },
      { status: 200 },
    );
  } catch (error) {
    console.error('[PATCH /api/admin/blogs/[id]]', error);
    const msg = mongooseValidationMessage(error) ?? 'Server error.';
    return NextResponse.json({ success: false, message: msg }, { status: msg === 'Server error.' ? 500 : 422 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireFullAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid id.' }, { status: 400 });
    }

    const deleted = await BlogPost.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Blog post deleted.' });
  } catch (error) {
    console.error('[DELETE /api/admin/blogs/[id]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
