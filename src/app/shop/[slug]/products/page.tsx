import type { Metadata } from 'next';
import { ProductsClient } from '@/components/ProductsClient';

export const metadata: Metadata = { title: 'Shop all · AURELLE · ShopVerse' };

export default function ProductsPage() {
  // Query params (?category= / ?sort=) are read client-side inside
  // ProductsClient via useSearchParams, so this page stays statically
  // prerenderable for `output: 'export'`.
  return <ProductsClient />;
}
