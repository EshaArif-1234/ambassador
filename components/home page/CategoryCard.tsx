'use client';
import Image from 'next/image';

interface CategoryCardProps {
  title: string;
  image: string;
  onSeeMore: () => void;
}

const CategoryCard = ({ title, image, onSeeMore }: CategoryCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="h-48 relative">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <button
          onClick={onSeeMore}
          className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          See More →
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
