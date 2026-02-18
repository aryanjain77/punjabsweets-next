'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginClient() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Session is set via httpOnly cookie, redirect to dashboard
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError('An error occurred during login');
      setIsLoading(false);
      console.error('Login error:', err);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-orange-200 to-rose-300 opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-200 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-200 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm">
          {/* Glassmorphism card */}
          <div className="rounded-3xl bg-white/30 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/20 border border-white/40">
            {/* Logo and Title */}
            <div className="mb-8 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-xl font-black text-white shadow-lg">
                PS
              </div>
              <h1 className="mt-4 text-2xl font-bold bg-gradient-to-r from-amber-900 to-rose-900 bg-clip-text text-transparent">
                Admin Portal
              </h1>
              <p className="mt-2 text-sm text-gray-700">Punjab Sweets Management</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg bg-red-50/80 backdrop-blur-sm p-4 ring-1 ring-red-200 border border-red-300/50">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-2 w-full rounded-xl border border-gray-300/50 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-amber-500 focus:bg-white/80 focus:ring-2 focus:ring-amber-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter password"
                  autoComplete="password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.25" />
                      <path d="M4 12a8 8 0 018-8" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Security Info */}
            <div className="mt-8 rounded-lg bg-blue-50/50 backdrop-blur-sm p-4 ring-1 ring-blue-200/50 border border-blue-300/30">
              <p className="text-xs text-gray-700">
                <span className="font-semibold text-blue-900">🔒 Secure Session:</span> Your session is protected with secure cookies and automatic logout after 24 hours.
              </p>
            </div>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-center text-xs text-gray-700">
            Need help? Contact system administrator
          </p>
        </div>
      </div>
    </div>
  );
}
