/** Default product image when none available or load fails. */
export const PRODUCT_PLACEHOLDER = '/Images/home/stainless-steal.webp';

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
  const type = resourceType === 'video' ? 'video' : 'image';
  return `https://res.cloudinary.com/${cloud}/${type}/upload/f_auto,q_auto/${id}`;
}

/** Merge stored URLs + public_ids into a deduped image list for this product only. */
export function resolveProductImages(input: {
  images?: unknown;
  imagePublicIds?: unknown;
  cloudName?: string;
}): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const add = (url: string | null) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };

  if (Array.isArray(input.images)) {
    for (const raw of input.images) add(normalizeMediaUrl(raw));
  }
  if (Array.isArray(input.imagePublicIds)) {
    for (const pid of input.imagePublicIds) {
      add(cloudinaryUrlFromPublicId(pid, 'image', input.cloudName));
    }
  }

  return out;
}

export function resolveProductVideos(input: {
  videos?: unknown;
  videoPublicIds?: unknown;
  cloudName?: string;
}): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const add = (url: string | null) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };

  if (Array.isArray(input.videos)) {
    for (const raw of input.videos) add(normalizeMediaUrl(raw));
  }
  if (Array.isArray(input.videoPublicIds)) {
    for (const pid of input.videoPublicIds) {
      add(cloudinaryUrlFromPublicId(pid, 'video', input.cloudName));
    }
  }

  return out;
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
