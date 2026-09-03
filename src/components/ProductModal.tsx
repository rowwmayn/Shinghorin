'use client';

import { useState, useEffect } from 'react';
import { Product, Category, Variant } from '@/lib/types';
import { formatPrice, getProductImagePath } from '@/lib/utils';
import Image from 'next/image';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: {
    product: Product;
    variant: Variant | null;
    qty: number;
    price: number | null;
    image: string;
  }) => void;
}

export default function ProductModal({
  product,
  categories,
  isOpen,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const category = product
    ? product.category || categories.find((c) => c.id === product.categoryId)
    : null;

  const rawImages = product?.images;
  const images: string[] = Array.isArray(rawImages)
    ? rawImages
    : typeof rawImages === 'string'
    ? JSON.parse(rawImages || '[]')
    : [];

  const rawVariants = product?.variants;
  const variants: Variant[] = Array.isArray(rawVariants)
    ? rawVariants
    : typeof rawVariants === 'string'
    ? JSON.parse(rawVariants || '[]')
    : [];

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setQuantity(1);
      if (variants && variants.length > 0) {
        setSelectedVariant(variants[0]);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [product]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.price ?? null;

  const currentImageFilename = images[currentImageIndex] || '';
  const currentImageSrc = getProductImagePath(category?.folder, currentImageFilename);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleAddToCart = () => {
    onAddToCart({
      product,
      variant: selectedVariant,
      qty: quantity,
      price: currentPrice,
      image: currentImageSrc,
    });
    onClose();
  };

  return (
    <div
      className="modal-overlay open"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-box w-11/12 max-w-lg max-h-[92vh] overflow-y-auto p-5 md:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4 border-b border-[var(--line)] pb-3">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight text-[var(--ink)]">
              {product.name}
            </h3>
            {product.bn && (
              <p className="font-bn text-sm opacity-65 mt-0.5">{product.bn}</p>
            )}
            <p className="font-mono text-sm md:text-base font-bold mt-1 text-[var(--plum)]">
              {formatPrice(currentPrice)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-3xl leading-none hover:text-[var(--plum)] transition-colors p-1"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Carousel */}
        <div className="relative w-full aspect-square mb-5 border-2 border-[var(--ink)] rounded-2xl overflow-hidden bg-white">
          <Image
            src={currentImageSrc}
            alt={product.name}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.svg';
            }}
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-[var(--paper)] border-2 border-[var(--ink)] w-9 h-9 rounded-full flex items-center justify-center font-bold hover:bg-[var(--plum)] hover:text-[var(--paper)] transition-colors"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--paper)] border-2 border-[var(--ink)] w-9 h-9 rounded-full flex items-center justify-center font-bold hover:bg-[var(--plum)] hover:text-[var(--paper)] transition-colors"
                aria-label="Next image"
              >
                ›
              </button>
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 px-2 py-1 rounded-full backdrop-blur-xs">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full border border-[var(--ink)] transition-all ${
                      i === currentImageIndex ? 'bg-[var(--plum)] scale-110' : 'bg-white'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-sm opacity-85 leading-relaxed mb-5 font-medium">
          {product.description}
        </p>

        {/* Variant Picker */}
        {variants.length > 0 && (
          <div className="mb-5">
            <p className="font-mono text-xs uppercase tracking-[0.12em] mb-2 opacity-70">
              Choose size / variant
            </p>
            <div className="flex gap-2 flex-wrap">
              {variants.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`size-pill ${
                    selectedVariant?.label === v.label ? 'selected' : ''
                  }`}
                >
                  {v.label} — {formatPrice(v.price)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Stepper */}
        <div className="flex items-center justify-between mb-6 border-y border-[var(--line)] py-3">
          <span className="font-mono text-xs uppercase tracking-[0.12em] opacity-70">
            Quantity
          </span>
          <div className="qty-stepper">
            <button
              type="button"
              className="qty-btn"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="font-display font-bold text-lg w-7 text-center">
              {quantity}
            </span>
            <button
              type="button"
              className="qty-btn"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>
        </div>

        <p className="text-[0.72rem] opacity-70 mb-5">
          Want a custom colourway or specific character?{' '}
          <a
            href="#custom"
            onClick={onClose}
            className="underline font-bold text-[var(--plum)] hover:opacity-80"
          >
            Send a custom request →
          </a>
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn btn-outline justify-center text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 btn btn-primary justify-center text-sm"
          >
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
}
