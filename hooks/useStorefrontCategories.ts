'use client';

import { useEffect, useState } from 'react';
import {
  fetchStorefrontCategories,
  type StorefrontCategory,
} from '@/lib/storefrontCategories';

export function useStorefrontCategories() {
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const data = await fetchStorefrontCategories();
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}
