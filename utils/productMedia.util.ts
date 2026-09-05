/** Default product image when none available or load fails. */
export const PRODUCT_PLACEHOLDER = '/Images/installed.webp';

const NEXT_IMAGE_HOSTS = new Set([
  'res.cloudinary.com',
  'picsum.photos',
  'via.placeholder.com',
]);

export type ProductMediaItem = {
  kind: 'image' | 'video';
  src: string;
  /** Stable index in the combined gallery list */
  index: number;
};

/** Normalize image/video URLs for browser + Next/Image. */
export function normalizeMediaUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  let trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('//')) trimmed = `https:${trimmed}`;
  if (trimmed.startsWith('http://')) {
    if (trimmed.includes('res.cloudinary.com')) {
      trimmed = trimmed.replace(/^http:\/\//i, 'https://');
    }
  }

  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  return null;
}

function cloudNameFromEnv(): string | undefined {
  return (
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim()
  );
}

/** Build a Cloudinary delivery URL from a stored public_id. */
export function cloudinaryUrlFromPublicId(
  publicId: unknown,
  resourceType: 'image' | 'video' = 'image',
  cloudName?: string
): string | null {
  const id = typeof publicId === 'string' ? publicId.trim().replace(/^\//, '') : '';
  const cloud = (cloudName ?? cloudNameFromEnv())?.trim();
  if (!id || !cloud) return null;
  if (resourceType === 'video') {
    return `https://res.cloudinary.com/${cloud}/video/upload/f_mp4,q_auto/${id}`;
  }
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto/${id}`;
}

/** Ensure Cloudinary video URLs play in HTML5 <video> across browsers. */
export function normalizeCloudinaryVideoUrl(url: string): string {
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return url;
  if (url.includes('/f_mp4') || url.includes('/f_m3u8')) return url;
  return url.replace('/video/upload/', '/video/upload/f_mp4,q_auto/');
}

function mediaDedupeKey(url: string): string {
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const match = url.match(/\/upload\/(?:[^/]+\/)*(?:v\d+\/)?(.+)$/i);
    if (match?.[1]) return match[1].replace(/\.[a-z0-9]+$/i, '');
  }
  return url;
}

/**
 * Pair stored URLs with public_ids by slot index (admin saves up to 3 images + 2 videos).
 * Prefers the stored URL per slot; falls back to rebuilding from public_id when URL is missing.
 */
function resolveMediaSlots(
  urls: unknown,
  publicIds: unknown,
  resourceType: 'image' | 'video',
  cloudName?: string
): string[] {
  const urlArr = Array.isArray(urls) ? urls : [];
  const pidArr = Array.isArray(publicIds) ? publicIds : [];
  const slotCount = Math.max(urlArr.length, pidArr.length);
  const seen = new Set<string>();
  const out: string[] = [];

  for (let i = 0; i < slotCount; i++) {
    const fromUrl = normalizeMediaUrl(urlArr[i]);
    const fromPid = cloudinaryUrlFromPublicId(pidArr[i], resourceType, cloudName);
    let chosen = fromUrl || fromPid;
    if (!chosen) continue;
    if (resourceType === 'video') chosen = normalizeCloudinaryVideoUrl(chosen);

    const key = mediaDedupeKey(chosen);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(chosen);
  }

  return out;
}

/** Resolve all product images (up to 3 slots) for storefront display. */
export function resolveProductImages(input: {
  images?: unknown;
  imagePublicIds?: unknown;
  cloudName?: string;
}): string[] {
  return resolveMediaSlots(input.images, input.imagePublicIds, 'image', input.cloudName);
}

/** Resolve all product videos (up to 2 slots) for storefront display. */
export function resolveProductVideos(input: {
  videos?: unknown;
  videoPublicIds?: unknown;
  cloudName?: string;
}): string[] {
  return resolveMediaSlots(input.videos, input.videoPublicIds, 'video', input.cloudName);
}

/** Combined gallery items for product detail slider. */
export function buildProductMediaItems(
  images: string[],
  videos: string[]
): ProductMediaItem[] {
  const items: ProductMediaItem[] = [];
  let index = 0;

  const imgs = images.length ? images : [PRODUCT_PLACEHOLDER];
  for (const src of imgs) {
    items.push({ kind: 'image', src, index });
    index += 1;
  }
  for (const src of videos) {
    items.push({ kind: 'video', src, index });
    index += 1;
  }

  return items;
}

export function isNextImageSupportedUrl(src: string): boolean {
  if (src.startsWith('/')) return true;
  try {
    const host = new URL(src).hostname;
    return NEXT_IMAGE_HOSTS.has(host);
  } catch {
    return false;
  }
}

/** Cloudinary video thumbnail (first frame) for thumb strip. */
export function cloudinaryVideoThumbnail(videoUrl: string): string {
  if (!videoUrl.includes('res.cloudinary.com') || !videoUrl.includes('/upload/')) {
    return videoUrl;
  }
  return videoUrl
    .replace('/upload/', '/upload/so_0,w_320,h_320,c_fill,f_jpg/')
    .replace(/\.[^.]+$/, '.jpg');
}
