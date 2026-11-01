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

## Command Center (master dashboard)

Route: **`/dashboard`** — one dashboard for all eleven stores (static, client-side, demo data only).

- **Single login.** Demo accounts (password for all three: `demo123`):
  - Super Admin — `amara@shopverse.demo` — every shop, every permission.
  - Store Manager — `rahim@shopverse.demo` — VoltEdge, Saffron Table, FreshBasket (plus a shipped `manage_team` grant).
  - Staff / Viewer — `sofia@shopverse.demo` — VoltEdge only, read-only (plus a shipped order-viewing grant).
  - Session persists in `localStorage` (`shopverse.dashboard.session`); logout returns to the login screen.
- **Shop switching + theming.** The sidebar and topbar list only the shops the signed-in user may open. Switching shops swaps the data and re-themes the whole dashboard from that shop's tokens in `src/data/stores.ts` (same CSS-variable mechanism as the store layout). The shell stays identical.
- **Roles are data, not code.** Default roles (Super Admin, Store Manager, Staff/Viewer) ship in `src/data/dashboard.ts` (`DEFAULT_ROLES`) and persist to `localStorage` (`shopverse.dashboard.roles`). The Super Admin can create custom roles (name, description, permission set, shop scope, read-only flag), edit roles, delete custom roles (built-ins cannot be deleted; the Super Admin role always keeps every permission and all shops), assign roles to users (`shopverse.dashboard.assignments`), and set per-user overrides (`shopverse.dashboard.overrides`): grant/revoke individual permissions on top of the role, plus a shop-access override that replaces the role's scope.
- **Effective access** = role permissions + grants − revokes; effective shops = per-user shop override ?? role scope. Nav sections the user lacks permission for are hidden; mutations (order status, price/stock edits, inventory adjusts, discount creation, role/team edits) require the matching permission and a non-read-only role. If an edit removes the current user's own section or shop, the UI falls back to the first allowed section/shop instead of a blank screen.
- **Permissions (9):** view_overview, view_analytics, manage_orders, manage_products, manage_inventory, manage_customers, manage_discounts, manage_team, manage_settings.
- **Sections:** Overview, Orders, Products, Customers, Inventory, Analytics (with working client-side CSV export), Discounts, Team & Roles, Settings. All data is deterministic per shop (seeded from the shop slug in `src/data/dashboard.ts`) and built from the shop's real catalog products/images.
- **Landing showcase.** The landing page has a dark "Command Center" section (`#dashboard`) with feature bullets, a CSS-only dashboard mock preview, and a CTA to `/dashboard`. The dashboard is not a 12th store — the 11-store registry/counters are untouched.
- **Other persisted demo state** (per shop, `localStorage`): stock/price edits, order statuses, created discounts, dashboard settings.
