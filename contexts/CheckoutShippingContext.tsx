'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useCart } from '@/contexts/CartContext';
import { getCheckoutTotals } from '@/utils/checkoutTotals';

type CheckoutShippingState = {
  subtotal: number;
  deliveryCharges: number;
  total: number;
  quoteReady: boolean;
  loading: boolean;
  error: string | null;
};

type CheckoutShippingContextType = CheckoutShippingState & {
  requestQuote: (city: string, address: string) => void;
  resetQuote: () => void;
};

const CheckoutShippingContext = createContext<CheckoutShippingContextType | undefined>(
  undefined,
);

export function useCheckoutShipping() {
  const ctx = useContext(CheckoutShippingContext);
  if (!ctx) {
    throw new Error('useCheckoutShipping must be used within CheckoutShippingProvider');
  }
  return ctx;
}

/** Safe for pages that render OrderSummary outside checkout (e.g. legacy payment page). */
export function useOptionalCheckoutShipping() {
  return useContext(CheckoutShippingContext);
}

export function CheckoutShippingProvider({ children }: { children: ReactNode }) {
  const { cartItems } = useCart();
  const cartSubtotal = useMemo(
    () => getCheckoutTotals(cartItems).subtotal,
    [cartItems],
  );

  const [state, setState] = useState<CheckoutShippingState>({
    subtotal: cartSubtotal,
    deliveryCharges: 0,
    total: cartSubtotal,
    quoteReady: false,
    loading: false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAddressRef = useRef({ city: '', address: '' });

  const resetQuote = useCallback(() => {
    setState({
      subtotal: cartSubtotal,
      deliveryCharges: 0,
      total: cartSubtotal,
      quoteReady: false,
      loading: false,
      error: null,
    });
  }, [cartSubtotal]);

  const fetchQuote = useCallback(
    async (city: string, address: string) => {
      const cityTrim = city.trim();
      const addressTrim = address.trim();
      lastAddressRef.current = { city: cityTrim, address: addressTrim };

      if (!cityTrim || !addressTrim || cartItems.length === 0) {
        resetQuote();
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState((prev) => ({
        ...prev,
        subtotal: cartSubtotal,
        loading: true,
        error: null,
      }));

      try {
        const res = await fetch('/api/shipping/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
            city: cityTrim,
            address: addressTrim,
          }),
          signal: controller.signal,
        });

        const json = (await res.json()) as {
          success?: boolean;
          message?: string;
          subtotal?: number;
          deliveryCharges?: number;
          total?: number;
          quoteReady?: boolean;
        };

        if (!res.ok || !json.success) {
          setState({
            subtotal: cartSubtotal,
            deliveryCharges: 0,
            total: cartSubtotal,
            quoteReady: false,
            loading: false,
            error: json.message || 'Could not calculate shipping.',
          });
          return;
        }

        setState({
          subtotal: Number(json.subtotal) || cartSubtotal,
          deliveryCharges: Number(json.deliveryCharges) || 0,
          total: Number(json.total) || cartSubtotal,
          quoteReady: Boolean(json.quoteReady),
          loading: false,
          error: null,
        });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setState({
          subtotal: cartSubtotal,
          deliveryCharges: 0,
          total: cartSubtotal,
          quoteReady: false,
          loading: false,
          error: 'Could not calculate shipping. Please try again.',
        });
      }
    },
    [cartItems, cartSubtotal, resetQuote],
  );

  const requestQuote = useCallback(
    (city: string, address: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void fetchQuote(city, address);
      }, 400);
    },
    [fetchQuote],
  );

  useEffect(() => {
    const { city, address } = lastAddressRef.current;
    if (city && address) {
      void fetchQuote(city, address);
    } else {
      resetQuote();
    }
  }, [cartItems, cartSubtotal, fetchQuote, resetQuote]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const value = useMemo(
    () => ({
      ...state,
      requestQuote,
      resetQuote,
    }),
    [state, requestQuote, resetQuote],
  );

  return (
    <CheckoutShippingContext.Provider value={value}>
      {children}
    </CheckoutShippingContext.Provider>
  );
}
