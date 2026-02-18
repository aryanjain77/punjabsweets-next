'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AdminNav } from '@/components/admin/AdminNav';
import { ProductForm } from '@/components/admin/ProductForm';

interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export default function AdminProductsClient() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
      
      const text = await res.text();
      if (!text) {
        setProducts([]);
        return;
      }
      
      try {
        const data = JSON.parse(text);
        setProducts(data.products || []);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response:', text);
        setError('Server returned invalid response');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string | undefined) => {
    if (!productId || !confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/admin/upload?id=${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(products.filter((p) => p.id !== productId));
      setSuccess('Product deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    }
  };

  const handleSave = async (formData: FormData) => {
    try {
      const url = '/api/products/admin/upload';
      const method = editingProduct?.id ? 'PUT' : 'POST';

      if (editingProduct?.id) {
        formData.append('id', editingProduct.id);
      }

      const res = await fetch(url, {
        method,
        credentials: 'include',
        body: formData,
      });

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!res.ok) {
        try {
          const errorText = await res.text();
          const errorData = errorText ? JSON.parse(errorText) : {};
          throw new Error(errorData.error || `Server error: ${res.status}`);
        } catch (e) {
          throw new Error(`Server error: ${res.status}`);
        }
      }

      try {
        const text = await res.text();
        if (!text) {
          throw new Error('Empty response from server');
        }
        const data = JSON.parse(text);
        
        if (editingProduct?.id) {
          setProducts(products.map((p) => (p.id === data.product.id ? data.product : p)));
        } else {
          setProducts([...products, data.product]);
        }

        setSuccess(`Product ${editingProduct?.id ? 'updated' : 'created'} successfully`);
        setTimeout(() => setSuccess(''), 3000);
        setEditingProduct(null);
        setShowForm(false);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error instanceof Error ? error.message : 'Failed to save product');
    }
  };

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
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Products</h1>
            <p className="mt-1 text-sm text-zinc-600">Manage your menu items</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(!showForm);
            }}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
          >
            {showForm ? '✕ Cancel' : '+ Add Product'}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50/80 backdrop-blur-sm p-4 ring-1 ring-red-200 border border-red-300/50">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50/80 backdrop-blur-sm p-4 ring-1 ring-green-200 border border-green-300/50">
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        )}

        {/* Product Form - Glassmorphism */}
        {showForm && (
          <div className="mb-8 rounded-2xl bg-white/30 backdrop-blur-xl p-8 shadow-xl ring-1 ring-white/20 border border-white/40">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <ProductForm
              product={editingProduct || undefined}
              onSave={handleSave}
              onCancel={() => {
                setEditingProduct(null);
                setShowForm(false);
              }}
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="rounded-2xl bg-white/30 backdrop-blur-xl overflow-hidden shadow-xl ring-1 ring-white/20 border border-white/40">
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
              <p className="mt-4 text-sm text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-lg font-medium text-gray-900">📦 No products yet</p>
              <p className="mt-1 text-sm text-gray-600">Create your first product to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2 text-sm font-semibold text-white hover:shadow-lg transition"
              >
                Create First Product
              </button>
            </div>
          ) : (
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-2xl bg-white/50 backdrop-blur-sm border border-amber-200/50 hover:border-amber-400 transition overflow-hidden hover:shadow-lg"
                >
                  {/* Product Image */}
                  {product.imageUrl && (
                    <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-amber-100 to-rose-100">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Category & Status */}
                    <div className="flex items-center justify-between text-xs">
                      {product.category && (
                        <span className="px-2 py-1 rounded-full bg-amber-100/50 text-amber-800">
                          {product.category}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                          product.isAvailable
                            ? 'bg-green-100/50 text-green-800'
                            : 'bg-red-100/50 text-red-800'
                        }`}
                      >
                        {product.isAvailable ? '✓ Available' : '✗ Unavailable'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="pt-2 border-t border-amber-100">
                      <p className="text-lg font-bold text-amber-600">₹{product.price}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        className="flex-1 rounded-lg bg-amber-500/80 hover:bg-amber-500 text-white text-xs font-semibold py-2 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-semibold py-2 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
