'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Counter, Reveal, prefersReducedMotion, useGsapRegistered } from '@/components/anim';
import { LIVE_STORES, SOON_STORES, STORES } from '@/data/stores';

const MARQUEE_WORDS = STORES.map((s) => s.name.toUpperCase());

export default function LandingPage() {
  const heroRef = useRef<HTMLElement | null>(null);
  useGsapRegistered();

  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof window === 'undefined' || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.sv-hero-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
        .fromTo('.sv-hero-title span', { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.2)
        .fromTo('.sv-hero-sub', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, 0.55)
        .fromTo('.sv-hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.7)
        .fromTo('.sv-hero-image', { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, 0.3);
    }, el);
    return () => ctx.revert();
  }, []);

  const live = LIVE_STORES[0];

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#221a15]">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-[#e6ddd3] bg-[#faf7f2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="font-display text-2xl font-bold tracking-[0.22em]">
            SHOP<span className="text-[#b4552d]">VERSE</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#stores" className="transition-colors hover:text-[#b4552d]">
              Stores
            </a>
            <a href="#live" className="transition-colors hover:text-[#b4552d]">
              Now open
            </a>
            <a href="#why" className="transition-colors hover:text-[#b4552d]">
              Why ShopVerse
            </a>
          </nav>
          <Link
            href="/shop/aurelle"
            className="rounded-full bg-[#221a15] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
          >
            Enter the store →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="sv-hero-eyebrow text-xs font-bold uppercase tracking-[0.22em] text-[#b4552d]">
              One mall · Many beautiful stores
            </p>
            <h1 className="sv-hero-title mt-4 font-display text-5xl leading-[1.04] font-bold sm:text-6xl lg:text-7xl">
              <span className="block">Every store,</span>
              <span className="block">its own</span>
              <span className="block italic text-[#b4552d]">beautiful world.</span>
            </h1>
            <p className="sv-hero-sub mt-5 max-w-lg text-lg leading-relaxed text-[#6f625a]">
              ShopVerse brings many specialist shops under one roof. Each store has its own design, colors and
              personality — browse the mall, step inside a store, and shop the way it was meant to feel.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop/aurelle"
                className="sv-hero-cta btn-shine rounded-full bg-[#b4552d] px-7 py-3.5 font-semibold text-white transition hover:brightness-110"
              >
                Shop AURELLE — now open
              </Link>
              <a
                href="#stores"
                className="sv-hero-cta rounded-full border-2 border-[#221a15] px-7 py-3.5 font-semibold transition-colors hover:bg-[#221a15] hover:text-white"
              >
                See all stores
              </a>
            </div>
            <dl className="mt-10 flex gap-8 border-t border-[#e6ddd3] pt-6">
              <div>
                <dt className="text-xs uppercase tracking-wider text-[#6f625a]">Stores</dt>
                <dd className="font-display text-3xl font-bold">
                  <Counter to={STORES.length} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[#6f625a]">Open now</dt>
                <dd className="font-display text-3xl font-bold">
                  <Counter to={LIVE_STORES.length} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[#6f625a]">Opening soon</dt>
                <dd className="font-display text-3xl font-bold">
                  <Counter to={SOON_STORES.length} />
                </dd>
              </div>
            </dl>
          </div>

          <div className="sv-hero-image relative">
            <div className="relative overflow-hidden rounded-[24px] shadow-[0_30px_60px_-25px_rgba(34,26,21,0.45)]">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/11]">
                <Image
                  src="/shopverse/images/aurelle/hero-editorial.jpg"
                  alt="AURELLE editorial — model in a camel wool coat"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 pt-16 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Now open · Fashion & Lifestyle</p>
                <p className="font-display text-2xl font-bold">AURELLE — Dress like the light is yours.</p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 rotate-[-3deg] rounded-2xl bg-white px-5 py-3 shadow-lg sm:-left-6">
              <p className="text-sm font-bold">★ 4.9 average rating</p>
              <p className="text-xs text-[#6f625a]">1,300+ happy shoppers (demo data)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-paused overflow-hidden border-y border-[#e6ddd3] bg-white py-3.5" aria-hidden>
        <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className="flex items-center gap-8 text-sm font-bold uppercase tracking-[0.28em] text-[#6f625a]">
              {w} <span className="text-[#b4552d]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Live store feature */}
      {live && (
        <section id="live" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b4552d]">Now open</p>
                <h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Step inside {live.name}</h2>
              </div>
              <Link href={`/shop/${live.slug}`} className="font-semibold underline decoration-2 underline-offset-8 hover:text-[#b4552d]">
                Enter the store →
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <Link href={`/shop/${live.slug}`} className="group block overflow-hidden rounded-[20px]">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/shopverse/images/aurelle/lookbook-1.jpg"
                    alt="AURELLE lookbook — satin slip dress"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-6 pt-20 text-white">
                    <p className="font-display text-3xl font-bold">The Autumn Edit</p>
                    <p className="mt-1 text-white/85">Wool coats, satin dresses, leather goods — 8 pieces, endless outfits.</p>
                  </div>
                </div>
              </Link>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-2">
              <div className="flex h-full flex-col justify-between gap-6 rounded-[20px] border border-[#e6ddd3] bg-white p-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b4552d]">{live.tagline}</p>
                  <p className="mt-3 text-lg leading-relaxed">{live.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {live.vibe.map((v) => (
                      <span key={v} className="rounded-full bg-[#f3e4da] px-3 py-1 text-xs font-semibold text-[#7c3f21]">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-[#faf6f1] py-3">
                    <p className="font-display text-2xl font-bold">8</p>
                    <p className="text-[11px] uppercase tracking-wider text-[#6f625a]">Products</p>
                  </div>
                  <div className="rounded-xl bg-[#faf6f1] py-3">
                    <p className="font-display text-2xl font-bold">4.8★</p>
                    <p className="text-[11px] uppercase tracking-wider text-[#6f625a]">Rating</p>
                  </div>
                  <div className="rounded-xl bg-[#faf6f1] py-3">
                    <p className="font-display text-2xl font-bold">60d</p>
                    <p className="text-[11px] uppercase tracking-wider text-[#6f625a]">Returns</p>
                  </div>
                </div>
                <Link
                  href={`/shop/${live.slug}/products`}
                  className="btn-shine rounded-full bg-[#221a15] py-3 text-center font-semibold text-white transition hover:opacity-90"
                >
                  Shop all products
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* All stores */}
      <section id="stores" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b4552d]">The mall directory</p>
          <h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Eleven stores. Eleven worlds.</h2>
          <p className="mt-3 max-w-2xl text-lg text-[#6f625a]">
            One store is open today. The rest are being dressed and lit — each with its own theme, products and
            personality. New stores open one by one.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STORES.map((store, i) => {
            const isLive = store.status === 'live';
            const cover = isLive ? '/shopverse/images/aurelle/hero-editorial.jpg' : null;
            const card = (
              <>
                <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${store.gradient}`}>
                  {cover ? (
                    <Image src={cover} alt={`${store.name} storefront`} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center font-display text-7xl font-bold text-white/25">
                      {store.name.charAt(0)}
                    </span>
                  )}
                  <span
                    className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      isLive ? 'bg-white text-[#221a15]' : 'bg-black/35 text-white backdrop-blur'
                    }`}
                  >
                    {isLive ? '● Open now' : 'Opening soon'}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-2xl font-bold">{store.name}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6f625a]">{store.tagline}</span>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-[#6f625a]">{store.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {store.vibe.map((v) => (
                      <span key={v} className="rounded-full bg-[#f1e9e1] px-2.5 py-1 text-[11px] font-medium">
                        {v}
                      </span>
                    ))}
                  </div>
                  <span className={`mt-4 text-sm font-semibold ${isLive ? 'text-[#b4552d]' : 'text-[#9a8d84]'}`}>
                    {isLive ? 'Enter the store →' : 'Notify me when it opens →'}
                  </span>
                </div>
              </>
            );
            return (
              <Reveal key={store.slug} delay={(i % 3) * 0.08} className="h-full">
                {isLive ? (
                  <Link
                    href={`/shop/${store.slug}`}
                    className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[#e6ddd3] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-20px_rgba(34,26,21,0.4)]"
                  >
                    {card}
                  </Link>
                ) : (
                  <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[#e6ddd3] bg-white opacity-95">
                    {card}
                  </article>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Why */}
      <section id="why" className="border-t border-[#e6ddd3] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="font-display text-4xl font-bold sm:text-5xl">Why shop the mall?</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: 'One cart per store', d: 'Each shop keeps its own cart, wishlist and checkout — no cross-store confusion, ever.' },
              { t: 'Designed, not templated', d: 'Every store gets its own colors, typography and mood. No two shops look alike.' },
              { t: 'Real shopping flows', d: 'Filters, search, sizes, reviews, promos, free-shipping progress — the full journey.' },
              { t: 'New openings, often', d: 'Stores open one by one. Follow the mall and be first through each new door.' },
            ].map((f, i) => (
              <Reveal key={f.t} delay={i * 0.08}>
                <div className="h-full rounded-[18px] border border-[#e6ddd3] bg-[#faf6f1] p-6 transition-transform duration-300 hover:-translate-y-1">
                  <p className="font-display text-xl font-bold">{f.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#6f625a]">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#221a15] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
          <p className="font-display text-2xl font-bold tracking-[0.22em]">
            SHOP<span className="text-[#e09a72]">VERSE</span>
          </p>
          <p className="max-w-md text-sm text-white/70">
            A demo mall of beautiful stores. Dummy data and AI-generated images — no real orders or payments.
          </p>
          <Link href="/shop/aurelle" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#221a15] transition hover:opacity-90">
            Visit AURELLE →
          </Link>
        </div>
      </footer>
    </div>
  );
}
