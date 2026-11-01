'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Reveal, prefersReducedMotion, useGsapRegistered } from '@/components/anim';
import { ProductCard } from '@/components/ProductCard';
import { Stars } from '@/components/Stars';
import {
  CATEGORIES,
  COLLECTION_COPY,
  HERO_COPY,
  LOOKBOOK_COPY,
  PERKS,
  PRODUCTS,
  TESTIMONIALS,
} from '@/data/aurelle';

const SLUG = 'aurelle';

const CATEGORY_IMAGES: Record<string, string> = {
  Women: '/shopverse/images/aurelle/category-women.jpg',
  Men: '/shopverse/images/aurelle/category-men.jpg',
  Accessories: '/shopverse/images/aurelle/category-accessories.jpg',
};

const MARQUEE_ITEMS = ['Free shipping over $150', '60-day returns', 'New: The Autumn Edit', '2-year warranty', 'Carbon-neutral delivery'];

export default function AurelleHome() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  useGsapRegistered();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.au-hero-kicker', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
        .fromTo('.au-hero-title span', { opacity: 0, y: 42 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.11 }, 0.2)
        .fromTo('.au-hero-sub', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8 }, 0.5)
        .fromTo('.au-hero-cta', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.65)
        .fromTo('.au-hero-img', { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, 0.25);

      if (parallaxRef.current) {
        gsap.fromTo(
          '.au-parallax-img',
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: { trigger: parallaxRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      }
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const bestsellers = PRODUCTS.filter((p) => p.isBestseller);
  const newArrivals = PRODUCTS.filter((p) => p.isNew);

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
          <div>
            <p className="au-hero-kicker text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand)]">{HERO_COPY.eyebrow}</p>
            <h1 className="au-hero-title mt-4 font-display text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              <span className="block">Dress like</span>
              <span className="block">the light</span>
              <span className="block italic text-[var(--brand)]">is yours.</span>
            </h1>
            <p className="au-hero-sub mt-5 max-w-lg text-lg leading-relaxed text-[var(--ink-soft)]">{HERO_COPY.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/shop/${SLUG}/products`}
                className="au-hero-cta btn-shine rounded-full bg-[var(--brand)] px-7 py-3.5 font-semibold text-[var(--brand-ink)] transition hover:brightness-110"
              >
                {HERO_COPY.ctaPrimary}
              </Link>
              <Link
                href={`/shop/${SLUG}/about`}
                className="au-hero-cta rounded-full border-2 border-[var(--ink)] px-7 py-3.5 font-semibold transition-colors hover:bg-[var(--ink)] hover:text-white"
              >
                {HERO_COPY.ctaSecondary}
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm">
              <Stars rating={4.8} />
              <span className="text-[var(--ink-soft)]">4.8 · 1,300+ verified reviews</span>
            </div>
          </div>
          <div className="au-hero-img relative">
            <div className="relative overflow-hidden rounded-[var(--radius)] shadow-[0_30px_60px_-25px_rgba(34,26,21,0.45)]">
              <div className="relative aspect-[4/5] w-full sm:aspect-[5/5.4]">
                <Image
                  src="/shopverse/images/aurelle/hero-editorial.jpg"
                  alt="AURELLE editorial — model in a camel wool coat"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-4 left-4 rotate-[-2deg] rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-lg sm:left-6">
              Meridian Wool Coat · $289
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-paused overflow-hidden border-y border-[var(--line)] bg-[var(--surface-2)] py-3" aria-hidden>
        <div className="animate-marquee-slow flex w-max items-center gap-10 whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              {item} <span className="text-[var(--brand)]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-4xl font-bold sm:text-5xl">Shop by category</h2>
            <Link href={`/shop/${SLUG}/products`} className="font-semibold underline decoration-2 underline-offset-8 hover:text-[var(--brand)]">
              View everything →
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {CATEGORIES.map((cat, i) => {
            const count = PRODUCTS.filter((p) => p.category === cat).length;
            return (
              <Reveal key={cat} delay={i * 0.08}>
                <Link href={`/shop/${SLUG}/products?category=${encodeURIComponent(cat)}`} className="group block overflow-hidden rounded-[var(--radius)]">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--surface-2)]">
                    <Image
                      src={CATEGORY_IMAGES[cat]}
                      alt={`${cat} collection`}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-16 text-white">
                      <p className="font-display text-3xl font-bold">{cat}</p>
                      <p className="text-sm text-white/85">
                        {count} pieces · Shop now →
                      </p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="border-y border-[var(--line)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-4xl font-bold sm:text-5xl">Bestsellers</h2>
              <Link href={`/shop/${SLUG}/products?sort=rating`} className="font-semibold underline decoration-2 underline-offset-8 hover:text-[var(--brand)]">
                Shop bestsellers →
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} storeSlug={SLUG} />
            ))}
          </div>
        </div>
      </section>

      {/* Lookbook / editorial parallax */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div ref={parallaxRef} className="relative overflow-hidden rounded-[var(--radius)]">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/shopverse/images/aurelle/lookbook-1.jpg"
                alt="Lookbook — satin slip dress in soft light"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="au-parallax-img scale-[1.18] object-cover"
              />
            </div>
          </div>
          <Reveal>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand)]">{LOOKBOOK_COPY.eyebrow}</p>
              <h2 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">{LOOKBOOK_COPY.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-[var(--ink-soft)]">{LOOKBOOK_COPY.text}</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-4">
                  <p className="font-display text-3xl font-bold">100%</p>
                  <p className="text-sm text-[var(--ink-soft)]">natural fibers in the core line</p>
                </div>
                <div className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-4">
                  <p className="font-display text-3xl font-bold">2 yrs</p>
                  <p className="text-sm text-[var(--ink-soft)]">craftsmanship warranty, standard</p>
                </div>
              </div>
              <Link
                href={`/shop/${SLUG}/products?sort=newest`}
                className="mt-7 inline-block rounded-full bg-[var(--ink)] px-7 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Explore new arrivals
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden rounded-[var(--radius)]">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/shopverse/images/aurelle/lookbook-2.jpg"
                  alt="Lookbook — knit sweater and pleated trousers"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-[1.04]"
                />
              </div>
              <p className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                Knit & Tailoring
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col justify-center rounded-[var(--radius)] bg-[var(--ink)] p-8 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">{COLLECTION_COPY.eyebrow}</p>
              <h3 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{COLLECTION_COPY.title}</h3>
              <p className="mt-3 leading-relaxed text-white/80">{COLLECTION_COPY.text}</p>
              <Link
                href={`/shop/${SLUG}/products?category=${encodeURIComponent('Accessories')}`}
                className="btn-shine mt-6 inline-block w-fit rounded-full bg-[var(--brand)] px-6 py-3 font-semibold text-[var(--brand-ink)]"
              >
                Shop leather goods
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <Reveal>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">New arrivals</h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {PRODUCTS.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} storeSlug={SLUG} />
          ))}
        </div>
        <Reveal className="mt-8 text-center">
          <Link
            href={`/shop/${SLUG}/products`}
            className="inline-block rounded-full border-2 border-[var(--ink)] px-8 py-3 font-semibold transition-colors hover:bg-[var(--ink)] hover:text-white"
          >
            View all {PRODUCTS.length} products
          </Link>
        </Reveal>
      </section>

      {/* Testimonials */}
      <section className="border-y border-[var(--line)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="text-center font-display text-4xl font-bold sm:text-5xl">Worn and loved</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <figure className="flex h-full flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-white p-6 transition-transform duration-300 hover:-translate-y-1">
                  <Stars rating={t.rating} />
                  <blockquote className="flex-1 leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-[var(--ink-soft)]">{t.role}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk, i) => (
            <Reveal key={perk.title} delay={i * 0.06}>
              <div className="h-full rounded-[var(--radius)] border border-[var(--line)] p-6 transition-colors hover:border-[var(--brand)]">
                <p className="font-display text-xl font-bold">{perk.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{perk.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="rounded-[var(--radius)] bg-[var(--ink)] px-6 py-12 text-center text-white sm:px-12">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">First looks, private sales, no noise.</h2>
            <p className="mx-auto mt-3 max-w-md text-white/75">
              One beautiful email a week. Get 10% off your first order with code WELCOME10 when you join.
            </p>
            {subscribed ? (
              <p className="mx-auto mt-7 max-w-md rounded-full bg-white/10 px-6 py-3 font-medium">
                ✓ Welcome to Aurelle. Your code <strong>WELCOME10</strong> is waiting at checkout.
              </p>
            ) : (
              <form
                className="mx-auto mt-7 flex max-w-md flex-col gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.includes('@')) setSubscribed(true);
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="min-w-0 flex-1 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-white placeholder:text-white/60 outline-none focus:border-white"
                />
                <button type="submit" className="btn-shine shrink-0 rounded-full bg-[var(--brand)] px-6 py-3 font-semibold text-[var(--brand-ink)]">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
