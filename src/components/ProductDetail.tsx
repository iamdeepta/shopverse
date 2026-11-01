'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/anim';
import { Stars } from '@/components/Stars';
import { formatPrice, getProduct, relatedProducts } from '@/data/aurelle';

const SLUG = 'aurelle';

const GALLERY_VIEWS = [
  { label: 'Full view', className: 'object-cover' },
  { label: 'Detail', className: 'scale-[1.6] object-cover object-top' },
  { label: 'Fabric', className: 'scale-[1.45] object-cover object-bottom' },
];

const REVIEW_SNIPPETS = [
  { name: 'Maya K.', title: 'Worth every penny', text: 'The quality is immediately obvious the moment you open the box. Beautifully made, true to size, and it looks even better in person.' },
  { name: 'Jordan P.', title: 'My new favorite', text: 'I was nervous ordering online, but the fit guide was spot on. Comfortable from day one and I have already ordered a second color.' },
  { name: 'Sofia L.', title: 'Beautifully crafted', text: 'You can feel the care in the details — stitching, materials, packaging. This is how online shopping should feel.' },
];

export function ProductDetail({ productId }: { productId: string }) {
  const product = getProduct(productId);
  const { addToCart, wishlist, toggleWishlist, setDrawerOpen } = useCart();
  const [size, setSize] = useState(product?.sizes[0] ?? '');
  const [color, setColor] = useState(product?.colors[0] ?? '');
  const [qty, setQty] = useState(1);
  const [view, setView] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>('details');
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;
  const wished = wishlist.includes(product.id);
  const related = relatedProducts(product.id);
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const reviews = REVIEW_SNIPPETS.map((r, i) => ({
    ...r,
    rating: Math.max(4, Math.min(5, Math.round(product.rating) - (i % 2))),
  }));

  const add = (goToCart: boolean) => {
    addToCart(SLUG, { productId: product.id, size, color, qty });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2500);
    if (goToCart) setDrawerOpen(true);
  };

  const sections = [
    { id: 'details', title: 'Details & materials', body: product.details },
    {
      id: 'shipping',
      title: 'Shipping & delivery',
      body: [
        'Orders ship within 1–2 business days, tracked door to door.',
        'Free shipping on orders over $150; flat $8 under that.',
        'Express delivery available at checkout (demo store — no real shipments).',
      ],
    },
    {
      id: 'returns',
      title: 'Returns & exchanges',
      body: [
        '60-day free returns, no questions asked.',
        'Items must be unworn with tags attached.',
        'Exchanges for size or color are always free.',
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--ink-soft)]">
        <Link href={`/shop/${SLUG}`} className="hover:text-[var(--brand)]">
          Home
        </Link>{' '}
        /{' '}
        <Link href={`/shop/${SLUG}/products`} className="hover:text-[var(--brand)]">
          Shop
        </Link>{' '}
        / <span className="text-[var(--ink)]">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-[var(--radius)] bg-[var(--surface-2)]">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                key={view}
                src={product.image}
                alt={`${product.name} — ${GALLERY_VIEWS[view].label}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`transition-transform duration-500 ${GALLERY_VIEWS[view].className}`}
              />
            </div>
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-[var(--ink)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                {product.badge}
              </span>
            )}
          </div>
          <div className="mt-3 flex gap-3" role="tablist" aria-label="Product views">
            {GALLERY_VIEWS.map((v, i) => (
              <button
                key={v.label}
                type="button"
                role="tab"
                aria-selected={view === i}
                onClick={() => setView(i)}
                className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  view === i ? 'border-[var(--brand)]' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={product.image} alt="" fill sizes="64px" className={`object-cover ${v.className}`} />
                <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[9px] font-semibold text-white">
                  {v.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <Stars rating={product.rating} />
            <span className="text-sm text-[var(--ink-soft)]">
              {product.rating} · {product.reviews} reviews
            </span>
          </div>
          <p className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAt && (
              <>
                <span className="text-lg text-[var(--ink-soft)] line-through">{formatPrice(product.compareAt)}</span>
                <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-bold text-[var(--brand)]">Save {discount}%</span>
              </>
            )}
          </p>
          <p className="mt-4 leading-relaxed text-[var(--ink-soft)]">{product.description}</p>
          <p className="mt-3 text-sm text-[var(--ink-soft)]">{product.short}</p>

          <div className="mt-7">
            <p className="text-sm font-semibold">
              Color: <span className="font-normal text-[var(--ink-soft)]">{color}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-pressed={color === c}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    color === c
                      ? 'border-[var(--brand)] bg-[var(--brand)] font-semibold text-[var(--brand-ink)]'
                      : 'border-[var(--line)] bg-white hover:border-[var(--brand)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Size: <span className="font-normal text-[var(--ink-soft)]">{size}</span>
              </p>
              <button type="button" className="text-sm underline underline-offset-4 hover:text-[var(--brand)]">
                Size guide
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={`min-w-12 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    size === s
                      ? 'border-[var(--ink)] bg-[var(--ink)] font-semibold text-white'
                      : 'border-[var(--line)] bg-white hover:border-[var(--ink)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center justify-between rounded-full border border-[var(--line)] px-2 sm:w-36">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center text-xl">
                −
              </button>
              <span className="font-semibold">{qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(9, q + 1))} className="flex h-11 w-11 items-center justify-center text-xl">
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => add(false)}
              className="btn-shine flex-1 rounded-full bg-[var(--brand)] py-3.5 font-semibold text-[var(--brand-ink)] transition hover:brightness-110 active:scale-[0.99]"
            >
              {justAdded ? '✓ Added to cart' : `Add to cart — ${formatPrice(product.price * qty)}`}
            </button>
            <button
              type="button"
              onClick={() => add(true)}
              className="rounded-full border-2 border-[var(--ink)] px-6 py-3.5 font-semibold transition-colors hover:bg-[var(--ink)] hover:text-white"
            >
              Buy now
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-2xl transition-transform hover:scale-105 active:scale-95"
            >
              <span className={wished ? 'text-red-500' : ''}>{wished ? '♥' : '♡'}</span>
            </button>
          </div>

          <p className="mt-4 text-sm text-[var(--ink-soft)]">
            🚚 Free shipping over $150 · ↩ 60-day free returns · 🔒 Secure demo checkout — no real payment.
          </p>

          <div className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {sections.map((s) => {
              const open = openSection === s.id;
              return (
                <div key={s.id}>
                  <button
                    type="button"
                    onClick={() => setOpenSection(open ? null : s.id)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between py-4 text-left font-semibold"
                  >
                    {s.title}
                    <span className={`transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {open && (
                    <ul className="list-disc space-y-1.5 pb-5 pl-5 text-sm leading-relaxed text-[var(--ink-soft)]">
                      {s.body.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">What buyers say</h2>
        </Reveal>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name} className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-5">
              <Stars rating={r.rating} />
              <p className="mt-2 font-semibold">{r.title}</p>
              <blockquote className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">“{r.text}”</blockquote>
              <figcaption className="mt-3 text-sm font-medium">
                {r.name} <span className="text-[var(--ink-soft)]">· Verified buyer</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <Reveal>
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">You may also like</h2>
            <Link href={`/shop/${SLUG}/products`} className="font-semibold underline decoration-2 underline-offset-8 hover:text-[var(--brand)]">
              View all →
            </Link>
          </div>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} storeSlug={SLUG} />
          ))}
        </div>
      </section>
    </div>
  );
}
