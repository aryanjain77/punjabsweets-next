"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';
import type { Order } from '@/lib/types';

type AdminOrder = Omit<Order, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export default function AdminDashboardClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, newOrders: 0, confirmedOrders: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/stats', {
        credentials: 'include', // Include cookies automatically
      });
      
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await res.json();
      setOrders((data.recentOrders || []) as AdminOrder[]);
      setStats(data.stats || { totalOrders: 0, newOrders: 0, confirmedOrders: 0 });
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <AdminNav onLogout={handleLogout} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">Welcome to your admin panel</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 ring-1 ring-red-200 border border-red-300">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            label="New Orders"
            value={stats.newOrders}
            color="from-amber-500 to-amber-600"
            highlight
          />
          <StatCard
            label="Confirmed"
            value={stats.confirmedOrders}
            color="from-green-500 to-green-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/products"
            className="rounded-2xl bg-white/80 p-6 ring-1 ring-amber-100 backdrop-blur-md hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-zinc-900">Manage Products</h3>
            <p className="mt-1 text-xs text-zinc-600">Add, edit, or remove items from your menu</p>
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-2xl bg-white/80 p-6 ring-1 ring-amber-100 backdrop-blur-md hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-zinc-900">View All Orders</h3>
            <p className="mt-1 text-xs text-zinc-600">Manage and confirm customer orders</p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl bg-white/80 ring-1 ring-amber-100 backdrop-blur-md">
          <div className="border-b border-amber-100 px-6 py-4">
            <h2 className="font-semibold text-zinc-900">Recent Orders</h2>
          </div>

          {isLoading ? (
            <div className="px-6 py-8 text-center text-sm text-zinc-600">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-zinc-600">No orders yet</div>
          ) : (
            <div className="divide-y divide-amber-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50/50 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Order ID</th>
                    <th className="px-6 py-3 text-left hidden sm:table-cell">Customer</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-amber-100 hover:bg-amber-50/50">
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-xs font-semibold text-amber-600 hover:underline"
                        >
                          {order.id.substring(0, 12)}...
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-zinc-900 hidden sm:table-cell">{order.customerName}</td>
                      <td className="px-6 py-3 text-right font-semibold text-zinc-900">
                        ₹{order.totalAmount}
                      </td>
                      <td className="px-6 py-3">
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
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            order.paymentStatus === 'received'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {orders.length > 5 && (
            <div className="border-t border-amber-100 px-6 py-3 text-center">
              <Link href="/admin/orders" className="text-xs font-semibold text-amber-600 hover:underline">
                View all orders →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${color} p-6 text-white ${highlight ? 'ring-2 ring-amber-300' : 'ring-1 ring-opacity-50'}`}>
      <p className="text-xs font-medium opacity-90">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
