import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import Busboy from 'busboy';
import { Readable } from 'stream';
import { requireAdmin } from '@/backend/lib/adminAuth';

/**
 * WHY STREAMING?
 * Next.js App Router buffers the entire body when you call req.formData(),
 * applying a ~4 MB hard limit before route code runs — causing 413 errors
 * for large video uploads. By accessing req.body as a raw ReadableStream
 * and piping it through busboy → Cloudinary upload_stream, the file is
 * never fully buffered in memory and there is no size limit.
 *
 * All Cloudinary credentials stay on the server — nothing is exposed to
 * the browser.
 */

export const runtime = 'nodejs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const ALLOWED_VIDEOS = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi']);

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ success: false, message: 'Expected multipart/form-data.' }, { status: 400 });
  }

  if (!req.body) {
    return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
  }

  return new Promise<NextResponse>((resolve) => {
    let settled = false;
    const finish = (res: NextResponse) => {
      if (!settled) { settled = true; resolve(res); }
    };

    const busboy = Busboy({ headers: { 'content-type': contentType } });

    busboy.on('file', (_field, fileStream, { mimeType }) => {
      const isVideo = ALLOWED_VIDEOS.has(mimeType);
      const isImage = ALLOWED_IMAGES.has(mimeType);

      if (!isImage && !isVideo) {
        fileStream.resume(); // drain so busboy doesn't hang
        finish(NextResponse.json(
          { success: false, message: 'Only JPEG, PNG, WebP images or MP4, WebM, MOV videos are allowed.' },
          { status: 400 }
        ));
        return;
      }

      const uploadOptions = isVideo
        ? { folder: 'ambassador/products/videos', resource_type: 'video' as const }
        : {
            folder: 'ambassador/products/images',
            resource_type: 'image' as const,
            transformation: [{ width: 1000, crop: 'limit' as const, fetch_format: 'auto', quality: 'auto' }],
          };

      const cloudStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: Error | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            console.error('[/api/upload] Cloudinary error:', error);
            finish(NextResponse.json({ success: false, message: 'Upload failed. Please try again.' }, { status: 500 }));
          } else {
            finish(NextResponse.json({ success: true, url: result.secure_url, publicId: result.public_id }));
          }
        }
      );

      fileStream.pipe(cloudStream);
      fileStream.on('error', (err) => {
        console.error('[/api/upload] file stream error:', err);
        finish(NextResponse.json({ success: false, message: 'File read error.' }, { status: 500 }));
      });
    });

    busboy.on('error', (err) => {
      console.error('[/api/upload] busboy error:', err);
      finish(NextResponse.json({ success: false, message: 'Upload processing failed.' }, { status: 500 }));
    });

    // Read the full body as an ArrayBuffer, then wrap in a Node.js Readable.
    // This is more reliable in serverless environments (Vercel, etc.) where
    // req.body may already be buffered and cannot be streamed chunk-by-chunk.
    req.arrayBuffer()
      .then(ab => {
        const nodeStream = Readable.from(Buffer.from(ab));
        nodeStream.pipe(busboy);
        nodeStream.on('error', (err) => {
          console.error('[/api/upload] stream error:', err);
          finish(NextResponse.json({ success: false, message: 'Stream error.' }, { status: 500 }));
        });
      })
      .catch(err => {
        console.error('[/api/upload] arrayBuffer error:', err);
        finish(NextResponse.json({ success: false, message: 'Failed to read uploaded file.' }, { status: 500 }));
      });
  });
}
