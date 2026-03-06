'use client';

import Image from 'next/image';
import Link from 'next/link';

interface SubCategoryCardProps {
  title: string;
  image: string;
  productCount?: number;
}

const SubCategoryCard = ({ title, image, productCount = 0 }: SubCategoryCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href="/products" className="block relative h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Product count badge */}
        {productCount > 0 && (
          <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
            {productCount} Products
          </div>
        )}
        
        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
        </div>
      </Link>
    </div>
  );
};

export default SubCategoryCard;
