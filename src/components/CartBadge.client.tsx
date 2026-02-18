'use client';

import Link from "next/link";
import { useCart } from "../context/CartContext";

export function CartBadge() {
  const { items, subtotal } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  if (count === 0) return null;

  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:bg-zinc-800"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[11px] font-bold text-zinc-900">
        {count}
      </span>
      <span>Cart · ₹{subtotal}</span>
    </Link>
  );
}
