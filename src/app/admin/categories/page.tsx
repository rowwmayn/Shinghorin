'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    key: '',
    label: '',
    folder: '',
    chip: '#2F7A6E',
    sortOrder: 0,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCat(null);
    setFormData({
      key: '',
      label: '',
      folder: '',
      chip: '#2F7A6E',
      sortOrder: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCat(cat);
    setFormData({
      key: cat.key,
      label: cat.label,
      folder: cat.folder,
      chip: cat.chip,
      sortOrder: cat.sortOrder,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/categories';
      const method = editingCat ? 'PUT' : 'POST';
      const payload = editingCat ? { ...formData, id: editingCat.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        alert(data.error || 'Failed to save category');
      }
    } catch {
      alert('Error saving category');
    }
  };

  const handleDelete = async (id: number, label: string) => {
    if (
      !confirm(
        `Are you sure you want to delete category "${label}"? Products in this category will also be deleted.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch {
      alert('Error deleting category');
    }
  };

  const colorPresets = [
    { label: 'Forest Teal', value: '#2F7A6E' },
    { label: 'Marigold Gold', value: '#E8A33D' },
    { label: 'Festival Plum', value: '#8B3A62' },
    { label: 'Deep Ink', value: '#2B2118' },
    { label: 'Rust Orange', value: '#C4801F' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-[var(--ink)] pb-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Categories & Shelves
          </h1>
          <p className="font-mono text-xs opacity-70 mt-1">
            Organize craft products into distinct collections
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary btn-sm">
          + Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="bg-[var(--paper-deep)] border-2 border-[var(--ink)] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <p className="p-8 text-center font-mono text-sm opacity-60">
            Loading categories...
          </p>
        ) : (
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-[var(--ink)] bg-[var(--paper)]">
                <th className="p-3">Order</th>
                <th className="p-3">Tag Chip</th>
                <th className="p-3">Category Name</th>
                <th className="p-3">Folder / Key</th>
                <th className="p-3 text-center">Products</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[var(--paper)]/60 transition-colors">
                  <td className="p-3 font-bold">{cat.sortOrder}</td>
                  <td className="p-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: cat.chip }}
                    >
                      {cat.label}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-sm text-[var(--ink)]">
                    {cat.label}
                  </td>
                  <td className="p-3 opacity-75">
                    <code>{cat.folder || cat.key}</code>
                  </td>
                  <td className="p-3 text-center font-bold">
                    {cat._count?.products || 0}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="px-2.5 py-1 rounded-lg border border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--marigold)] transition-colors text-[11px] font-bold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.label)}
                      className="px-2.5 py-1 rounded-lg border border-[var(--plum)] text-[var(--plum)] hover:bg-[var(--plum)] hover:text-white transition-colors text-[11px] font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay open">
          <div className="modal-box w-11/12 max-w-md p-6 md:p-8">
            <div className="flex justify-between items-center border-b-2 border-[var(--ink)] pb-3 mb-5">
              <h2 className="font-display text-2xl font-bold">
                {editingCat ? 'Edit Category' : 'New Category'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-2xl leading-none hover:text-[var(--plum)]"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase mb-1 font-bold">
                  Display Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clay Jewellery"
                  className="field mb-0 text-sm"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      label: e.target.value,
                      key: editingCat
                        ? formData.key
                        : e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''),
                      folder: editingCat
                        ? formData.folder
                        : e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    })
                  }
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase mb-1 font-bold">
                  URL Key *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingCat}
                  placeholder="e.g. clayjewellery"
                  className="field mb-0 text-sm font-mono"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase mb-1 font-bold">
                  Folder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. clay-jewellery"
                  className="field mb-0 text-sm font-mono"
                  value={formData.folder}
                  onChange={(e) =>
                    setFormData({ ...formData, folder: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase mb-1 font-bold">
                  Tag Chip Accent Color
                </label>
                <div className="flex gap-2 items-center mb-2">
                  <input
                    type="color"
                    className="w-10 h-10 p-1 border-2 border-[var(--ink)] rounded-lg cursor-pointer bg-white"
                    value={formData.chip}
                    onChange={(e) =>
                      setFormData({ ...formData, chip: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="field mb-0 text-xs font-mono flex-1"
                    value={formData.chip}
                    onChange={(e) =>
                      setFormData({ ...formData, chip: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, chip: preset.value })
                      }
                      className="text-[10px] font-mono px-2 py-1 rounded border border-[var(--ink)] flex items-center gap-1.5"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: preset.value }}
                      />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase mb-1 font-bold">
                  Display Sort Order
                </label>
                <input
                  type="number"
                  className="field mb-0 text-sm"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 justify-center"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
