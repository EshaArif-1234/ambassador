import { cloudinaryUrlFromPublicId, normalizeMediaUrl } from '@/utils/productMedia.util';

export type AdminMediaSlot = {
  url: string;
  file: File | null;
  preview: string;
  publicId: string;
};

export function emptyMediaSlot(): AdminMediaSlot {
  return { url: '', file: null, preview: '', publicId: '' };
}

export function initMediaSlot(url?: string, publicId?: string): AdminMediaSlot {
  const normalized =
    normalizeMediaUrl(url) || cloudinaryUrlFromPublicId(publicId, 'image') || '';
  return {
    url: normalized,
    file: null,
    preview: normalized,
    publicId: publicId || '',
  };
}

export function isActiveMediaSlot(slot: AdminMediaSlot): boolean {
  return Boolean(slot.file || slot.url || slot.publicId);
}
