export interface Category {
  id: number;
  key: string;
  label: string;
  folder: string;
  chip: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Variant {
  label: string;
  price: number;
}

export interface Product {
  id: number;
  categoryId: number;
  category?: Category;
  name: string;
  bn?: string | null;
  description: string;
  badge?: string | null;
  price?: number | null;
  variants?: Variant[] | string | null;
  images: string[] | string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  type: 'product';
  id: number;
  cartKey: string;
  name: string;
  detail: string;
  price: number | null;
  qty: number;
  image?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  preferredDate?: string | null;
  items: CartItem[] | string;
  total: number;
  hasCustom: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  source?: 'WEBSITE' | 'WHATSAPP' | string;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PageViewStat {
  date: string;
  views: number;
}
