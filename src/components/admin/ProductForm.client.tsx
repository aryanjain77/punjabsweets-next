'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface VariantInput {
  id?: string;
  name: string;
  price: number;
  stock?: number;
}

interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  categoryId?: string;
  imageUrl?: string;
  isAvailable: boolean;
  variants?: VariantInput[];
}

interface Category {
  id: string;
  name: string;
  slug?: string;
}

export function ProductForm({
  product,
  onSave,
  onCancel,
}: {
  product?: Product;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    categoryId: product?.categoryId || '',
    category: product?.category || '',
    isAvailable: product?.isAvailable ?? true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(product?.imageUrl);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants?.length
      ? product.variants
      : [{ name: '', price: 0, stock: 0 }]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.warn('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData((prev) => ({
        ...prev,
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        categoryId: product.categoryId || '',
        category: product.category || '',
        isAvailable: product.isAvailable ?? true,
      }));
      setVariants(product.variants && product.variants.length > 0 ? product.variants : [{ name: '', price: 0, stock: 0 }]);
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      }
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    if (!formData.categoryId && product.category && categories.length > 0) {
      const matchedCat = categories.find((cat) => cat.name === product.category);
      if (matchedCat) {
        setFormData((prev) => ({ ...prev, categoryId: matchedCat.id }));
      }
    }
  }, [product, categories, formData.categoryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'price'
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    if (!formData.name || formData.price <= 0) {
      setError('Please fill in all required fields');
      setIsSaving(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', String(formData.price));
      submitData.append('categoryId', formData.categoryId || '');
      submitData.append('category', formData.category || '');
      submitData.append('isAvailable', String(formData.isAvailable));
      submitData.append('variants', JSON.stringify(variants));

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      await onSave(submitData);
      setSuccess('Product saved successfully!');
      
      if (!product) {
        setFormData({
          name: '',
          description: '',
          price: 0,
          categoryId: '',
          category: '',
          isAvailable: true,
        });
        setVariants([{ name: '', price: 0, stock: 0 }]);
        setImageFile(null);
        setImagePreview(undefined);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Section */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">Product Image</label>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="relative w-full max-w-xs rounded-xl overflow-hidden border-2 border-amber-200">
            <Image
              src={imagePreview}
              alt="Preview"
              width={300}
              height={300}
              className="w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview(product?.imageUrl);
                setImageFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        )}

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-amber-300 rounded-xl p-6 text-center cursor-pointer hover:bg-amber-50/50 transition"
        >
          <div className="text-3xl mb-2">📸</div>
          <p className="text-sm font-medium text-gray-900">
            {imageFile ? imageFile.name : 'Click to upload product image'}
          </p>
          <p className="text-xs text-gray-600 mt-1">PNG, JPG, WebP up to 5MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Product Details Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
            placeholder="e.g., Gulab Jamun"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            step="1"
            min="0"
            className="w-full rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
            placeholder="0"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition resize-none"
            placeholder="Describe your product..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={(e) => {
              handleChange(e);
              const selectedCat = categories.find((cat) => cat.id === e.target.value);
              if (selectedCat) {
                setFormData((prev) => ({ ...prev, category: selectedCat.name }));
              }
            }}
            className="w-full rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Variants</label>
          <div className="space-y-2">
            {variants.map((variant, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <label className="block text-xs text-gray-600 mb-1">Variant name</label>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => {
                      const next = [...variants];
                      next[index] = { ...next[index], name: e.target.value };
                      setVariants(next);
                    }}
                    placeholder="500gm"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-gray-600 mb-1">Variant price (₹)</label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => {
                      const next = [...variants];
                      next[index] = { ...next[index], price: Number(e.target.value) };
                      setVariants(next);
                    }}
                    placeholder="Price"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-gray-600 mb-1">Stock</label>
                  <input
                    type="number"
                    value={variant.stock ?? 0}
                    onChange={(e) => {
                      const next = [...variants];
                      next[index] = { ...next[index], stock: Number(e.target.value) };
                      setVariants(next);
                    }}
                    placeholder="Stock"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVariants((prev) => prev.filter((_, idx) => idx !== index));
                  }}
                  className="col-span-2 rounded-lg bg-red-500 px-2 py-2 text-xs font-semibold text-white"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setVariants((prev) => [...prev, { name: '', price: 0, stock: 0 }])}
              className="rounded-lg bg-amber-200 px-3 py-2 text-xs font-semibold text-amber-900"
            >
              + Add Variant
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-900">Available for order</span>
          </label>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50/80 backdrop-blur-sm p-4 ring-1 ring-red-200 border border-red-300/50">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50/80 backdrop-blur-sm p-4 ring-1 ring-green-200 border border-green-300/50">
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 flex-col sm:flex-row">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-amber-300 bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
