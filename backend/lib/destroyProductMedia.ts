import { v2 as cloudinary } from 'cloudinary';

type ProductMedia = {
  imagePublicIds?: string[];
  videoPublicIds?: string[];
};

/** Best-effort Cloudinary cleanup for one product (images + videos). */
export async function destroyProductMedia(product: ProductMedia): Promise<void> {
  const imageIds = (product.imagePublicIds ?? []).filter(Boolean);
  const videoIds = (product.videoPublicIds ?? []).filter(Boolean);
  await Promise.allSettled([
    ...imageIds.map((pid) => cloudinary.uploader.destroy(pid)),
    ...videoIds.map((pid) => cloudinary.uploader.destroy(pid, { resource_type: 'video' })),
  ]);
}
