import type { CSSProperties, ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getStore } from '@/data/stores';
import { CartDrawer } from '@/components/CartDrawer';
import { StoreFooter, StoreHeader } from '@/components/StoreChrome';
import { ComingSoon } from '@/components/ComingSoon';

export function generateStaticParams() {
  return [{ slug: 'aurelle' }];
}

export default function ShopLayout({ children, params }: { children: ReactNode; params: { slug: string } }) {
  const store = getStore(params.slug);
  if (!store) notFound();

  if (store.status !== 'live') {
    return <ComingSoon store={store} />;
  }

  const t = store.theme;
  const vars = {
    '--brand': t.brand,
    '--brand-soft': t.brandSoft,
    '--brand-ink': t.brandInk,
    '--surface': t.surface,
    '--surface-2': t.surface2,
    '--ink': t.ink,
    '--ink-soft': t.inkSoft,
    '--line': t.line,
    '--radius': t.radius,
  } as CSSProperties;

  return (
    <div style={vars} className="min-h-screen bg-[var(--surface)] font-body text-[var(--ink)]">
      <StoreHeader store={store} />
      <main>{children}</main>
      <StoreFooter store={store} />
      <CartDrawer storeSlug={store.slug} storeName={store.name} />
    </div>
  );
}
