'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
}

export default function Navbar({ cartCount, onOpenCart }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-[var(--paper)]/95 border-b-2 border-[var(--ink)] top-0 left-0 backdrop-blur-sm">
      <div className="flex justify-between items-center px-5 md:px-10 py-3 max-w-7xl mx-auto">
        <Link href="#top" className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 md:w-11 md:h-11">
            <Image
              src="/logo-placeholder.svg"
              alt="Shinghorin logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">Shinghorin</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 font-mono text-xs uppercase tracking-[0.1em]">
          <Link href="#catalog" className="hover:text-[var(--plum)] transition-colors">
            Shop
          </Link>
          <Link href="#custom" className="hover:text-[var(--plum)] transition-colors">
            Custom Request
          </Link>
          <Link href="#footer" className="hover:text-[var(--plum)] transition-colors">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="font-mono text-xs font-bold border-2 border-[var(--ink)] px-3 py-2 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
            id="cart-btn-top"
          >
            BASKET ({cartCount})
          </button>
          <button
            className="md:hidden border-2 border-[var(--ink)] w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="font-mono text-sm">{mobileMenuOpen ? '✕' : '≡'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu md:hidden border-t border-[var(--line)] ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="flex flex-col font-mono text-xs uppercase tracking-[0.1em] px-5 py-3 gap-3">
          <Link href="#catalog" onClick={() => setMobileMenuOpen(false)}>
            Shop
          </Link>
          <Link href="#custom" onClick={() => setMobileMenuOpen(false)}>
            Custom Request
          </Link>
          <Link href="#footer" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
