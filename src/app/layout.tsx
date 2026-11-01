import type { Metadata, Viewport } from 'next';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShopVerse — A Mall of Beautiful Stores',
  description:
    'ShopVerse is a collection of beautifully designed online stores — fashion, gadgets, food and more — each with its own style, all in one place.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
