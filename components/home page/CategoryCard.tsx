'use client';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
  title: string;
  image?: string;
  category?: string;
  onSeeMore?: () => void;
  children?: React.ReactNode;
}

const CategoryCard = ({ title, image, category, children }: CategoryCardProps) => {
  const href = category ? `/subcategories?category=${encodeURIComponent(category)}` : '/subcategories';
  
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="h-48 relative">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            children
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
          <span className="text-orange-500 hover:text-orange-600 font-medium transition-colors inline-block">
            See More →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
