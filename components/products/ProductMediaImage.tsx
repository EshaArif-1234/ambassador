'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  PRODUCT_PLACEHOLDER,
  isNextImageSupportedUrl,
  normalizeMediaUrl,
} from '@/utils/productMedia.util';

type ProductMediaImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

/**
 * Product gallery image with URL normalization and placeholder fallback.
 * Uses native <img> when Next/Image cannot optimize the host (production-safe).
 */
export default function ProductMediaImage({
  src,
  alt,
  className = '',
  fill,
  sizes = '100vw',
  priority,
}: ProductMediaImageProps) {
  const normalized = normalizeMediaUrl(src) ?? PRODUCT_PLACEHOLDER;
  const [displaySrc, setDisplaySrc] = useState(normalized);

  useEffect(() => {
    setDisplaySrc(normalizeMediaUrl(src) ?? PRODUCT_PLACEHOLDER);
  }, [src]);

  const handleError = () => {
    if (displaySrc !== PRODUCT_PLACEHOLDER) setDisplaySrc(PRODUCT_PLACEHOLDER);
  };

  if (fill && isNextImageSupportedUrl(displaySrc)) {
    return (
      <Image
        src={displaySrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={handleError}
      />
    );
  }

  const imgClass = fill
    ? `absolute inset-0 h-full w-full ${className}`
    : className;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      className={imgClass}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
