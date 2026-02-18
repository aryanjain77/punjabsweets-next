'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/CartContext';
import { SHOP_CONFIG } from '@/config/shop';
import { calculateDistanceKm } from "@/lib/utils";

// Dynamically import map component to avoid SSR issues
const MapSelector = dynamic(() => import('./MapSelector').then(mod => ({ default: mod.MapSelector })), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />,
});

interface MapLocation {
  latitude: number;
  longitude: number;
}

export function CartView() {
  const { items, products, clearCart, setQuantity, subtotal } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successOrderId, setSuccessOrderId] = useState('');
  const [successOrderAmount, setSuccessOrderAmount] = useState<number>(0);
  const [showForm, setShowForm] = useState(items.length > 0);
  const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);
  const [lastPaymentMethod, setLastPaymentMethod] = useState<'upi' | 'cod'>('upi');
  

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    pincode: '',
    notes: '',
    paymentMethod: 'upi',
  });

  const cartItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return { ...item, product };
    })
    .filter((item) => item.product);

  if (cartItems.length === 0 && !successOrderId) {
    return (
      <div className="rounded-2xl bg-white/30 backdrop-blur-xl p-8 text-center ring-1 ring-white/20 border border-white/40 shadow-xl">
        <p className="mb-4 text-lg text-gray-700">Your cart is empty</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg transition-all"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (successOrderId) {
    const amount = Number.isFinite(successOrderAmount) && successOrderAmount > 0 ? successOrderAmount : subtotal;
    const upiParams = new URLSearchParams({
      pa: SHOP_CONFIG.upiId,
      pn: SHOP_CONFIG.shopName,
      am: amount.toFixed(2),
      cu: "INR",
      tn: `Order ${successOrderId}`,
      tr: successOrderId,
    });
    const upiPayUrl = `upi://pay?${upiParams.toString()}`;

    return (
      <div className="rounded-2xl bg-gradient-to-br from-green-50/30 to-emerald-50/30 backdrop-blur-xl p-8 text-center ring-1 ring-green-200/50 border border-green-300/30 shadow-xl">
        <h2 className="mb-2 text-2xl font-bold text-green-900">✓ Order Placed!</h2>
        <p className="mb-4 text-green-800">Thank you for your order. Your order ID is:</p>
        <p className="mb-6 break-all rounded-lg bg-white/50 backdrop-blur-sm px-4 py-3 font-mono text-sm font-semibold text-green-900 border border-green-200/50">
          {successOrderId}
        </p>
        
        <div className="mb-6 space-y-3 rounded-lg bg-white/50 backdrop-blur-sm p-4 text-left border border-green-200/50">
        <p className="text-sm font-semibold text-gray-900">📋 Next Steps:</p>
        
        {lastPaymentMethod === 'upi' ? (
          // UPI instructions
          <ol className="space-y-2 text-xs text-gray-700">
            <li className="flex gap-2">
              <span className="font-bold text-amber-600">1.</span>
              <span>Scan the QR code below or send ₹{amount} to UPI: <span className="font-mono font-semibold text-amber-600">{SHOP_CONFIG.upiId}</span></span>
            </li>
            {/* QR Code Image */}
            <li className="flex justify-center my-4">
              <a
                href={upiPayUrl}
                className="group inline-flex flex-col items-center gap-2"
                aria-label="Tap to pay using a UPI app"
              >
                <img 
                  src={SHOP_CONFIG.qrCodeImageUrl} 
                  alt="UPI QR Code (tap to pay with UPI app)" 
                  className="w-48 h-48 border-2 border-amber-300 rounded-lg shadow-lg cursor-pointer transition group-active:scale-[0.99]"
                  onError={(e) => {
                    // Hide image if not found
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-[11px] text-gray-600">
                  On phone: tap QR to open UPI apps
                </span>
              </a>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-amber-600">2.</span>
              <span>Include your Order ID in the UPI note</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-amber-600">3.</span>
              <span>We&apos;ll verify payment and confirm your order</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-amber-600">4.</span>
              <span>We&apos;ll contact you for delivery coordination</span>
            </li>
          </ol>
        ) : (
          // COD instructions
          <ol className="space-y-2 text-xs text-gray-700">
            <li className="flex gap-2">
              <span className="font-bold text-amber-600">1.</span>
              <span>You chose <span className="font-semibold">Cash on Delivery (COD)</span></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-amber-600">2.</span>
              <span>Please keep ₹{subtotal} ready in cash</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-amber-600">3.</span>
              <span>The delivery person will collect payment when delivering your order</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-amber-600">4.</span>
              <span>We&apos;ll contact you to confirm delivery time</span>
            </li>
          </ol>
        )}
      </div>

        <button
          onClick={() => {
            setSuccessOrderId('');
            setSuccessOrderAmount(0);
            setLastPaymentMethod('upi');
            clearCart();
          }}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg transition-all"
        >
          Place another order
        </button>
      </div>
    );
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = (location: MapLocation) => {
    setMapLocation(location);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (subtotal < SHOP_CONFIG.minOrderTotal) {
        setError(`Minimum order value is ₹${SHOP_CONFIG.minOrderTotal}`);
        setIsSubmitting(false);
        return;
      }

      if (!formData.customerName || !formData.phone || !formData.addressLine1 || !formData.pincode) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      if (!mapLocation) {
        setError('Please select delivery location on the map');
        setIsSubmitting(false);
        return;
      }


      const approxDistanceKm = calculateDistanceKm(
        SHOP_CONFIG.shopLatitude,
        SHOP_CONFIG.shopLongitude,
        mapLocation.latitude,
        mapLocation.longitude
      );

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          ...formData,
          ...mapLocation,
          approxDistanceKm: approxDistanceKm, // Will be calculated on backend or left for admin
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setSuccessOrderId(data.orderId);
      setSuccessOrderAmount(typeof data.totalAmount === "number" ? data.totalAmount : subtotal);
      setLastPaymentMethod(formData.paymentMethod as 'upi' | 'cod');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cart Items - Glassmorphism */}
      <div className="rounded-2xl bg-white/30 backdrop-blur-xl ring-1 ring-white/20 border border-white/40 shadow-xl overflow-hidden">
        <div className="border-b border-white/20 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-amber-500/10 to-rose-500/10">
          <h2 className="text-sm font-semibold text-gray-900">🛒 Order Summary</h2>
        </div>
        <div className="divide-y divide-white/20">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 sm:px-6 sm:py-4 hover:bg-white/10 transition">
              <div className="flex-1 mb-2 sm:mb-0">
                <p className="text-sm font-semibold text-gray-900">{item.product?.name}</p>
                <p className="text-xs text-gray-600 mt-1">₹{item.product?.price} × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <p className="flex-1 sm:w-16 text-right text-sm font-bold text-amber-600">
                  ₹{(item.product?.price ?? 0) * item.quantity}
                </p>
                <div className="flex items-center gap-1 bg-gray-200/50 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(item.productId, Math.max(0, item.quantity - 1))}
                    className="rounded-md bg-gray-300/50 hover:bg-gray-400/50 px-2 py-1 text-sm font-semibold transition"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    className="rounded-md bg-gray-300/50 hover:bg-gray-400/50 px-2 py-1 text-sm font-semibold transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/20 bg-gradient-to-r from-amber-500/10 to-rose-500/10 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">Total Amount</p>
            <p className="text-2xl font-bold text-amber-600">₹{subtotal}</p>
          </div>
        </div>
      </div>

      {/* Order Form - Glassmorphism */}
      {showForm && (
        <form onSubmit={handleSubmitOrder} className="rounded-2xl bg-white/30 backdrop-blur-xl p-4 sm:p-6 ring-1 ring-white/20 border border-white/40 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-gray-900">📦 Delivery Details</h2>

          {/* Customer Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleFormChange}
                required
                className="w-full rounded-lg border border-gray-300/50 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                required
                className="w-full rounded-lg border border-gray-300/50 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                placeholder="+91..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Street Address *</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleFormChange}
                required
                className="w-full rounded-lg border border-gray-300/50 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                placeholder="House number, street name"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Apartment / Building (Optional)</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300/50 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                placeholder="Apartment number, building name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Landmark (Optional)</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300/50 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                placeholder="Near Bank, Shop, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Postal Code *</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleFormChange}
                required
                className="w-full rounded-lg border border-gray-300/50 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                placeholder="XXXXXX"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Special Instructions (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300/50 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition resize-none"
                placeholder="Ring bell twice, use back entrance, etc."
                rows={2}
              />
            </div>
          </div>

          {/* Map Location Selector */}
          <div className="pt-4 border-t border-white/20">
            <MapSelector onLocationSelect={handleLocationSelect} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50/80 backdrop-blur-sm p-4 ring-1 ring-red-200 border border-red-300/50">
              <p className="text-sm font-medium text-red-800">⚠️ {error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50/80 backdrop-blur-sm p-4 ring-1 ring-blue-200/50 border border-blue-300/30">
            <p className="text-xs text-blue-900">
              <span className="font-semibold">ℹ️ Info:</span> Click on the map or drag the marker to select your exact delivery location for faster, more accurate service.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Payment Method *</p>
            <div className="flex gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === "upi"}
                  onChange={handleFormChange}
                />
                <span>UPI (online)</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleFormChange}
                />
                <span>Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.25" />
                  <path d="M4 12a8 8 0 018-8" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Processing Order...
              </span>
            ) : (
              `Place Order (₹${subtotal})`
            )}
          </button>
        </form>
      )}
    </div>
  );
}
