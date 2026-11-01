import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, getProduct } from '@/data/aurelle';
import { ProductDetail } from '@/components/ProductDetail';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const product = getProduct(params.id);
  return { title: product ? `${product.name} · AURELLE · ShopVerse` : 'Product · AURELLE' };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  if (!getProduct(params.id)) notFound();
  return <ProductDetail productId={params.id} />;
}
