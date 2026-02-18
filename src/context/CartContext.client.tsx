"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "../lib/types";

type CartContextValue = {
  items: CartItem[];
  products: Product[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "punjab-sweets-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Ensure server and first client render are identical: always start empty.
    // We read from localStorage later in an effect.
    return [];
  });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Defer reading localStorage + setState to after paint so the effect
    // updates external state based on the latest React state, which keeps
    // the linter happy and avoids cascading renders.
    const id = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setItems(JSON.parse(stored) as CartItem[]);
        }
      } catch {
        // ignore
      }
    });

    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data = await res.json();
        setProducts(data.products ?? []);
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return sum;
      return sum + product.price * item.quantity;
    }, 0);
  }, [items, products]);

  const value: CartContextValue = {
    items,
    products,
    addItem: (productId) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [...prev, { productId, quantity: 1 }];
      });
    },
    removeItem: (productId) => {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    },
    setQuantity: (productId, quantity) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          )
        );
      }
    },
    clearCart: () => setItems([]),
    subtotal,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
