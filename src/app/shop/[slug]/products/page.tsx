import type { Metadata } from 'next';
import { ProductsClient } from '@/components/ProductsClient';
import { getStore } from '@/data/stores';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const store = getStore(params.slug);
  return { title: store ? `Shop all · ${store.name} · ShopVerse` : 'Shop all · ShopVerse' };
}

export default function ProductsPage({ params }: { params: { slug: string } }) {
  // Query params (?category= / ?sort=) are read client-side inside
  // ProductsClient via useSearchParams, so this page stays statically
  // prerenderable for `output: 'export'`.
  return <ProductsClient storeSlug={params.slug} />;
}
