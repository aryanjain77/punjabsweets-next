'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminCategoriesClient() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Unable to load categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch categories failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter category name');
      return;
    }

    try {
      const method = selected ? 'PUT' : 'POST';
      const url = selected ? `/api/categories/${selected.id}` : '/api/categories';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save category');

      setSuccess(`Category ${selected ? 'updated' : 'created'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
      setError('');
      setName('');
      setSelected(null);
      setCategories(data.categories || (await (await fetch('/api/categories')).json()).categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleEdit = (cat: Category) => {
    setSelected(cat);
    setName(cat.name);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setCategories(categories.filter((c) => c.id !== id));
      setSuccess('Category deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <AdminNav onLogout={handleLogout} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Categories</h1>
            <p className="mt-1 text-sm text-zinc-600">Manage product categories</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">{success}</div>}

        <form onSubmit={handleSave} className="mb-6 space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
            <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 text-white">
              {selected ? 'Update' : 'Add'} Category
            </button>
          </div>
        </form>

        <div className="rounded-xl bg-white/70 p-4 shadow-sm border border-amber-100">
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <p className="font-medium text-gray-800">{cat.name}</p>
                  <p className="text-xs text-gray-500">{cat.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleEdit(cat)} className="text-blue-600 text-xs">Edit</button>
                  <button type="button" onClick={() => handleDelete(cat.id)} className="text-red-600 text-xs">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
