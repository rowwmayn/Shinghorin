'use client';

import { useState, useMemo } from 'react';
import { Product, Category } from '@/lib/types';
import SpecimenCard from './SpecimenCard';

interface ProductCatalogProps {
  categories: Category[];
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (key: string) => void;
  onOpenProductModal: (product: Product) => void;
}

export default function ProductCatalog({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
  onOpenProductModal,
}: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        (p.category && p.category.key === selectedCategory) ||
        categories.find((c) => c.id === p.categoryId)?.key === selectedCategory;

      if (!matchesCategory) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(query);
      const matchBn = p.bn ? p.bn.toLowerCase().includes(query) : false;
      const matchDesc = p.description.toLowerCase().includes(query);

      return matchName || matchBn || matchDesc;
    });
  }, [products, categories, selectedCategory, searchQuery]);

  return (
    <section id="catalog" className="py-16 md:py-20 px-5 md:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-2 border-[var(--ink)] pb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--marigold-deep)] mb-2">
              The Shop
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-bold">
              Everything Handmade
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-mono text-xs px-3.5 py-1.5 rounded-full border-2 border-[var(--ink)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--marigold)] w-44 md:w-56"
            />
            <span className="font-mono text-xs md:text-sm text-[var(--ink)]/80">
              Cash on Delivery, Dhaka-wide
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2.5 mb-10 overflow-x-auto pb-2 scrollbar-none" id="filter-row">
          <button
            type="button"
            className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onSelectCategory('all')}
          >
            ALL
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-pill ${selectedCategory === cat.key ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.key)}
            >
              {cat.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div
            id="product-grid"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-8"
          >
            {filteredProducts.map((p) => (
              <SpecimenCard
                key={p.id}
                product={p}
                categories={categories}
                onOpenModal={onOpenProductModal}
              />
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-20 px-4 opacity-75 font-hand text-2xl md:text-3xl max-w-xl mx-auto">
            ✦ Coming soon — this little corner of the shop is still being stitched together! ✦
          </div>
        )}
      </div>
    </section>
  );
}
