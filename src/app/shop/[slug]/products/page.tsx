import type { Metadata } from 'next';
import { ProductsClient } from '@/components/ProductsClient';

export const metadata: Metadata = { title: 'Shop all · AURELLE · ShopVerse' };

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string; sort?: string };
}) {
  return (
    <ProductsClient
      initialCategory={searchParams?.category ?? 'All'}
      initialSort={searchParams?.sort ?? 'featured'}
    />
  );
}
