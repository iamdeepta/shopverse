# ShopVerse

A mall of many ecommerce stores in one Next.js project. Each store has its
own design, colors and theme; the landing page showcases every store, and
clicking one enters that store.

## Status

- **Live:** AURELLE (fashion & lifestyle) — full store: home, product list
  with filters/search/sort, product pages, cart + drawer, checkout,
  wishlist, about, contact.
- **Coming soon:** VoltEdge, Saffron Table, Little Sprout, VitaPure,
  FreshBasket, PixelForge, Chapter One, PixelCraft Studio, Apex Athletics,
  Torque & Co.

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
