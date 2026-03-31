"use client";

import React from "react";
import { useCart } from "../context/CartContext";
import { ProductCard } from "./ProductCard";

export function ProductsGrid() {
  const { products } = useCart();

  if (!products || products.length === 0) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[260px] rounded-3xl bg-white/50 ring-1 ring-amber-100 backdrop-blur-md animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

