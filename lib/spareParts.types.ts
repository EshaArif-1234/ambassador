import type { SparePartVariant } from '@/lib/sparePartVariants.util';

export type SparePartSummary = {
  _id: string;
  slug: string;
  name: string;
  price?: number;
  originalPrice: number;
  stock: number;
  variants: SparePartVariant[];
  images: string[];
  specifications: Record<string, string>;
  description: string;
};
