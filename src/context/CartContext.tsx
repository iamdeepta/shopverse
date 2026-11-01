'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { FLAT_SHIPPING, FREE_SHIPPING_THRESHOLD, PROMO_CODE, PROMO_PERCENT, getProduct } from '@/data/aurelle';

export interface CartItem {
  productId: string;
  size: string;
  color: string;
  qty: number;
}

export type CartState = Record<string, CartItem[]>;

interface CartContextValue {
  items: CartState;
  wishlist: string[];
  promo: string | null;
  drawerOpen: boolean;
  lastAddedAt: number;
  setDrawerOpen: (open: boolean) => void;
  addToCart: (storeSlug: string, item: CartItem) => void;
  updateQty: (storeSlug: string, index: number, qty: number) => void;
  removeItem: (storeSlug: string, index: number) => void;
  clearStoreCart: (storeSlug: string) => void;
  toggleWishlist: (productId: string) => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  countFor: (storeSlug: string) => number;
  totalsFor: (storeSlug: string) => {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    freeShippingProgress: number;
    freeShippingRemaining: number;
  };
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'shopverse-cart-v1';

function loadInitial(): { items: CartState; wishlist: string[]; promo: string | null } {
  if (typeof window === 'undefined') return { items: {}, wishlist: [], promo: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: {}, wishlist: [], promo: null };
    const parsed = JSON.parse(raw);
    return {
      items: parsed.items ?? {},
      wishlist: parsed.wishlist ?? [],
      promo: parsed.promo ?? null,
    };
  } catch {
    return { items: {}, wishlist: [], promo: null };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartState>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [promo, setPromo] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAddedAt, setLastAddedAt] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = loadInitial();
    setItems(initial.items);
    setWishlist(initial.wishlist);
    setPromo(initial.promo);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, wishlist, promo }));
    } catch {
      /* storage full or unavailable — cart still works in memory */
    }
  }, [items, wishlist, promo, hydrated]);

  const addToCart = useCallback((storeSlug: string, item: CartItem) => {
    setItems((prev) => {
      const list = [...(prev[storeSlug] ?? [])];
      const idx = list.findIndex(
        (i) => i.productId === item.productId && i.size === item.size && i.color === item.color,
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], qty: Math.min(9, list[idx].qty + item.qty) };
      } else {
        list.push(item);
      }
      return { ...prev, [storeSlug]: list };
    });
    setLastAddedAt(Date.now());
    setDrawerOpen(true);
  }, []);

  const updateQty = useCallback((storeSlug: string, index: number, qty: number) => {
    setItems((prev) => {
      const list = [...(prev[storeSlug] ?? [])];
      if (qty <= 0) list.splice(index, 1);
      else list[index] = { ...list[index], qty: Math.min(9, qty) };
      return { ...prev, [storeSlug]: list };
    });
  }, []);

  const removeItem = useCallback((storeSlug: string, index: number) => {
    setItems((prev) => {
      const list = [...(prev[storeSlug] ?? [])];
      list.splice(index, 1);
      return { ...prev, [storeSlug]: list };
    });
  }, []);

  const clearStoreCart = useCallback((storeSlug: string) => {
    setItems((prev) => {
      const next = { ...prev };
      delete next[storeSlug];
      return next;
    });
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  }, []);

  const applyPromo = useCallback((code: string) => {
    if (code.trim().toUpperCase() === PROMO_CODE) {
      setPromo(PROMO_CODE);
      return true;
    }
    return false;
  }, []);

  const removePromo = useCallback(() => setPromo(null), []);

  const countFor = useCallback(
    (storeSlug: string) => (items[storeSlug] ?? []).reduce((n, i) => n + i.qty, 0),
    [items],
  );

  const totalsFor = useCallback(
    (storeSlug: string) => {
      const list = items[storeSlug] ?? [];
      const subtotal = list.reduce((sum, i) => {
        const p = getProduct(i.productId);
        return sum + (p ? p.price * i.qty : 0);
      }, 0);
      const discount = promo === PROMO_CODE ? Math.round(subtotal * (PROMO_PERCENT / 100) * 100) / 100 : 0;
      const afterDiscount = subtotal - discount;
      const shipping = list.length === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
      const total = afterDiscount + shipping;
      return {
        subtotal,
        discount,
        shipping,
        total,
        freeShippingProgress: Math.min(1, afterDiscount / FREE_SHIPPING_THRESHOLD),
        freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount),
      };
    },
    [items, promo],
  );

  const value = useMemo(
    () => ({
      items,
      wishlist,
      promo,
      drawerOpen,
      lastAddedAt,
      setDrawerOpen,
      addToCart,
      updateQty,
      removeItem,
      clearStoreCart,
      toggleWishlist,
      applyPromo,
      removePromo,
      countFor,
      totalsFor,
    }),
    [items, wishlist, promo, drawerOpen, lastAddedAt, addToCart, updateQty, removeItem, clearStoreCart, toggleWishlist, applyPromo, removePromo, countFor, totalsFor],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
