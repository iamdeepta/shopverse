'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { PROMO_CODE, PROMO_PERCENT, formatPrice, getStoreData, getStoreProduct } from '@/data/catalog';

export function CartDrawer({ storeSlug, storeName }: { storeSlug: string; storeName: string }) {
  const { items, drawerOpen, setDrawerOpen, updateQty, removeItem, totalsFor, applyPromo, removePromo, promo } = useCart();
  const [code, setCode] = useState('');
  const [promoMsg, setPromoMsg] = useState('');

  const list = items[storeSlug] ?? [];
  const totals = totalsFor(storeSlug);
  const threshold = getStoreData(storeSlug)?.freeShippingThreshold ?? 150;

  const submitPromo = () => {
    if (applyPromo(code)) {
      setPromoMsg(`${PROMO_CODE} applied — ${PROMO_PERCENT}% off.`);
    } else {
      setPromoMsg(`That code is not valid. Try ${PROMO_CODE}.`);
    }
  };

  return (
    <div className={`fixed inset-0 z-[70] ${drawerOpen ? '' : 'pointer-events-none'}`} aria-hidden={!drawerOpen}>
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[var(--surface)] shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <h2 className="font-display text-xl">
            Your cart <span className="text-base text-[var(--ink-soft)]">({list.reduce((n, i) => n + i.qty, 0)})</span>
          </h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition-colors hover:bg-[var(--surface-2)]"
          >
            ×
          </button>
        </div>

        <div className="border-b border-[var(--line)] px-5 py-3">
          <p className="text-sm">
            {totals.freeShippingRemaining > 0 ? (
              <>
                <strong>{formatPrice(totals.freeShippingRemaining)}</strong> away from free shipping
              </>
            ) : (
              <>🎉 You have unlocked free shipping!</>
            )}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
              style={{ width: `${Math.round(totals.freeShippingProgress * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">Free shipping over {formatPrice(threshold)}</p>
        </div>

        <div className="nice-scroll flex-1 overflow-y-auto px-5 py-4">
          {list.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-display text-2xl">Your cart is empty.</p>
              <p className="max-w-[260px] text-sm text-[var(--ink-soft)]">
                Beautiful things are waiting. Start with the bestsellers.
              </p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="mt-2 rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-[var(--brand-ink)]"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {list.map((item, idx) => {
                const p = getStoreProduct(storeSlug, item.productId);
                if (!p) return null;
                return (
                  <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-2)]">
                      <Image src={p.image} alt={p.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="text-xs text-[var(--ink-soft)]">
                        {item.color} · Size {item.size}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-[var(--line)]">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(storeSlug, idx, item.qty - 1)}
                            className="flex h-8 w-8 items-center justify-center text-lg"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQty(storeSlug, idx, item.qty + 1)}
                            className="flex h-8 w-8 items-center justify-center text-lg"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-semibold">{formatPrice(p.price * item.qty)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${p.name}`}
                      onClick={() => removeItem(storeSlug, idx)}
                      className="self-start text-lg text-[var(--ink-soft)] transition-colors hover:text-red-600"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {list.length > 0 && (
          <div className="border-t border-[var(--line)] px-5 py-4">
            {promo ? (
              <div className="mb-3 flex items-center justify-between rounded-lg bg-[var(--brand-soft)] px-3 py-2 text-sm">
                <span>
                  Code <strong>{promo}</strong> applied (−{PROMO_PERCENT}%)
                </span>
                <button type="button" onClick={removePromo} className="font-semibold underline">
                  Remove
                </button>
              </div>
            ) : (
              <div className="mb-3 flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Promo code (try ${PROMO_CODE})`}
                  className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm outline-none focus:border-[var(--brand)]"
                />
                <button
                  type="button"
                  onClick={submitPromo}
                  className="shrink-0 rounded-full border border-[var(--ink)] px-4 py-2 text-sm font-semibold"
                >
                  Apply
                </button>
              </div>
            )}
            {promoMsg && <p className="mb-2 text-xs text-[var(--ink-soft)]">{promoMsg}</p>}
            <div className="flex flex-col gap-1 text-sm">
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </p>
              {totals.discount > 0 && (
                <p className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>−{formatPrice(totals.discount)}</span>
                </p>
              )}
              <p className="flex justify-between">
                <span>Shipping</span>
                <span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span>
              </p>
              <p className="flex justify-between border-t border-[var(--line)] pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </p>
            </div>
            <Link
              href={`/shop/${storeSlug}/checkout`}
              onClick={() => setDrawerOpen(false)}
              className="btn-shine mt-4 block w-full rounded-full bg-[var(--brand)] py-3 text-center font-semibold text-[var(--brand-ink)] transition hover:brightness-110"
            >
              Go to checkout
            </Link>
            <p className="mt-2 text-center text-xs text-[var(--ink-soft)]">Secure checkout · {storeName} demo store — no real payment.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
