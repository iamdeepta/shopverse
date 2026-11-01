'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import type { StoreEntry } from '@/data/stores';

export function StoreHeader({ store }: { store: StoreEntry }) {
  const { countFor, wishlist, setDrawerOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const base = `/shop/${store.slug}`;
  const count = countFor(store.slug);

  const links = [
    { href: base, label: 'Home' },
    { href: `${base}/products`, label: 'Shop' },
    { href: `${base}/about`, label: 'About' },
    { href: `${base}/contact`, label: 'Contact' },
  ];

  const isActive = (href: string) => (href === base ? pathname === href : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-colors hover:bg-[var(--surface-2)] md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? '×' : '☰'}
          </button>
          <Link href={base} className="font-display text-2xl font-bold tracking-[0.18em]">
            {store.name}
          </Link>
          <Link href="/" className="hidden rounded-full border border-[var(--line)] px-3 py-1 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--brand)] sm:block">
            ← All stores
          </Link>
        </div>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Store">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium tracking-wide transition-colors hover:text-[var(--brand)] ${
                isActive(l.href) ? 'text-[var(--brand)] underline decoration-2 underline-offset-8' : ''
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href={`${base}/wishlist`}
            aria-label={`Wishlist, ${wishlist.length} items`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors hover:bg-[var(--surface-2)]"
          >
            ♡
            {wishlist.length > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[11px] font-bold text-[var(--brand-ink)]">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={`Open cart, ${count} items`}
            className="relative flex h-11 items-center gap-2 rounded-full bg-[var(--ink)] px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
          >
            🛍 <span className="hidden sm:inline">Cart</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[11px] font-bold">{count}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-[var(--line)] px-4 py-2 md:hidden" aria-label="Store mobile">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-lg px-3 py-3 text-base font-medium ${isActive(l.href) ? 'bg-[var(--brand-soft)] text-[var(--brand)]' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function StoreFooter({ store }: { store: StoreEntry }) {
  const base = `/shop/${store.slug}`;
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface-2)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-bold tracking-[0.18em]">{store.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--ink-soft)]">{store.description}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider">Shop</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link href={`${base}/products`} className="hover:text-[var(--brand)]">
                All products
              </Link>
            </li>
            {store.categories.map((c) => (
              <li key={c}>
                <Link href={`${base}/products?category=${encodeURIComponent(c)}`} className="hover:text-[var(--brand)]">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider">Company</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link href={`${base}/about`} className="hover:text-[var(--brand)]">
                Our story
              </Link>
            </li>
            <li>
              <Link href={`${base}/contact`} className="hover:text-[var(--brand)]">
                Contact us
              </Link>
            </li>
            <li>
              <Link href={`${base}/wishlist`} className="hover:text-[var(--brand)]">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider">Visit the mall</p>
          <p className="mt-3 text-sm text-[var(--ink-soft)]">
            {store.name} is one store inside ShopVerse — a mall of many shops, each with its own style.
          </p>
          <Link href="/" className="mt-3 inline-block rounded-full border border-[var(--ink)] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--ink)] hover:text-white">
            Browse all stores →
          </Link>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-5 text-center text-xs text-[var(--ink-soft)]">
        © 2026 {store.name} · A ShopVerse demo store. Dummy data — no real orders or payments.
      </div>
    </footer>
  );
}
