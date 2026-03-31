"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "../lib/types";

type CartContextValue = {
  items: CartItem[];
  products: Product[];
  addItem: (productId: string, variantId?: string, unitPrice?: number, variantName?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  setQuantity: (productId: string, quantity: number, variantId?: string) => void;
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
        console.log('[CartContext] Fetching products...');
        const res = await fetch("/api/products");
        if (!res.ok) {
          console.error('[CartContext] Products fetch failed:', res.status);
          return;
        }
        const data = await res.json();
        const loadedProducts = data.products ?? [];

        // Diagnostic: check if any products have variants
        const productsWithVariants = loadedProducts.filter((p: any) => p.variants?.length > 0);
        const productsWithoutVariants = loadedProducts.filter((p: any) => !p.variants || p.variants.length === 0);

        console.log('[CartContext] Products loaded:', {
          total: loadedProducts.length,
          withVariants: productsWithVariants.length,
          withoutVariants: productsWithoutVariants.length,
          noVariantProducts: productsWithoutVariants.map((p: any) => p.name),
        });

        setProducts(loadedProducts);
      } catch (err) {
        console.error('[CartContext] Error loading products:', err);
      }
    }
    load();
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const unitPrice = item.unitPrice ?? 0;
      return sum + unitPrice * item.quantity;
    }, 0);
  }, [items]);

  const value: CartContextValue = {
    items,
    products,
    addItem: (productId, variantId, unitPrice, variantName) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.productId === productId && i.variantId === variantId
        );
        if (existing) {
          return prev.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? {
                  ...i,
                  quantity: i.quantity + 1,
                  variantName: i.variantName || variantName,
                  unitPrice: unitPrice ?? i.unitPrice,
                }
              : i
          );
        }
        return [...prev, { productId, variantId, variantName, unitPrice: unitPrice ?? 0, quantity: 1 }];
      });
    },
    removeItem: (productId, variantId) => {
      setItems((prev) =>
        prev.filter((i) => {
          if (variantId) {
            return !(i.productId === productId && i.variantId === variantId);
          }
          return i.productId !== productId;
        })
      );
    },
    setQuantity: (productId, quantity, variantId) => {
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter((i) => {
            if (variantId) {
              return !(i.productId === productId && i.variantId === variantId);
            }
            return i.productId !== productId;
          })
        );
      } else {
        setItems((prev) =>
          prev.map((i) => {
            const isMatching = i.productId === productId && (variantId ? i.variantId === variantId : !i.variantId);
            return isMatching ? { ...i, quantity } : i;
          })
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
