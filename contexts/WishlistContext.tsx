'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useUser } from '@/contexts/UserContext';

interface WishlistContextType {
  productIds: Set<string>;
  count: number;
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  refresh: () => Promise<void>;
  add: (productId: string) => Promise<boolean>;
  remove: (productId: string) => Promise<boolean>;
  toggle: (productId: string) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useUser();
  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setProductIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', { credentials: 'include' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.productIds)) {
        setProductIds(new Set(json.data.productIds as string[]));
      }
    } catch {
      /* keep previous state */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProductIds(new Set());
      return;
    }
    refresh();
  }, [user, authLoading, refresh]);

  const add = useCallback(
    async (productId: string) => {
      if (!user) return false;
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const json = await res.json();
      if (!json.success) return false;
      const ids = (json.data?.productIds as string[] | undefined) ?? [];
      setProductIds(new Set(ids.length ? ids : [...productIds, productId]));
      return true;
    },
    [user, productIds]
  );

  const remove = useCallback(
    async (productId: string) => {
      if (!user) return false;
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) return false;
      setProductIds(new Set(json.data?.productIds ?? []));
      return true;
    },
    [user]
  );

  const isWishlisted = useCallback(
    (productId: string) => productIds.has(productId),
    [productIds]
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (productIds.has(productId)) {
        return remove(productId);
      }
      return add(productId);
    },
    [add, remove, productIds]
  );

  const value = useMemo(
    () => ({
      productIds,
      count: productIds.size,
      loading,
      isWishlisted,
      refresh,
      add,
      remove,
      toggle,
    }),
    [productIds, loading, isWishlisted, refresh, add, remove, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
