import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreData, getStoreProduct } from '@/data/catalog';
import { STORES, getStore } from '@/data/stores';
import { ProductDetail } from '@/components/ProductDetail';

export function generateStaticParams() {
  // Every store slug × that store's product ids, so all nested routes
  // prerender for `output: 'export'` (soon stores render the ComingSoon layout).
  return STORES.flatMap((s) => {
    const data = getStoreData(s.slug);
    return (data?.products ?? []).map((p) => ({ slug: s.slug, id: p.id }));
  });
}

export function generateMetadata({ params }: { params: { slug: string; id: string } }): Metadata {
  const product = getStoreProduct(params.slug, params.id);
  const store = getStore(params.slug);
  return {
    title: product && store ? `${product.name} · ${store.name} · ShopVerse` : 'Product · ShopVerse',
  };
}

export default function ProductPage({ params }: { params: { slug: string; id: string } }) {
  if (!getStoreProduct(params.slug, params.id)) notFound();
  return <ProductDetail productId={params.id} storeSlug={params.slug} />;
}
