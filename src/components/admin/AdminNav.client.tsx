'use client';

import Link from 'next/link';

export function AdminNav({ onLogout }: { onLogout: () => void }) {
  return (
    <nav className="border-b border-amber-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white">
              PS
            </div>
            <span className="font-semibold text-zinc-900">Admin Panel</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/admin/dashboard"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              Products
            </Link>
            <Link
              href="/admin/categories"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              Categories
            </Link>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              Orders
            </Link>
            <button
              onClick={onLogout}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
