import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import Busboy from 'busboy';
import { Readable } from 'stream';
import { requireAdmin } from '@/backend/lib/adminAuth';

export const runtime = 'nodejs';

const ALLOWED_IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const ALLOWED_VIDEOS = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi']);

function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET });
  return true;
}

function getUploadOptions(mimeType: string) {
  const isVideo = ALLOWED_VIDEOS.has(mimeType);
  const isImage = ALLOWED_IMAGES.has(mimeType);
  if (!isImage && !isVideo) return null;
  return isVideo
    ? { folder: 'ambassador/products/videos', resource_type: 'video' as const }
    : { folder: 'ambassador/products/images', resource_type: 'image' as const,
        transformation: [{ width: 1000, crop: 'limit' as const, fetch_format: 'auto', quality: 'auto' }] };
}

function uploadBufferToCloudinary(
  buffer: Buffer,
  mimeType: string
): Promise<NextResponse> {
  const options = getUploadOptions(mimeType);
  if (!options) {
    return Promise.resolve(
      NextResponse.json({ success: false, message: 'Only JPEG, PNG, WebP images or MP4, WebM, MOV videos are allowed.' }, { status: 400 })
    );
  }

  return new Promise((resolve) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error: Error | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error('[/api/upload] Cloudinary error:', error);
          resolve(NextResponse.json({ success: false, message: 'Upload failed. Please try again.' }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ success: true, url: result.secure_url, publicId: result.public_id }));
        }
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

function uploadViaFormData(req: NextRequest): Promise<NextResponse> {
  return req.formData().then(async (form) => {
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    return uploadBufferToCloudinary(buffer, file.type);
  });
}

function uploadViaBusboy(req: NextRequest, contentType: string): Promise<NextResponse> {
  return req.arrayBuffer().then((ab) => {
    const buffer = Buffer.from(ab);

    return new Promise<NextResponse>((resolve) => {
      let settled = false;
      const finish = (res: NextResponse) => { if (!settled) { settled = true; resolve(res); } };

      const busboy = Busboy({ headers: { 'content-type': contentType } });

      busboy.on('file', (_field, fileStream, { mimeType }) => {
        const chunks: Buffer[] = [];
        fileStream.on('data', (chunk: Buffer) => chunks.push(chunk));
        fileStream.on('end', () => {
          const fileBuffer = Buffer.concat(chunks);
          uploadBufferToCloudinary(fileBuffer, mimeType).then(finish);
        });
        fileStream.on('error', (err) => {
          console.error('[/api/upload] busboy file error:', err);
          finish(NextResponse.json({ success: false, message: 'File read error.' }, { status: 500 }));
        });
      });

      busboy.on('error', (err) => {
        console.error('[/api/upload] busboy error:', err);
        finish(NextResponse.json({ success: false, message: 'Upload processing failed.' }, { status: 500 }));
      });

      const nodeStream = Readable.from(buffer);
      nodeStream.pipe(busboy);
    });
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  // Validate Cloudinary env vars — common cause of 500 on live servers
  if (!configureCloudinary()) {
    console.error('[/api/upload] Cloudinary env vars are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET on the server.');
    return NextResponse.json(
      { success: false, message: 'Server configuration error: upload service not configured. Contact the administrator.' },
      { status: 500 }
    );
  }

  const contentType = req.headers.get('content-type') ?? '';

  try {
    // Primary: standard formData (works reliably in serverless for files under the platform limit)
    return await uploadViaFormData(req);
  } catch {
    // Fallback: busboy streaming (handles edge cases where formData fails)
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
    }
    try {
      return await uploadViaBusboy(req, contentType);
    } catch (err) {
      console.error('[/api/upload] fallback error:', err);
      return NextResponse.json({ success: false, message: 'Upload failed. Please try again.' }, { status: 500 });
    }
  }
}
