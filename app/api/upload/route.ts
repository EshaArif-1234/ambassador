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

    const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const allowedVideos = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi'];
    const isVideo = allowedVideos.includes(file.type);
    const isImage = allowedImages.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, message: 'Only JPEG, PNG, WebP images or MP4, WebM, MOV videos are allowed.' },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: isVideo ? 'Video must be under 50 MB.' : 'Image must be under 5 MB.' },
        { status: 400 }
      );
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        isVideo
          ? {
              folder:        'ambassador/products/videos',
              resource_type: 'video',
            }
          : {
              folder:        'ambassador/products/images',
              resource_type: 'image',
              transformation: [{ width: 1000, crop: 'limit', fetch_format: 'auto', quality: 'auto' }],
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
