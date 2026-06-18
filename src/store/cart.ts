"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, CouponAppliesTo } from "@/types";

export interface AppliedCoupon {
  code: string;
  appliesTo: CouponAppliesTo;
  discountAmount: number;
  shippingPrice?: number;
  total?: number;
}

interface CartState {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  add: (item: CartItem) => void;
  updateQuantity: (productId: string, ml: number, quantity: number) => void;
  remove: (productId: string, ml: number) => void;
  clear: () => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
  clearCoupon: () => void;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      add: (incoming) =>
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.productId === incoming.productId && i.ml === incoming.ml,
          );
          if (idx === -1) {
            return { items: [...state.items, incoming] };
          }
          const next = [...state.items];
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + incoming.quantity,
          };
          return { items: next };
        }),
      updateQuantity: (productId, ml, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId && i.ml === ml
                ? { ...i, quantity: Math.max(1, quantity) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      remove: (productId, ml) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.ml === ml),
          ),
        })),
      clear: () => set({ items: [], appliedCoupon: null }),
      setCoupon: (coupon) => set({ appliedCoupon: coupon }),
      clearCoupon: () => set({ appliedCoupon: null }),
      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
    }),
    {
      name: "perfume_cart_v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
