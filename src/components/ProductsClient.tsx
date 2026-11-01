'use client';

import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/anim';
import { CATEGORIES, PRODUCTS, formatPrice } from '@/data/aurelle';

const SLUG = 'aurelle';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

const PRICE_BANDS = [
  { id: 'all', label: 'All prices', test: (_p: number) => true },
  { id: 'under100', label: 'Under $100', test: (p: number) => p < 100 },
  { id: '100-200', label: '$100 – $200', test: (p: number) => p >= 100 && p <= 200 },
  { id: 'over200', label: 'Over $200', test: (p: number) => p > 200 },
];

export function ProductsClient({ initialCategory, initialSort }: { initialCategory: string; initialSort: string }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [priceBand, setPriceBand] = useState('all');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>(
    initialSort === 'rating' ? 'rating' : initialSort === 'newest' ? 'newest' : 'featured',
  );

  const allSizes = useMemo(() => Array.from(new Set(PRODUCTS.flatMap((p) => p.sizes))), []);
  const allColors = useMemo(() => Array.from(new Set(PRODUCTS.flatMap((p) => p.colors))), []);

  const filtered = useMemo(() => {
    const band = PRICE_BANDS.find((b) => b.id === priceBand) ?? PRICE_BANDS[0];
    const q = query.trim().toLowerCase();
    const list = PRODUCTS.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (!band.test(p.price)) return false;
      if (sizes.length > 0 && !p.sizes.some((s) => sizes.includes(s))) return false;
      if (colors.length > 0 && !p.colors.some((c) => colors.includes(c))) return false;
      if (q && !`${p.name} ${p.category} ${p.short}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    if (sort === 'newest') sorted.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false));
    return sorted;
  }, [query, category, priceBand, sizes, colors, sort]);

  const toggle = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const clearAll = () => {
    setQuery('');
    setCategory('All');
    setPriceBand('all');
    setSizes([]);
    setColors([]);
    setSort('featured');
  };

  const activeFilters = (category !== 'All' ? 1 : 0) + (priceBand !== 'all' ? 1 : 0) + sizes.length + colors.length + (query ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Reveal>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Shop all</h1>
        <p className="mt-2 text-[var(--ink-soft)]">
          {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
          {activeFilters > 0 && ` · ${activeFilters} filter${activeFilters === 1 ? '' : 's'} applied`}
        </p>
      </Reveal>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search coats, dresses, leather…"
          aria-label="Search products"
          className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-white px-5 py-3 outline-none focus:border-[var(--brand)]"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort products"
          className="rounded-full border border-[var(--line)] bg-white px-5 py-3 outline-none focus:border-[var(--brand)]"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            {activeFilters > 0 && (
              <button type="button" onClick={clearAll} className="text-sm font-semibold text-[var(--brand)] underline underline-offset-4">
                Clear all
              </button>
            )}
          </div>

          <fieldset className="mt-5">
            <legend className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">Category</legend>
            <div className="mt-2 flex flex-col gap-1">
              {['All', ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    category === c ? 'bg-[var(--brand-soft)] font-semibold text-[var(--brand)]' : 'hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">Price</legend>
            <div className="mt-2 flex flex-col gap-1">
              {PRICE_BANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setPriceBand(b.id)}
                  aria-pressed={priceBand === b.id}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    priceBand === b.id ? 'bg-[var(--brand-soft)] font-semibold text-[var(--brand)]' : 'hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">Size</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {allSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(sizes, s, setSizes)}
                  aria-pressed={sizes.includes(s)}
                  className={`min-w-11 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    sizes.includes(s)
                      ? 'border-[var(--brand)] bg-[var(--brand)] font-semibold text-[var(--brand-ink)]'
                      : 'border-[var(--line)] bg-white hover:border-[var(--brand)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">Color</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {allColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle(colors, c, setColors)}
                  aria-pressed={colors.includes(c)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    colors.includes(c)
                      ? 'border-[var(--brand)] bg-[var(--brand)] font-semibold text-[var(--brand-ink)]'
                      : 'border-[var(--line)] bg-white hover:border-[var(--brand)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </fieldset>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="rounded-[var(--radius)] border border-dashed border-[var(--line)] px-6 py-16 text-center">
              <p className="font-display text-3xl font-bold">Nothing matches — yet.</p>
              <p className="mx-auto mt-2 max-w-sm text-[var(--ink-soft)]">
                Try a different search or clear the filters to see the full collection.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-6 rounded-full bg-[var(--brand)] px-7 py-3 font-semibold text-[var(--brand-ink)]"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} storeSlug={SLUG} />
              ))}
            </div>
          )}
          <p className="mt-6 text-center text-xs text-[var(--ink-soft)]">
            Prices in USD · {formatPrice(150)}+ ships free · Demo catalog with {PRODUCTS.length} products.
          </p>
        </div>
      </div>
    </div>
  );
}
