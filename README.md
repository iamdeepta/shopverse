# ShopVerse

A mall of many ecommerce stores in one Next.js project. Each store has its
own design, colors and theme; the landing page showcases every store, and
clicking one enters that store.

## Status

- **Live:** all 11 stores — AURELLE (fashion & lifestyle), VoltEdge
  (gadgets), Saffron Table (restaurant), Little Sprout (mom & children),
  VitaPure (healthcare), FreshBasket (groceries), PixelForge (games),
  Chapter One (e-books), PixelCraft Studio (digital services), Apex
  Athletics (gym & sports), Torque & Co. (car & bike). Every store has the
  full flow: home, product list with filters/search/sort, product pages,
  cart + drawer, checkout, wishlist, about, contact.
- Store pages/components are slug-driven: each store's data lives in
  `src/data/<slug>.ts` (`DATA: StoreData`, registered in
  `src/data/catalog.ts`), themed via CSS variables from
  `src/data/stores.ts`. Image paths in `src/` carry the `/shopverse`
  prefix (unoptimized `next/image` skips the `basePath` prefix) — keep
  new image paths prefixed the same way.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
```

## Add a store (store #2 and beyond)

1. Add an entry to `STORES` in `src/data/stores.ts` with `status: 'live'`,
   its theme tokens, categories and vibe words.
2. Add a data file `src/data/<slug>.ts` exporting `PRODUCTS`, `CATEGORIES`,
   testimonials/perks and a `getProduct` helper, mirroring
   `src/data/aurelle.ts`.
3. Generate images into `public/images/<slug>/` with the same filenames
   the data file references.
4. Generalize the shared pages/components to read the store's data by
   slug (today the store pages are written against the Aurelle dataset —
   the theme system via CSS variables is already slug-driven through the
   store layout). Add the slug to `generateStaticParams` in
   `src/app/shop/[slug]/layout.tsx` and the product `[id]` page.
5. Verify: `npm run build`, then check every route returns 200.

All data is dummy and all images are AI-generated. No backend, no real
payments. Promo code `WELCOME10` gives 10% off in the demo cart.
