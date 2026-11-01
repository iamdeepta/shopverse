'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LIVE_STORES, type StoreEntry } from '@/data/stores';

export function ComingSoon({ store }: { store: StoreEntry }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div className="min-h-[80vh] bg-[#faf7f2] text-[#221a15]">
      <header className="border-b border-[#e6ddd3]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-display text-xl font-bold tracking-[0.18em]">
            SHOP<span className="text-[#b4552d]">VERSE</span>
          </Link>
          <Link href="/" className="rounded-full border border-[#221a15] px-4 py-2 text-sm font-semibold">
            ← All stores
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br ${store.gradient} font-display text-5xl font-bold text-white shadow-xl`}>
          {store.name.charAt(0)}
        </div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-[#b4552d]">Opening soon · {store.tagline}</p>
        <h1 className="mt-3 font-display text-5xl font-bold sm:text-6xl">{store.name}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-[#6f625a]">{store.description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {store.vibe.map((v) => (
            <span key={v} className="rounded-full bg-[#f1e9e1] px-3 py-1 text-xs font-semibold">
              {v}
            </span>
          ))}
          {store.categories.map((c) => (
            <span key={c} className="rounded-full border border-[#e6ddd3] px-3 py-1 text-xs font-medium">
              {c}
            </span>
          ))}
        </div>
        {done ? (
          <p className="mx-auto mt-10 max-w-md rounded-2xl bg-[#eefaf4] px-5 py-4 font-medium text-[#166534]">
            ✓ You are on the list. We will email you the moment {store.name} opens.
          </p>
        ) : (
          <form
            className="mx-auto mt-10 flex max-w-md gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes('@')) setDone(true);
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email for opening day"
              className="min-w-0 flex-1 rounded-full border border-[#e6ddd3] bg-white px-5 py-3 outline-none focus:border-[#b4552d]"
            />
            <button type="submit" className="shrink-0 rounded-full bg-[#221a15] px-6 py-3 font-semibold text-white">
              Notify me
            </button>
          </form>
        )}
        <p className="mt-10 text-sm text-[#6f625a]">
          Meanwhile, our first store is open —{' '}
          <Link href={`/shop/${LIVE_STORES[0]?.slug ?? 'aurelle'}`} className="font-semibold text-[#b4552d] underline underline-offset-4">
            visit {LIVE_STORES[0]?.name ?? 'AURELLE'} →
          </Link>
        </p>
      </main>
    </div>
  );
}
