'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // If we are on /admin/login, don't wrap with admin navbar
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/admin/login');
        }
      } catch {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="font-mono text-sm opacity-60 animate-pulse">
          Loading Shinghorin Admin...
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: '📊 Dashboard & Analytics' },
    { href: '/admin/products', label: '📦 Products' },
    { href: '/admin/categories', label: '🏷️ Categories' },
    { href: '/admin/orders', label: '📋 Orders' },
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col md:flex-row text-[var(--ink)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[var(--paper-deep)] border-b-2 md:border-b-0 md:border-r-2 border-[var(--ink)] flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-5 border-b-2 border-[var(--ink)] flex items-center gap-3">
            <div className="relative w-9 h-9">
              <Image
                src="/logo-placeholder.svg"
                alt="Shinghorin"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg leading-none">
                Shinghorin
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--plum)] font-bold">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="p-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[var(--ink)] text-[var(--paper)] shadow-sm'
                      : 'hover:bg-[var(--line)] text-[var(--ink)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t-2 border-[var(--ink)] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="btn btn-outline btn-sm w-full justify-center text-xs"
          >
            Visit Public Shop ↗
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-center py-2 text-xs font-mono text-[var(--plum)] font-bold hover:underline"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
