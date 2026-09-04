import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Quote pending';
  const currency = process.env.NEXT_PUBLIC_CURRENCY || '৳';
  return `${currency} ${amount.toLocaleString()}`;
}

export function getProductImagePath(folder?: string, filename?: string): string {
  if (!filename) return '/placeholder-product.svg';
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/')) {
    return filename;
  }
  if (filename.startsWith('product-') || !folder) {
    return `/uploads/${filename}`;
  }
  return `/${folder}/${filename}`;
}
