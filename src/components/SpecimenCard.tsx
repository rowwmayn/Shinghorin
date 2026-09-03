'use client';

import { Product, Category } from '@/lib/types';
import { formatPrice, getProductImagePath } from '@/lib/utils';
import Image from 'next/image';

interface SpecimenCardProps {
  product: Product;
  categories: Category[];
  onOpenModal: (product: Product) => void;
}

export default function SpecimenCard({
  product,
  categories,
  onOpenModal,
}: SpecimenCardProps) {
  const category =
    product.category || categories.find((c) => c.id === product.categoryId);

  const images: string[] = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images || '[]')
    : [];

  const variants: any[] = Array.isArray(product.variants)
    ? product.variants
    : typeof product.variants === 'string'
    ? JSON.parse(product.variants || '[]')
    : [];

  const primaryImage = images[0] || '';
  const imageSrc = getProductImagePath(category?.folder, primaryImage);

  const getPriceDisplay = () => {
    if (variants && variants.length > 0) {
      const prices = variants.map((v) => v.price).filter((p) => typeof p === 'number');
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        return `FROM ${formatPrice(minPrice)}`;
      }
    }
    return formatPrice(product.price);
  };

  return (
    <div
      className="specimen-card group cursor-pointer flex flex-col justify-between"
      onClick={() => onOpenModal(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenModal(product);
        }
      }}
    >
      <div>
        <div className="specimen-img-wrap relative">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.svg';
            }}
          />
          {product.badge && <span className="badge-tag">{product.badge}</span>}
        </div>

        <div className="p-3 md:p-4">
          <h3 className="font-display text-base md:text-xl font-bold leading-tight line-clamp-1">
            {product.name}
          </h3>
          {product.bn && (
            <p className="font-bn text-xs md:text-sm opacity-60 mb-2">{product.bn}</p>
          )}
        </div>
      </div>

      <div className="p-3 md:p-4 pt-0">
        <div className="flex justify-between items-center font-mono border-t border-[var(--line)] pt-2.5">
          <span className="text-xs md:text-sm font-bold text-[var(--ink)]">
            {getPriceDisplay()}
          </span>
          <span className="text-[10px] md:text-xs underline font-bold tracking-wider hover:text-[var(--plum)] transition-colors">
            VIEW +
          </span>
        </div>
      </div>
    </div>
  );
}
