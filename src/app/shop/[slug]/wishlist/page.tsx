'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { findProduct, getStoreData } from '@/data/catalog';

export default function WishlistPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const data = getStoreData(slug);
  const PRODUCTS = data?.products ?? [];
  const { wishlist } = useCart();
  const saved = wishlist.map((id) => findProduct(id)).filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Your wishlist</h1>
      <p className="mt-2 text-[var(--ink-soft)]">
        {saved.length === 0 ? 'Nothing saved yet.' : `${saved.length} saved piece${saved.length === 1 ? '' : 's'} — tap the heart again to remove.`}
      </p>

      {saved.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius)] border border-dashed border-[var(--line)] px-6 py-16 text-center">
          <p className="text-5xl">♡</p>
          <p className="mt-3 font-display text-3xl font-bold">Save what you love.</p>
          <p className="mx-auto mt-2 max-w-sm text-[var(--ink-soft)]">
            Tap the heart on any product to keep it here for later.
          </p>
          <Link href={`/shop/${slug}/products`} className="mt-6 inline-block rounded-full bg-[var(--brand)] px-7 py-3 font-semibold text-[var(--brand-ink)]">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {saved.map(({ product: p, slug: pSlug }) => (
            <ProductCard key={`${pSlug}-${p.id}`} product={p} storeSlug={pSlug} />
          ))}
        </div>
      )}

      <section className="mt-16">
        <h2 className="font-display text-3xl font-bold">More to love</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {PRODUCTS.filter((p) => !wishlist.includes(p.id))
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} storeSlug={slug} />
            ))}
        </div>
      </section>
    </div>
  );
}
