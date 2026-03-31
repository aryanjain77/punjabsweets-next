import Link from "next/link";
import { SHOP_CONFIG } from "../config/shop";
import { ProductCard } from "../components/ProductCard";
import { CartBadge } from "../components/CartBadge";
import { SectionHeader } from "../components/SectionHeader";
import { ProductsGrid } from "../components/ProductsGrid.client";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-200 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-200 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-orange-200 via-transparent to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="sticky top-0 z-30 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white/80 p-3 shadow-lg backdrop-blur backdrop-saturate-150 shadow-amber-100/60">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-lg font-black text-white shadow-lg">
              PS
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-900 to-rose-900 bg-clip-text text-transparent">
                {SHOP_CONFIG.shopName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">{SHOP_CONFIG.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 font-light text-amber-50">
            <CartBadge />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-10 pb-12">
          {/* Hero Section - Glassmorphism */}
          <section className="grid gap-6 sm:gap-8 rounded-3xl bg-white/30 backdrop-blur-xl p-6 sm:p-8 shadow-2xl ring-1 ring-white/20 border border-white/40 sm:grid-cols-[1.5fr,1fr] animate-in fade-in slide-in-from-bottom duration-500">
            <div className="space-y-4 sm:space-y-6">
              <p className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-100/80 to-rose-100/80 backdrop-blur-sm px-4 py-2 text-xs sm:text-sm font-semibold text-amber-900 ring-1 ring-amber-200/50">
                🎂 Fresh, handcrafted sweets · Same-day delivery nearby
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-tight">
                Celebrate every moment with{" "}
                <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-600 bg-clip-text text-transparent">
                  authentic Punjabi mithai
                </span>
                .
              </h2>
              <p className="max-w-xl text-sm sm:text-base text-gray-700 leading-relaxed">
                Choose your favourites, pay via UPI, and let us do the rest. Your order is only confirmed once we manually verify your payment for complete peace of mind.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 backdrop-blur-sm px-3 sm:px-4 py-2 text-emerald-900 ring-1 ring-emerald-200/50 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  UPI payments
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 backdrop-blur-sm px-3 sm:px-4 py-2 text-blue-900 ring-1 ring-blue-200/50 font-medium">
                  💰 Min ₹{SHOP_CONFIG.minOrderTotal}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-purple-100/80 backdrop-blur-sm px-3 sm:px-4 py-2 text-purple-900 ring-1 ring-purple-200/50 font-medium">
                  🚚 Up to {SHOP_CONFIG.maxOrderDistanceKm}km
                </span>
              </div>
              <div className="pt-2 space-y-2 text-xs sm:text-sm text-gray-700">
                <p className="font-semibold">
                  📞 Call/WhatsApp: <span className="text-amber-700 font-bold">{SHOP_CONFIG.contactPhone}</span>
                </p>
                <p>⏰ Open daily · Morning till late evening</p>
              </div>
            </div>
          </section>

          {/* Products Section */}
          <section className="space-y-6">
            <SectionHeader
              eyebrow="🍬 Menu"
              title="Our bestselling sweets"
              description="Tap to add to cart. Review and place your order from the cart page."
            />

            <ProductsGrid />
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-8 border-t border-amber-200/50 pt-6 text-xs sm:text-sm text-gray-600">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <p className="font-medium">© {new Date().getFullYear()} {SHOP_CONFIG.shopName}</p>
            <p className="text-amber-700 font-semibold">💳 UPI ID: {SHOP_CONFIG.upiId}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
