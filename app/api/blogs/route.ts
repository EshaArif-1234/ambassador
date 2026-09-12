import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import BlogPost from '@/backend/models/BlogPost.model';
import { toBlogPost } from '@/backend/lib/blogPosts';
import { BLOG_PAGE_SIZE } from '@/lib/blog.types';

export const dynamic = 'force-dynamic';

/** Public list of published blog posts */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() ?? '';
    const category = searchParams.get('category')?.trim() ?? '';
    const pageRaw = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limitRaw = parseInt(searchParams.get('limit') || String(BLOG_PAGE_SIZE), 10);
    const limit = Math.min(50, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : BLOG_PAGE_SIZE));

    const filter: Record<string, unknown> = { status: 'active' };

    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await BlogPost.countDocuments(filter);
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
    const page = Math.min(pageRaw, totalPages);
    const skip = (page - 1) * limit;

    const [docs, categoryValues] = await Promise.all([
      BlogPost.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      BlogPost.distinct('category', {
        status: 'active',
        category: { $exists: true, $nin: [null, ''] },
      }),
    ]);
    const posts = docs.map((d) => toBlogPost(d as never));

    const categories = categoryValues
      .map((c) => String(c).trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      success: true,
      data: posts,
      filters: { categories },
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[GET /api/blogs]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
