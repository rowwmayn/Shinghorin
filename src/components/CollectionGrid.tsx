'use client';

import { Category, Product } from '@/lib/types';
import { getProductImagePath } from '@/lib/utils';
import Image from 'next/image';

interface CollectionGridProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (key: string) => void;
}

export default function CollectionGrid({
  categories,
  products,
  onSelectCategory,
}: CollectionGridProps) {
  const getCategoryCover = (cat: Category) => {
    const coverProduct = products.find((p) => p.categoryId === cat.id || (p.category && p.category.key === cat.key));
    if (!coverProduct) return '/placeholder-product.svg';

    let firstImg = '';
    if (Array.isArray(coverProduct.images) && coverProduct.images.length > 0) {
      firstImg = coverProduct.images[0];
    } else if (typeof coverProduct.images === 'string') {
      try {
        const parsed = JSON.parse(coverProduct.images);
        firstImg = parsed[0] || '';
      } catch {
        firstImg = '';
      }
    }
    return getProductImagePath(cat.folder, firstImg);
  };

  return (
    <section className="py-16 md:py-20 px-5 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--marigold-deep)] mb-3">
            Handcrafted Treasures
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-bold">Wander the Shelves</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="collection-card group"
              onClick={() => onSelectCategory(cat.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectCategory(cat.key);
                }
              }}
            >
              <div className="w-full h-full relative">
                <Image
                  src={getCategoryCover(cat)}
                  alt={cat.label}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-product.svg';
                  }}
                />
              </div>
              <div className="collection-overlay">
                <span
                  className="tag-chip mb-2 w-fit text-[var(--paper)] font-bold shadow-sm"
                  style={{ backgroundColor: cat.chip || '#2F7A6E' }}
                >
                  {cat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
