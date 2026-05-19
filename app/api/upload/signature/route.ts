import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/backend/lib/adminAuth';

export const runtime = 'nodejs';

/**
 * POST /api/upload/signature
 * Returns a short-lived Cloudinary signed-upload credential so the browser
 * can upload directly to Cloudinary without routing the file through the
 * Next.js server.  Only the timestamp + signature travel over the wire;
 * api_secret never leaves the server.
 */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return NextResponse.json(
      { success: false, message: 'Upload service not configured.' },
      { status: 500 }
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  const body       = await req.json().catch(() => ({}));
  const resourceType: 'image' | 'video' = body.resourceType === 'video' ? 'video' : 'image';
  const folder     = resourceType === 'video'
    ? 'ambassador/products/videos'
    : 'ambassador/products/images';

  const timestamp  = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = { folder, timestamp };

  // Only images get auto-quality/format transformation on upload
  if (resourceType === 'image') {
    paramsToSign.transformation = 'c_limit,w_1920,f_auto,q_auto';
  }

  const signature  = cloudinary.utils.api_sign_request(paramsToSign, CLOUDINARY_API_SECRET);

  return NextResponse.json({
    success:      true,
    signature,
    timestamp,
    apiKey:       CLOUDINARY_API_KEY,
    cloudName:    CLOUDINARY_CLOUD_NAME,
    folder,
    resourceType,
  });
}
