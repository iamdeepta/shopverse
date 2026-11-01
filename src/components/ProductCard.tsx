'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice, type Product } from '@/data/catalog';
import { Stars } from './Stars';

export function ProductCard({ product, storeSlug }: { product: Product; storeSlug: string }) {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const wished = wishlist.includes(product.id);
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(34,26,21,0.35)]">
      <div className="relative overflow-hidden bg-[var(--surface-2)]">
        <Link href={`/shop/${storeSlug}/product/${product.id}`} aria-label={product.name}>
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          </div>
        </Link>
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--ink)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--brand)] px-2.5 py-1 text-[11px] font-bold text-[var(--brand-ink)]">
            −{discount}%
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg shadow-md backdrop-blur transition-transform hover:scale-110 active:scale-95"
        >
          <span className={wished ? 'text-red-500' : 'text-[var(--ink)]'}>{wished ? '♥' : '♡'}</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">{product.category}</p>
        <Link href={`/shop/${storeSlug}/product/${product.id}`} className="font-display text-lg leading-snug transition-colors hover:text-[var(--brand)]">
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-xs text-[var(--ink-soft)]">
            {product.rating} ({product.reviews})
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            {product.compareAt && <span className="text-sm text-[var(--ink-soft)] line-through">{formatPrice(product.compareAt)}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={() => addToCart(storeSlug, { productId: product.id, size: product.sizes[0], color: product.colors[0], qty: 1 })}
          className="btn-shine mt-2 w-full rounded-full bg-[var(--brand)] py-2.5 text-sm font-semibold text-[var(--brand-ink)] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
