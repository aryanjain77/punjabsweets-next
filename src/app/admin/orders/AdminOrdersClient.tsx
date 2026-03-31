// inside app/admin/products/AdminOrdersClient.tsx

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import type { Order, Product } from '@/lib/types';

type AdminOrder = Omit<Order, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export default function AdminOrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'confirmed' | 'cancelled'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<{
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [geo, setGeo] = useState<Record<string, { address?: string; isLoading?: boolean; error?: string }>>({});

  const fetchOrders = useCallback(async () => {
    try {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: "20",
        status: filter,
      });

      const res = await fetch(`/api/orders?${qs.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok && res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setOrders((data.orders || []) as AdminOrder[]);
      setPageInfo(data.pageInfo || null);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, page, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) return;
        const data = await res.json();
        setProducts(data.products ?? []);
      } catch (err) {
        // ignore
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    // Server already filters by status, but keep this for safety.
    setFilteredOrders(filter === 'all' ? orders : orders.filter(o => o.status === filter));
  }, [orders, filter]);

  const totalDisplayedAmount = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }, [filteredOrders]);

  const ensureGeocoded = async (order: AdminOrder) => {
    if (!order?.id) return;
    if (typeof order.latitude !== "number" || typeof order.longitude !== "number") return;
    if (geo[order.id]?.address || geo[order.id]?.isLoading) return;

    setGeo((prev) => ({ ...prev, [order.id]: { ...(prev[order.id] || {}), isLoading: true, error: undefined } }));
    try {
      const qs = new URLSearchParams({
        lat: String(order.latitude),
        lng: String(order.longitude),
      });
      const res = await fetch(`/api/geocode/reverse?${qs.toString()}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to reverse geocode");
      }
      const address = data?.result?.displayName;
      if (typeof address !== "string" || !address) {
        throw new Error("No address found");
      }
      setGeo((prev) => ({ ...prev, [order.id]: { address, isLoading: false } }));
    } catch (e) {
      setGeo((prev) => ({
        ...prev,
        [order.id]: { ...(prev[order.id] || {}), isLoading: false, error: e instanceof Error ? e.message : "Failed" },
      }));
    }
  };

  const handleUpdateOrder = async (orderId: string, status: string, paymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status, paymentStatus }),
      });

      if (!res.ok) throw new Error('Failed to update order');

      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      .finally(() => {
        router.push('/admin/login');
        router.refresh();
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <AdminNav onLogout={handleLogout} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Orders</h1>
          <p className="mt-1 text-sm text-zinc-600">Manage and confirm customer orders</p>
          <p className="mt-2 text-sm font-semibold text-amber-700">Total amount ({filter === 'all' ? 'filtered' : filter}): ₹{totalDisplayedAmount}</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {(['all', 'new', 'confirmed', 'cancelled'] as const).map(status => (
            <button
              key={status}
              onClick={() => {
                setPage(1);
                setFilter(status);
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === status
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/80 text-zinc-700 ring-1 ring-amber-100 hover:bg-amber-50'
              }`}
            >
              {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-2xl bg-white/80 p-8 text-center ring-1 ring-amber-100">
              <p className="text-sm text-zinc-600">Loading...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl bg-white/80 p-8 text-center ring-1 ring-amber-100">
              <p className="text-sm text-zinc-600">No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className="rounded-2xl bg-white/80 ring-1 ring-amber-100 backdrop-blur-md overflow-hidden"
              >
                <div
                  onClick={() => {
                    const next = expandedOrder === order.id ? null : order.id;
                    setExpandedOrder(next);
                    if (next) {
                      ensureGeocoded(order);
                    }
                  }}
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-amber-50/50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-mono text-xs font-semibold text-amber-600">{order.id}</p>
                        <p className="mt-1 text-sm font-medium text-zinc-900">{order.customerName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-zinc-600">Amount</p>
                      <p className="font-semibold text-zinc-900">₹{order.totalAmount}</p>
                    </div>
                    <div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          order.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          order.paymentStatus === 'received'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="ml-4 text-zinc-400">
                    {expandedOrder === order.id ? '▼' : '▶'}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-amber-100 bg-amber-50/30 px-6 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                          Customer Details
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-zinc-600">
                          <p>
                            <span className="font-medium">Phone:</span> {order.phone}
                          </p>
                          <p>
                            <span className="font-medium">Address:</span> {order.addressLine1}
                            {order.addressLine2 && `, ${order.addressLine2}`}
                          </p>
                          {order.landmark && (
                            <p>
                              <span className="font-medium">Landmark:</span> {order.landmark}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Pincode:</span> {order.pincode}
                          </p>
                          <p>
                            <span className="font-medium">Distance:</span> {order.approxDistanceKm} km
                          </p>
                          {typeof order.latitude === "number" && typeof order.longitude === "number" && (
                            <div className="mt-3 rounded-lg bg-white/50 p-3 ring-1 ring-amber-100">
                              <p className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wide">
                                Delivery Location
                              </p>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-zinc-500">Latitude</p>
                                  <p className="font-mono font-semibold text-zinc-900">{order.latitude.toFixed(6)}</p>
                                </div>
                                <div>
                                  <p className="text-zinc-500">Longitude</p>
                                  <p className="font-mono font-semibold text-zinc-900">{order.longitude.toFixed(6)}</p>
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    `${order.latitude},${order.longitude}`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                                >
                                  Open in Google Maps
                                </a>
                                <span className="text-[11px] text-zinc-500">
                                  {geo[order.id]?.isLoading
                                    ? "Resolving address…"
                                    : geo[order.id]?.address
                                      ? "Address resolved"
                                      : geo[order.id]?.error
                                        ? "Address unavailable"
                                        : "Tap to expand to resolve address"}
                                </span>
                              </div>

                              {(geo[order.id]?.address || geo[order.id]?.error) && (
                                <p className="mt-2 text-xs text-zinc-700">
                                  <span className="font-medium">Approx address:</span>{" "}
                                  {geo[order.id]?.address || geo[order.id]?.error}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                          Order Items
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-zinc-600">
                          {order.items.map((item, idx) => {
                            const product = products.find((p) => p.id === item.productId);
                            const selectedVariant =
                              item.variantId && product?.variants
                                ? product.variants.find((v) => v.id === item.variantId)
                                : undefined;

                            const productName = product?.name?.trim();
                            const fallbackName = item.name?.trim();
                            const baseName = productName || fallbackName || item.productId;

                            // Priority: stored variantName > variant lookup > variantId
                            let variantName: string | undefined;
                            if (item.variantName && item.variantName.trim()) {
                              variantName = item.variantName.trim();
                            } else if (selectedVariant?.name && selectedVariant.name.trim()) {
                              variantName = selectedVariant.name.trim();
                            } else if (item.variantId) {
                              variantName = `Variant ${item.variantId}`;
                            }

                            return (
                              <p key={idx}>
                                {item.quantity}x {baseName}{variantName ? ` (${variantName})` : ''}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-4 rounded-lg bg-white/50 p-3">
                        <p className="text-xs font-medium text-zinc-700">Special Requests</p>
                        <p className="mt-1 text-xs text-zinc-600">{order.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 space-y-2">
                      {order.paymentStatus === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleUpdateOrder(order.id, order.status, 'received')
                            }
                            className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600"
                          >
                            Mark Payment Received
                          </button>
                        </div>
                      )}

                      {order.paymentStatus === 'received' && order.status === 'new' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleUpdateOrder(order.id, 'confirmed', order.paymentStatus)
                            }
                            className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600"
                          >
                            Confirm Order
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateOrder(order.id, 'cancelled', order.paymentStatus)
                            }
                            className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                          >
                            Reject Order
                          </button>
                        </div>
                      )}

                      {order.status === 'confirmed' && (
                        <div className="rounded-lg bg-green-50 p-3 text-center text-xs font-semibold text-green-800">
                          ✓ Order Confirmed
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="rounded-lg bg-red-50 p-3 text-center text-xs font-semibold text-red-800">
                          ✕ Order Cancelled
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-white/60 p-4 ring-1 ring-amber-100 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-zinc-700">
              Page <span className="font-semibold">{pageInfo.page}</span> of{" "}
              <span className="font-semibold">{pageInfo.totalPages}</span>{" "}
              <span className="text-zinc-500">(total {pageInfo.total})</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pageInfo.hasPrevPage}
                className="rounded-lg bg-white/80 px-4 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-amber-100 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pageInfo.hasNextPage}
                className="rounded-lg bg-white/80 px-4 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-amber-100 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
