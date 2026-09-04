'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, Category, Variant } from '@/lib/types';
import { formatPrice, getProductImagePath } from '@/lib/utils';
import PolaroidCardModal from '@/components/admin/PolaroidCardModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Polaroid Social Card Studio State
  const [polaroidProduct, setPolaroidProduct] = useState<Product | null>(null);
  const [isPolaroidOpen, setIsPolaroidOpen] = useState(false);

  const openPolaroidStudio = (product: Product) => {
    setPolaroidProduct(product);
    setIsPolaroidOpen(true);
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    bn: '',
    categoryId: '',
    description: '',
    badge: '',
    price: '',
    priceType: 'fixed', // 'fixed' | 'variants'
    variants: [] as Variant[],
    images: [] as string[],
    isActive: true,
    sortOrder: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [manualImageInput, setManualImageInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);
      const prodJson = await prodRes.json();
      const catJson = await catRes.json();

      if (prodJson.success) setProducts(prodJson.products);
      if (catJson.success) setCategories(catJson.categories);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      bn: '',
      categoryId: categories[0]?.id?.toString() || '',
      description: '',
      badge: '',
      price: '',
      priceType: 'fixed',
      variants: [],
      images: [],
      isActive: true,
      sortOrder: products.length + 1,
    });
    setManualImageInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);

    const variants: Variant[] = Array.isArray(p.variants)
      ? p.variants
      : typeof p.variants === 'string'
      ? JSON.parse(p.variants || '[]')
      : [];

    const images: string[] = Array.isArray(p.images)
      ? p.images
      : typeof p.images === 'string'
      ? JSON.parse(p.images || '[]')
      : [];

    setFormData({
      name: p.name,
      bn: p.bn || '',
      categoryId: p.categoryId.toString(),
      description: p.description,
      badge: p.badge || '',
      price: p.price !== null && p.price !== undefined ? p.price.toString() : '',
      priceType: variants.length > 0 ? 'variants' : 'fixed',
      variants,
      images,
      isActive: p.isActive,
      sortOrder: p.sortOrder,
    });
    setManualImageInput('');
    setIsModalOpen(true);
  };

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch {
      alert('Error uploading image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const addManualImage = () => {
    if (!manualImageInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, manualImageInput.trim()],
    }));
    setManualImageInput('');
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Variant handlers
  const addVariantRow = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { label: '', price: 0 }],
    }));
  };

  const updateVariant = (index: number, field: 'label' | 'price', value: any) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[index] = {
        ...updated[index],
        [field]: field === 'price' ? parseFloat(value) || 0 : value,
      };
      return { ...prev, variants: updated };
    });
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Save product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) {
      alert('Product Name and Category are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        bn: formData.bn,
        categoryId: parseInt(formData.categoryId),
        description: formData.description,
        badge: formData.badge,
        price: formData.priceType === 'fixed' ? formData.price : null,
        variants: formData.priceType === 'variants' ? formData.variants : [],
        images: formData.images,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setMessage({
          text: editingProduct ? 'Product updated successfully!' : 'Product added successfully!',
        });
        setTimeout(() => setMessage(null), 3000);
        fetchData();
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch {
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: `Deleted "${name}"` });
        setTimeout(() => setMessage(null), 3000);
        fetchData();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch {
      alert('Error deleting product');
    }
  };

  // Quick toggle active state
  const handleToggleActive = async (p: Product) => {
    try {
      await fetch(`/api/admin/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      filterCat === 'all' ||
      p.categoryId.toString() === filterCat ||
      p.category?.key === filterCat;
    if (!matchesCat) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.bn && p.bn.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[var(--ink)] pb-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Product Management
          </h1>
          <p className="font-mono text-xs opacity-70 mt-1">
            Add crafts, update prices, manage inventory and product photos
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary btn-sm">
          + Add New Product
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl font-mono text-xs ${
            message.error
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[var(--paper-deep)] p-4 rounded-xl border-2 border-[var(--ink)]">
        <input
          type="text"
          placeholder="Search products by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field mb-0 text-xs flex-1"
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="field mb-0 text-xs sm:w-56 font-mono"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id.toString()}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-[var(--paper-deep)] border-2 border-[var(--ink)] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <p className="p-8 text-center font-mono text-sm opacity-60">
            Loading products...
          </p>
        ) : !filteredProducts.length ? (
          <p className="p-8 text-center font-mono text-sm opacity-60">
            No products match your filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-[var(--ink)] bg-[var(--paper)]">
                  <th className="p-3 w-16">Photo</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price / Variants</th>
                  <th className="p-3 text-center">Badge</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredProducts.map((p) => {
                  const cat =
                    p.category || categories.find((c) => c.id === p.categoryId);
                  const images = Array.isArray(p.images)
                    ? p.images
                    : JSON.parse((p.images as string) || '[]');
                  const variants = Array.isArray(p.variants)
                    ? p.variants
                    : JSON.parse((p.variants as string) || '[]');
                  const firstImg = images[0] || '';
                  const imgUrl = getProductImagePath(cat?.folder, firstImg);

                  return (
                    <tr key={p.id} className="hover:bg-[var(--paper)]/60 transition-colors">
                      <td className="p-3">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-[var(--ink)] bg-white">
                          <Image
                            src={imgUrl}
                            alt={p.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.svg';
                            }}
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-sm text-[var(--ink)]">{p.name}</p>
                        {p.bn && (
                          <p className="font-bn text-[11px] opacity-60">{p.bn}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: cat?.chip || '#2F7A6E' }}
                        >
                          {cat?.label || 'General'}
                        </span>
                      </td>
                      <td className="p-3 font-bold">
                        {variants && variants.length > 0 ? (
                          <div className="space-y-0.5">
                            {variants.map((v: Variant, idx: number) => (
                              <div key={idx} className="text-[10px] opacity-85">
                                {v.label}: {formatPrice(v.price)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          formatPrice(p.price)
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {p.badge ? (
                          <span className="badge-tag relative top-0 right-0 inline-block text-[10px] px-2 py-0.5">
                            {p.badge}
                          </span>
                        ) : (
                          <span className="opacity-30">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                            p.isActive
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-stone-200 text-stone-600 border-stone-300'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openPolaroidStudio(p)}
                          className="px-2.5 py-1 rounded-lg border border-[var(--teal)] text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white transition-colors text-[11px] font-bold"
                          title="Generate instant Polaroid Social Media Card"
                        >
                          📸 Card
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="px-2.5 py-1 rounded-lg border border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--marigold)] transition-colors text-[11px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="px-2.5 py-1 rounded-lg border border-[var(--plum)] text-[var(--plum)] hover:bg-[var(--plum)] hover:text-white transition-colors text-[11px] font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay open">
          <div className="modal-box w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-center border-b-2 border-[var(--ink)] pb-3 mb-5">
              <h2 className="font-display text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Craft Item'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-2xl leading-none hover:text-[var(--plum)]"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase mb-1 font-bold">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="field mb-0 text-sm"
                    placeholder="e.g. Lavender Bunny Plushie"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1 font-bold">
                    Bengali Name (Optional)
                  </label>
                  <input
                    type="text"
                    className="field mb-0 text-sm font-bn"
                    placeholder="e.g. খরগোশ"
                    value={formData.bn}
                    onChange={(e) =>
                      setFormData({ ...formData, bn: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase mb-1 font-bold">
                    Category *
                  </label>
                  <select
                    required
                    className="field mb-0 text-sm font-mono"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1 font-bold">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    className="field mb-0 text-sm"
                    placeholder="BESTSELLER, NEW, LIMITED..."
                    value={formData.badge}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value.toUpperCase() })
                    }
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-4 bg-[var(--paper)] rounded-xl border border-[var(--ink)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs uppercase font-bold">
                    Pricing Mode
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, priceType: 'fixed' })
                      }
                      className={`px-3 py-1 text-xs font-mono rounded-full border border-[var(--ink)] ${
                        formData.priceType === 'fixed'
                          ? 'bg-[var(--ink)] text-[var(--paper)] font-bold'
                          : 'bg-transparent'
                      }`}
                    >
                      Single Price
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, priceType: 'variants' })
                      }
                      className={`px-3 py-1 text-xs font-mono rounded-full border border-[var(--ink)] ${
                        formData.priceType === 'variants'
                          ? 'bg-[var(--ink)] text-[var(--paper)] font-bold'
                          : 'bg-transparent'
                      }`}
                    >
                      Sizes / Variants (e.g. A4, A3)
                    </button>
                  </div>
                </div>

                {formData.priceType === 'fixed' ? (
                  <div>
                    <label className="block font-mono text-xs uppercase mb-1 opacity-75">
                      Price in Taka (৳)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 1500"
                      className="field mb-0 text-sm"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-mono opacity-70">
                        Define pricing for each size/format:
                      </p>
                      <button
                        type="button"
                        onClick={addVariantRow}
                        className="text-xs font-mono font-bold text-[var(--plum)] hover:underline"
                      >
                        + Add Variant
                      </button>
                    </div>
                    {formData.variants.map((v, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Label (e.g. A4 Size / Small)"
                          className="field mb-0 text-xs flex-1"
                          value={v.label}
                          onChange={(e) =>
                            updateVariant(i, 'label', e.target.value)
                          }
                          required
                        />
                        <input
                          type="number"
                          placeholder="Price (৳)"
                          className="field mb-0 text-xs w-32"
                          value={v.price || ''}
                          onChange={(e) =>
                            updateVariant(i, 'price', e.target.value)
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="text-red-600 font-bold px-2 hover:bg-red-50 rounded"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    {!formData.variants.length && (
                      <button
                        type="button"
                        onClick={addVariantRow}
                        className="w-full py-2 border-2 border-dashed border-[var(--ink)]/30 rounded-lg text-xs font-mono text-center hover:bg-[var(--paper-deep)]"
                      >
                        Click to add your first size/variant
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-xs uppercase mb-1 font-bold">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="field mb-0 text-sm"
                  placeholder="Describe your handmade specimen..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Image Uploader */}
              <div className="p-4 bg-[var(--paper)] rounded-xl border border-[var(--ink)]">
                <label className="block font-mono text-xs uppercase mb-2 font-bold">
                  Product Images
                </label>

                {/* Upload from file */}
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <label className="btn btn-outline btn-sm cursor-pointer inline-flex items-center justify-center">
                    <span>
                      {uploadingImage ? 'Uploading photo...' : '📁 Upload Photo File'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>

                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="Or enter filename/URL (e.g. 1.jpg)"
                      className="field mb-0 text-xs flex-1"
                      value={manualImageInput}
                      onChange={(e) => setManualImageInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addManualImage}
                      className="btn btn-sm btn-teal"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Image thumbnails list */}
                {formData.images.length > 0 && (
                  <div className="flex gap-3 flex-wrap mt-3">
                    {formData.images.map((img, i) => {
                      const cat = categories.find(
                        (c) => c.id.toString() === formData.categoryId
                      );
                      const fullUrl = getProductImagePath(cat?.folder, img);
                      return (
                        <div
                          key={i}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-[var(--ink)] group bg-white"
                        >
                          <Image
                            src={fullUrl}
                            alt="preview"
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.svg';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            &times;
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-[var(--ink)] text-[var(--paper)] text-[9px] font-mono text-center">
                              Cover
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status and Sort Order */}
              <div className="flex justify-between items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-[var(--plum)]"
                  />
                  <span>Active (Visible in public shop)</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs opacity-75">Sort:</span>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="field mb-0 text-xs w-20 py-1"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline flex-1 justify-center"
                >
                  Cancel
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => openPolaroidStudio(editingProduct)}
                    className="btn border-2 border-[var(--teal)] text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white flex-initial px-4 justify-center"
                    title="Generate Polaroid Social Media Card for this product"
                  >
                    📸 Social Card
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary flex-1 justify-center"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Save New Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Polaroid Social Card Studio Modal */}
      <PolaroidCardModal
        product={polaroidProduct}
        categories={categories}
        isOpen={isPolaroidOpen}
        onClose={() => setIsPolaroidOpen(false)}
      />
    </div>
  );
}
