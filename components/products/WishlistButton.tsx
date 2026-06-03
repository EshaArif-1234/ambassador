'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useWishlist } from '@/contexts/WishlistContext';

type WishlistButtonProps = {
  productId: string;
  className?: string;
  iconClassName?: string;
  /** Overlay on product image (top-right) */
  variant?: 'overlay' | 'inline';
};

export default function WishlistButton({
  productId,
  className = '',
  iconClassName = 'w-5 h-5',
  variant = 'overlay',
}: WishlistButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const { isWishlisted, toggle } = useWishlist();
  const [busy, setBusy] = useState(false);

  const saved = isWishlisted(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    setBusy(true);
    try {
      await toggle(productId);
    } finally {
      setBusy(false);
    }
  };

  const base =
    variant === 'overlay'
      ? 'absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md border border-gray-100 hover:scale-105 transition-transform'
      : 'inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2.5 hover:border-[#E36630] transition-colors';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`${base} ${saved ? 'text-[#E36630]' : 'text-gray-400 hover:text-[#E36630]'} disabled:opacity-60 ${className}`}
    >
      <svg
        className={iconClassName}
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
