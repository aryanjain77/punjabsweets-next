"use client";

import React from "react";
import type { Product } from "../lib/types";
import { useCart } from "../context/CartContext";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : undefined
  );

  const selectedVariant = selectedVariantId
    ? product.variants?.find((v) => v.id === selectedVariantId)
    : undefined;
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;

  React.useEffect(() => {
    // Debug: log if product doesn't have variants
    if (!product.variants || product.variants.length === 0) {
      console.warn(`Product "${product.name}" has no variants`);
    }
  }, [product]);

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
            {product.variants && product.variants.length > 0 && (
              <select
                value={selectedVariantId || product.variants[0]?.id || ''}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedVariantId(newId);
                  console.log(`[ProductCard] Variant selected for ${product.name}:`, {
                    variantId: newId,
                    variantName: product.variants?.find((v) => v.id === newId)?.name,
                  });
                }}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs"
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} - ₹{variant.price}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
            ₹{displayPrice}
          </p>
        </div>
        {product.description && (
          <p className="line-clamp-2 text-xs text-zinc-600">
            {product.description}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            // Always pass variant info if available, even if it's the default variant
            const variantId = selectedVariant?.id;
            const variantName = selectedVariant?.name;
            const variantPrice = selectedVariant?.price ?? product.price;

            console.log(`[ProductCard] Adding to cart: ${product.name}`, {
              variantId,
              variantName,
              variantPrice,
            });

            addItem(product.id, variantId, variantPrice, variantName);
          }}
          disabled={!product.isAvailable}
          className="mt-3 inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {product.isAvailable ? "Add to cart" : "Currently unavailable"}
        </button>
      </div>
    </div>
  );
}
