"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  itemsBySlug: Record<string, CartItem[]>;
  add: (slug: string, dish: { dishId: string; name: string; price: number }) => void;
  remove: (slug: string, dishId: string) => void;
  setQty: (slug: string, dishId: string, qty: number) => void;
  clear: (slug: string) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      itemsBySlug: {},
      add: (slug, dish) =>
        set((s) => {
          const cur = s.itemsBySlug[slug] ?? [];
          const idx = cur.findIndex((i) => i.dishId === dish.dishId);
          const next = [...cur];
          if (idx >= 0) next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
          else next.push({ ...dish, quantity: 1 });
          return { itemsBySlug: { ...s.itemsBySlug, [slug]: next } };
        }),
      remove: (slug, dishId) =>
        set((s) => ({
          itemsBySlug: {
            ...s.itemsBySlug,
            [slug]: (s.itemsBySlug[slug] ?? []).filter((i) => i.dishId !== dishId),
          },
        })),
      setQty: (slug, dishId, qty) =>
        set((s) => {
          const cur = s.itemsBySlug[slug] ?? [];
          const next = cur
            .map((i) => (i.dishId === dishId ? { ...i, quantity: Math.max(0, qty) } : i))
            .filter((i) => i.quantity > 0);
          return { itemsBySlug: { ...s.itemsBySlug, [slug]: next } };
        }),
      clear: (slug) =>
        set((s) => ({
          itemsBySlug: { ...s.itemsBySlug, [slug]: [] },
        })),
    }),
    {
      name: "qr-cart-v1",
    },
  ),
);

export function selectCartItems(slug: string) {
  return (s: CartState) => s.itemsBySlug[slug] ?? [];
}
