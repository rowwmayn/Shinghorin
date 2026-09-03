'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Ticker from '@/components/Ticker';
import StitchDivider from '@/components/StitchDivider';
import CollectionGrid from '@/components/CollectionGrid';
import ProductCatalog from '@/components/ProductCatalog';
import CustomRequest from '@/components/CustomRequest';
import HowToOrder from '@/components/HowToOrder';
import Footer from '@/components/Footer';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import Toast from '@/components/Toast';
import { Category, Product, CartItem, Variant } from '@/lib/types';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ message: string; show: boolean; isError: boolean }>({
    message: '',
    show: false,
    isError: false,
  });

  // Show Toast notification
  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, show: true, isError });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  }, []);

  // Load categories and products
  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (catData.success) setCategories(catData.categories);
        if (prodData.success) setProducts(prodData.products);
      } catch (err) {
        console.error('Failed to load shop data:', err);
      }
    }

    loadData();

    // Log page view for built-in analytics
    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer,
      }),
    }).catch(() => {});

    // Load persisted cart from localStorage
    try {
      const savedCart = localStorage.getItem('shinghorin_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Sync cart with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shinghorin_cart', JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  // Handle category selection and smooth scroll to catalog
  const handleSelectCategory = (key: string) => {
    setSelectedCategory(key);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Open modal for product
  const handleOpenProductModal = (product: Product) => {
    setActiveModalProduct(product);
    setIsModalOpen(true);
  };

  // Add item to cart
  const handleAddToCart = ({
    product,
    variant,
    qty,
    price,
    image,
  }: {
    product: Product;
    variant: Variant | null;
    qty: number;
    price: number | null;
    image: string;
  }) => {
    const detail = variant ? variant.label : '';
    const cartKey = variant ? `${product.id}-${variant.label}` : `${product.id}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.type === 'product' && item.cartKey === cartKey
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: updated[existingIdx].qty + qty,
        };
        return updated;
      }

      return [
        ...prev,
        {
          type: 'product',
          id: product.id,
          cartKey,
          name: product.name,
          detail,
          price,
          qty,
          image,
        },
      ];
    });

    showToast('Added to basket');
    setIsCartOpen(true);
  };

  // Remove item from cart
  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    showToast('Item removed from basket');
  };

  // Clear cart
  const handleClearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <main className="min-h-screen">
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <Hero />

      <Ticker />

      <StitchDivider />

      <CollectionGrid
        categories={categories}
        products={products}
        onSelectCategory={handleSelectCategory}
      />

      <ProductCatalog
        categories={categories}
        products={products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenProductModal={handleOpenProductModal}
      />

      <StitchDivider inverted />

      <CustomRequest />

      <HowToOrder />

      <Footer />

      {/* Interactive modals & drawers */}
      <ProductModal
        product={activeModalProduct}
        categories={categories}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onShowToast={showToast}
      />

      <Toast
        message={toast.message}
        show={toast.show}
        isError={toast.isError}
      />
    </main>
  );
}
