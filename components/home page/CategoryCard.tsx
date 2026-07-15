'use client';

import Link from 'next/link';
import { PRODUCTS_PATH, productsHref, productsCategoryPath } from '@/lib/siteRoutes';

interface CategoryCardProps {
  title: string;
  image?: string;
  category?: string;
  categorySlug?: string;
  onSeeMore?: () => void;
  children?: React.ReactNode;
}

const CategoryCard = ({ title, image, category, categorySlug, children }: CategoryCardProps) => {
  const href = categorySlug
    ? productsCategoryPath(categorySlug)
    : category
      ? productsHref({ category })
      : PRODUCTS_PATH;

  return (
    <Link href={href} className="block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl sm:rounded-xl">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-white">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-contain object-center"
            />
          ) : (
            children
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center p-3 sm:p-4">          <h3 className="mb-1.5 line-clamp-2 text-center text-lg font-semibold leading-snug text-[#0F4C69] sm:mb-2 sm:text-xl md:text-2xl md:leading-tight lg:text-[28px] lg:leading-[40px]">
            {title}
          </h3>
          <div className="flex justify-center">
            <span className="inline-block text-center text-xs font-medium text-[#E36630] transition-colors hover:text-[#E36630]/80 sm:text-sm">
              See More →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
