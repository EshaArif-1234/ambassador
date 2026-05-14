import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/backend/lib/adminAuth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * GET /api/upload/signature
 * Returns a signed upload credential so the browser can upload directly
 * to Cloudinary — completely bypassing the Next.js body-size limit.
 */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const folder       = searchParams.get('folder')        ?? 'ambassador/products';
  const resourceType = searchParams.get('resource_type') ?? 'image';

  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign: Record<string, string | number> = { timestamp, folder };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    success:      true,
    signature,
    timestamp,
    apiKey:       process.env.CLOUDINARY_API_KEY,
    cloudName:    process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    resourceType,
  });
}
