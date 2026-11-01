'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice, getStoreData, getStoreProduct } from '@/data/catalog';

const inputCls =
  'w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]';

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const data = getStoreData(slug);
  const { items, totalsFor, clearStoreCart, setDrawerOpen } = useCart();
  const list = items[slug] ?? [];
  const totals = totalsFor(slug);

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    country: 'United States',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [placedTotal, setPlacedTotal] = useState(0);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.firstName.trim()) next.firstName = 'Required.';
    if (!form.lastName.trim()) next.lastName = 'Required.';
    if (!form.address.trim()) next.address = 'Required.';
    if (!form.city.trim()) next.city = 'Required.';
    if (!form.zip.trim()) next.zip = 'Required.';
    if (!form.cardName.trim()) next.cardName = 'Required.';
    if (form.cardNumber.replace(/\s/g, '').length < 12) next.cardNumber = 'Enter a card number (demo — any digits work).';
    if (!form.expiry.trim()) next.expiry = 'Required.';
    if (form.cvc.length < 3) next.cvc = 'Enter the 3-digit code.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const num = `${data?.orderPrefix ?? 'SV'}-${Math.floor(100000 + Math.random() * 900000)}`;
    setPlacedTotal(totals.total);
    setOrderNumber(num);
    clearStoreCart(slug);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  };

  if (orderNumber) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-soft)] text-4xl">✓</div>
        <h1 className="mt-6 font-display text-4xl font-bold sm:text-5xl">Thank you — order placed!</h1>
        <p className="mt-3 text-lg text-[var(--ink-soft)]">
          Order <strong className="text-[var(--ink)]">{orderNumber}</strong> is confirmed. A receipt was sent to{' '}
          <strong className="text-[var(--ink)]">{form.email}</strong>.
        </p>
        <div className="mx-auto mt-8 max-w-md rounded-[var(--radius)] border border-[var(--line)] bg-white p-6 text-left">
          <p className="flex justify-between text-sm">
            <span>Order total</span>
            <strong>{formatPrice(placedTotal)}</strong>
          </p>
          <p className="mt-2 flex justify-between text-sm">
            <span>Delivery to</span>
            <strong>
              {form.firstName} {form.lastName}, {form.city}
            </strong>
          </p>
          <p className="mt-2 flex justify-between text-sm">
            <span>Estimated delivery</span>
            <strong>3–5 business days</strong>
          </p>
          <p className="mt-4 border-t border-[var(--line)] pt-3 text-xs text-[var(--ink-soft)]">
            Demo store — no payment was taken and nothing will ship. This order exists only on this screen.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/shop/${slug}/products`} className="rounded-full bg-[var(--brand)] px-7 py-3 font-semibold text-[var(--brand-ink)]">
            Keep shopping
          </Link>
          <Link href="/" className="rounded-full border-2 border-[var(--ink)] px-7 py-3 font-semibold">
            Back to the mall
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Checkout</h1>
      <p className="mt-2 text-[var(--ink-soft)]">Demo checkout — no real payment. Use any plausible details.</p>

      {list.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius)] border border-dashed border-[var(--line)] px-6 py-14 text-center">
          <p className="font-display text-3xl font-bold">Your cart is empty.</p>
          <p className="mt-2 text-[var(--ink-soft)]">Add something beautiful first — checkout will be waiting.</p>
          <Link href={`/shop/${slug}/products`} className="mt-6 inline-block rounded-full bg-[var(--brand)] px-7 py-3 font-semibold text-[var(--brand-ink)]">
            Browse products
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-8">
            <section className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6">
              <h2 className="font-display text-2xl font-bold">Contact</h2>
              <div className="mt-4">
                <label htmlFor="email" className="text-sm font-semibold">
                  Email address
                </label>
                <input id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputCls} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            </section>

            <section className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6">
              <h2 className="font-display text-2xl font-bold">Shipping address</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="text-sm font-semibold">
                    First name
                  </label>
                  <input id="firstName" value={form.firstName} onChange={set('firstName')} className={inputCls} />
                  {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="text-sm font-semibold">
                    Last name
                  </label>
                  <input id="lastName" value={form.lastName} onChange={set('lastName')} className={inputCls} />
                  {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="text-sm font-semibold">
                    Street address
                  </label>
                  <input id="address" value={form.address} onChange={set('address')} placeholder="123 Willow Lane, Apt 4" className={inputCls} />
                  {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                </div>
                <div>
                  <label htmlFor="city" className="text-sm font-semibold">
                    City
                  </label>
                  <input id="city" value={form.city} onChange={set('city')} className={inputCls} />
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="zip" className="text-sm font-semibold">
                    ZIP / Postcode
                  </label>
                  <input id="zip" value={form.zip} onChange={set('zip')} className={inputCls} />
                  {errors.zip && <p className="mt-1 text-xs text-red-600">{errors.zip}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="country" className="text-sm font-semibold">
                    Country
                  </label>
                  <select id="country" value={form.country} onChange={set('country')} className={inputCls}>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>Bangladesh</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6">
              <h2 className="font-display text-2xl font-bold">Payment</h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">Demo only — enter any digits. Nothing is charged.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="cardName" className="text-sm font-semibold">
                    Name on card
                  </label>
                  <input id="cardName" value={form.cardName} onChange={set('cardName')} className={inputCls} />
                  {errors.cardName && <p className="mt-1 text-xs text-red-600">{errors.cardName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="cardNumber" className="text-sm font-semibold">
                    Card number
                  </label>
                  <input id="cardNumber" inputMode="numeric" value={form.cardNumber} onChange={set('cardNumber')} placeholder="4242 4242 4242 4242" className={inputCls} />
                  {errors.cardNumber && <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>}
                </div>
                <div>
                  <label htmlFor="expiry" className="text-sm font-semibold">
                    Expiry (MM/YY)
                  </label>
                  <input id="expiry" value={form.expiry} onChange={set('expiry')} placeholder="12/28" className={inputCls} />
                  {errors.expiry && <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>}
                </div>
                <div>
                  <label htmlFor="cvc" className="text-sm font-semibold">
                    CVC
                  </label>
                  <input id="cvc" inputMode="numeric" value={form.cvc} onChange={set('cvc')} placeholder="123" className={inputCls} />
                  {errors.cvc && <p className="mt-1 text-xs text-red-600">{errors.cvc}</p>}
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-[var(--radius)] border border-[var(--line)] bg-white p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-2xl font-bold">Order summary</h2>
            <ul className="mt-4 flex flex-col gap-4">
              {list.map((item) => {
                const p = getStoreProduct(slug, item.productId);
                if (!p) return null;
                return (
                  <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-2)]">
                      <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                      <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ink)] text-[11px] font-bold text-white">
                        {item.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-[var(--ink-soft)]">
                        {item.color} · {item.size}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(p.price * item.qty)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex flex-col gap-1.5 border-t border-[var(--line)] pt-4 text-sm">
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
              <p className="flex justify-between border-t border-[var(--line)] pt-3 text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </p>
            </div>
            <button
              type="submit"
              className="btn-shine mt-6 w-full rounded-full bg-[var(--brand)] py-3.5 font-semibold text-[var(--brand-ink)] transition hover:brightness-110"
            >
              Place order — {formatPrice(totals.total)}
            </button>
            <p className="mt-3 text-center text-xs text-[var(--ink-soft)]">🔒 Encrypted demo checkout · No real payment taken.</p>
          </aside>
        </form>
      )}
    </div>
  );
}
