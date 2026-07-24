export type SparePartSummary = {
  _id: string;
  slug: string;
  name: string;
  price?: number;
  originalPrice: number;
  stock: number;
  images: string[];
  specifications: Record<string, string>;
  description: string;
};
