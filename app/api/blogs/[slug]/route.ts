import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/db';
import BlogPost from '@/backend/models/BlogPost.model';
import { toBlogPost } from '@/backend/lib/blogPosts';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await connectDB();
    const { slug } = await params;
    const clean = slug.trim().toLowerCase();
    if (!clean) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    const doc = await BlogPost.findOne({ slug: clean, status: 'active' }).lean();
    if (!doc) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: toBlogPost(doc as never) });
  } catch (error) {
    console.error('[GET /api/blogs/[slug]]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
