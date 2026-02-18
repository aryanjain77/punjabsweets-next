import Link from "next/link";
import { CartView } from "@/components/CartView";
import { SHOP_CONFIG } from "@/config/shop";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900">
            <span>←</span>
            Back to menu
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Your Order</h1>
          <div className="w-8" />
        </div>

        <CartView />

        <div className="mt-8 rounded-2xl bg-white/80 p-4 ring-1 ring-amber-100 backdrop-blur-md sm:p-6">
          <div className="space-y-2 text-xs text-zinc-600">
            <p>
              <span className="font-semibold">Min order:</span> ₹{SHOP_CONFIG.minOrderTotal}
            </p>
            <p>
              <span className="font-semibold">Delivery:</span> Up to {SHOP_CONFIG.maxOrderDistanceKm} km
            </p>
            <p>
              <span className="font-semibold">Payment:</span> UPI (manual verification)
            </p>
            <p>
              <span className="font-semibold">Contact:</span> {SHOP_CONFIG.contactPhone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
