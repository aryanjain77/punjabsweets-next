"use client";

import React from "react";
import type { Product } from "../lib/types";
import { useCart } from "../context/CartContext";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const { addItem } = useCart();

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white/70 p-4 shadow-sm ring-1 ring-amber-100 backdrop-blur-md transition hover:-translate-y-1 hover:shadow-xl">
      {product.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.name}
          className="mb-3 h-40 w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105"
        />
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
                {product.category}
              </p>
            )}
          </div>
          <p className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
            ₹{product.price}
          </p>
        </div>
        {product.description && (
          <p className="line-clamp-2 text-xs text-zinc-600">
            {product.description}
          </p>
        )}
        <button
          type="button"
          onClick={() => addItem(product.id)}
          disabled={!product.isAvailable}
          className="mt-3 inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {product.isAvailable ? "Add to cart" : "Currently unavailable"}
        </button>
      </div>
    </div>
  );
}
