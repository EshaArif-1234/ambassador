import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';

const ALLOWED_IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

function ensureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Upload service not configured.');
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

/** Upload an image buffer to Cloudinary (server-side). */
export function uploadImageBuffer(
  buffer: Buffer,
  mimeType: string,
  folder = 'ambassador/spare-parts/images',
): Promise<{ url: string; publicId: string }> {
  if (!ALLOWED_IMAGES.has(mimeType)) {
    return Promise.reject(new Error('Only JPEG, PNG, or WebP images are allowed.'));
  }

  ensureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 1200, crop: 'limit', fetch_format: 'auto', quality: 'auto' }],
      },
      (error: Error | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error ?? new Error('Upload failed.'));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}
