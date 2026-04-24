import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { requireAdmin } from '@/backend/lib/adminAuth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/upload
 * Accepts multipart/form-data with a single "file" field.
 * Uploads the image to Cloudinary and returns { url, publicId }.
 * Protected — admin only.
 */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided.' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only JPEG, PNG, WebP, GIF, and AVIF images are allowed.' },
        { status: 400 }
      );
    }

    // 5 MB size limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be under 5 MB.' },
        { status: 400 }
      );
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:        'ambassador/categories',
          resource_type: 'image',
          // Auto-convert to WebP and limit to 800px wide for fast loading
          transformation: [{ width: 800, crop: 'limit', fetch_format: 'auto', quality: 'auto' }],
        },
        (error, uploadResult) => {
          if (error || !uploadResult) return reject(error ?? new Error('Upload failed'));
          resolve(uploadResult);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json(
      { success: true, url: result.secure_url, publicId: result.public_id },
      { status: 200 }
    );
  } catch (error) {
    console.error('[/api/upload]', error);
    return NextResponse.json(
      { success: false, message: 'Image upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
