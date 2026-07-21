'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { PRODUCT_PLACEHOLDER } from '@/utils/productMedia.util';
import type { SparePartSummary } from '@/lib/spareParts.types';

type SparePartsSectionProps = {
  spareParts: SparePartSummary[];
  mainProductName: string;
  /** sidebar = right column desktop; stacked = full-width mobile block */
  variant?: 'sidebar' | 'stacked';
};

function partPrice(part: SparePartSummary) {
  return part.price != null && part.price > 0 ? part.price : part.originalPrice;
}

function formatPrice(part: SparePartSummary) {
  return `PKR ${partPrice(part).toLocaleString()}`;
}

function SparePartRowCard({
  part,
  onAdd,
}: {
  part: SparePartSummary;
  onAdd: () => void;
}) {
  const outOfStock = part.stock <= 0;

  return (
    <article
      tabIndex={0}
      className="group relative aspect-square w-full overflow-hidden rounded-md border border-[#D5D9D9] bg-[#F7F8F8] outline-none transition-shadow hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#007185]/25"
    >
      <Image
        src={part.images[0] ?? PRODUCT_PLACEHOLDER}
        alt={part.name}
        fill
        className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04] group-focus-within:scale-[1.04]"
        sizes="(max-width: 1024px) 50vw, 280px"
      />

      <div
        className="absolute inset-x-0 bottom-0 border-t border-[#D5D9D9] bg-white/95 px-3 py-2.5 backdrop-blur-sm transition-all duration-200 ease-out max-lg:translate-y-0 max-lg:opacity-100 lg:translate-y-full lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100"
      >
        <p
          className="line-clamp-2 text-sm font-semibold leading-snug text-[#007185] sm:text-base"
          title={part.name}
        >
          {part.name}
        </p>
        <p className="mt-0.5 text-[11px] font-bold leading-tight text-gray-900">{formatPrice(part)}</p>
        {outOfStock ? (
          <p className="mt-1 text-[10px] font-medium text-[#B12704]">Out of stock</p>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="mt-1 w-full rounded-full border border-[#FCD200] bg-[#FFD814] px-2 py-1 text-[10px] font-medium leading-tight text-gray-900 shadow-sm transition-colors hover:bg-[#F7CA00]"
          >
            Add to cart
          </button>
        )}
      </div>
    </article>
  );
}

export default function SparePartsSection({
  spareParts,
  mainProductName,
  variant = 'sidebar',
}: SparePartsSectionProps) {
  const { addToCart } = useCart();

  const sorted = useMemo(() => {
    const fromProduct = spareParts.filter((p) => p.source === 'product');
    const fromCategory = spareParts.filter((p) => p.source === 'category');
    return [...fromProduct, ...fromCategory];
  }, [spareParts]);

  if (spareParts.length === 0) return null;

  const handleAdd = (part: SparePartSummary) => {
    addToCart({
      id: part._id,
      title: part.name,
      price: partPrice(part),
      quantity: 1,
      image: part.images[0] ?? PRODUCT_PLACEHOLDER,
      productCode: part.slug,
    });
  };

  const isStacked = variant === 'stacked';

  return (
    <section
      className={`rounded-lg border border-[#D5D9D9] bg-white p-3 shadow-sm sm:p-4 ${
        isStacked ? 'py-6 lg:hidden' : 'hidden lg:block'
      }`}
      aria-label="Compatible spare parts"
    >
      <h2 className="text-base font-bold leading-tight text-gray-900">Compatible spare parts</h2>
      <p className="mt-0.5 text-xs text-gray-600">
        {spareParts.length} for {mainProductName}
      </p>

      <ul className="mt-3 flex flex-col gap-3">
        {sorted.map((part) => (
          <li key={part._id}>
            <SparePartRowCard part={part} onAdd={() => handleAdd(part)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
