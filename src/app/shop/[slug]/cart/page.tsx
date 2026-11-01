'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { PRODUCTS, formatPrice, getProduct } from '@/data/aurelle';

const SLUG = 'aurelle';

export default function CartPage() {
  const { items, updateQty, removeItem, totalsFor, applyPromo, removePromo, promo } = useCart();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const list = items[SLUG] ?? [];
  const totals = totalsFor(SLUG);

  const submitPromo = () => {
    if (applyPromo(code)) setMsg('WELCOME10 applied — 10% off your order.');
    else setMsg('That code is not valid. Try WELCOME10.');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Shopping cart</h1>
      <p className="mt-2 text-[var(--ink-soft)]">
        {list.length === 0 ? 'Nothing here yet.' : `${list.reduce((n, i) => n + i.qty, 0)} item(s) in your cart.`}
      </p>

      {list.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius)] border border-dashed border-[var(--line)] px-6 py-16 text-center">
          <p className="font-display text-3xl font-bold">Your cart is empty.</p>
          <p className="mx-auto mt-2 max-w-sm text-[var(--ink-soft)]">Beautiful things are waiting — start with the pieces everyone loves.</p>
          <Link
            href={`/shop/${SLUG}/products`}
            className="mt-6 inline-block rounded-full bg-[var(--brand)] px-7 py-3 font-semibold text-[var(--brand-ink)]"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="flex flex-col gap-5">
            {list.map((item, idx) => {
              const p = getProduct(item.productId);
              if (!p) return null;
              return (
                <li
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 rounded-[var(--radius)] border border-[var(--line)] bg-white p-4"
                >
                  <Link href={`/shop/${SLUG}/product/${p.id}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-2)]">
                    <Image src={p.image} alt={p.name} fill sizes="96px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/shop/${SLUG}/product/${p.id}`} className="font-display text-lg font-bold leading-snug hover:text-[var(--brand)]">
                        {p.name}
                      </Link>
                      <button
                        type="button"
                        aria-label={`Remove ${p.name}`}
                        onClick={() => removeItem(SLUG, idx)}
                        className="text-xl text-[var(--ink-soft)] hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-sm text-[var(--ink-soft)]">
                      {item.color} · Size {item.size} · {formatPrice(p.price)} each
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-[var(--line)]">
                        <button type="button" aria-label="Decrease quantity" onClick={() => updateQty(SLUG, idx, item.qty - 1)} className="flex h-9 w-9 items-center justify-center text-lg">
                          −
                        </button>
                        <span className="w-7 text-center font-semibold">{item.qty}</span>
                        <button type="button" aria-label="Increase quantity" onClick={() => updateQty(SLUG, idx, item.qty + 1)} className="flex h-9 w-9 items-center justify-center text-lg">
                          +
                        </button>
                      </div>
                      <p className="text-lg font-bold">{formatPrice(p.price * item.qty)}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit rounded-[var(--radius)] border border-[var(--line)] bg-white p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-2xl font-bold">Order summary</h2>
            <div className="mt-4">
              <p className="text-sm">
                {totals.freeShippingRemaining > 0 ? (
                  <>
                    Add <strong>{formatPrice(totals.freeShippingRemaining)}</strong> more for free shipping
                  </>
                ) : (
                  <>🎉 Free shipping unlocked</>
                )}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div className="h-full rounded-full bg-[var(--brand)] transition-all duration-500" style={{ width: `${Math.round(totals.freeShippingProgress * 100)}%` }} />
              </div>
            </div>
            {promo ? (
              <div className="mt-5 flex items-center justify-between rounded-lg bg-[var(--brand-soft)] px-3 py-2 text-sm">
                <span>
                  Code <strong>{promo}</strong> (−10%)
                </span>
                <button type="button" onClick={removePromo} className="font-semibold underline">
                  Remove
                </button>
              </div>
            ) : (
              <div className="mt-5 flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Promo code"
                  className="min-w-0 flex-1 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                />
                <button type="button" onClick={submitPromo} className="rounded-full border border-[var(--ink)] px-4 py-2.5 text-sm font-semibold">
                  Apply
                </button>
              </div>
            )}
            {msg && <p className="mt-2 text-xs text-[var(--ink-soft)]">{msg}</p>}
            <div className="mt-5 flex flex-col gap-1.5 text-sm">
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </p>
              {totals.discount > 0 && (
                <p className="flex justify-between text-green-700">
                  <span>Discount (WELCOME10)</span>
                  <span>−{formatPrice(totals.discount)}</span>
                </p>
              )}
              <p className="flex justify-between">
                <span>Shipping</span>
                <span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span>
              </p>
              <p className="flex justify-between border-t border-[var(--line)] pt-3 text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </p>
            </div>
            <Link
              href={`/shop/${SLUG}/checkout`}
              className="btn-shine mt-6 block w-full rounded-full bg-[var(--brand)] py-3.5 text-center font-semibold text-[var(--brand-ink)] transition hover:brightness-110"
            >
              Proceed to checkout
            </Link>
            <Link href={`/shop/${SLUG}/products`} className="mt-3 block text-center text-sm font-semibold underline underline-offset-4 hover:text-[var(--brand)]">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}

      <section className="mt-16">
        <h2 className="font-display text-3xl font-bold">Complete the look</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {PRODUCTS.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} storeSlug={SLUG} />
          ))}
        </div>
      </section>
    </div>
  );
}
