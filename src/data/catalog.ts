import { AURELLE_DATA } from './aurelle';
import { DATA as GADGET_DATA } from './gadget';
import { DATA as RESTAURANT_DATA } from './restaurant';
import { DATA as MOM_CHILDREN_DATA } from './mom-children';
import { DATA as HEALTHCARE_DATA } from './healthcare';
import { DATA as GROCERIES_DATA } from './groceries';
import { DATA as GAMES_DATA } from './games';
import { DATA as EBOOK_DATA } from './ebook';
import { DATA as DIGITAL_SERVICE_DATA } from './digital-service';
import { DATA as GYM_SPORTS_DATA } from './gym-sports';
import { DATA as CAR_BIKE_DATA } from './car-bike';

/**
 * Shared data model for every ShopVerse store.
 *
 * Each store module (src/data/<slug>.ts) exports a single `DATA: StoreData`
 * object. This catalog maps slugs to those objects so every page/component
 * can render any store by slug. The promo code is shared across all stores;
 * free-shipping thresholds and flat rates are per store.
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  category: string;
  sizes: string[];
  colors: string[];
  badge?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  image: string;
  short: string;
  description: string;
  details: string[];
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

export interface Perk {
  title: string;
  text: string;
}

export interface StoreData {
  slug: string;
  products: Product[];
  categories: string[];
  testimonials: Testimonial[];
  perks: Perk[];
  hero: {
    eyebrow: string;
    /** Rendered as stacked lines; the last line gets the italic brand style. */
    titleLines: string[];
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    image: string;
    imageAlt: string;
    rating: number;
    ratingLine: string;
  };
  /** Small floating chip over the hero image, e.g. "Meridian Wool Coat · $289". */
  heroBadge: string;
  marqueeItems: string[];
  /** One image per category, keyed by exact category name. */
  categoryImages: Record<string, string>;
  lookbook: {
    eyebrow: string;
    title: string;
    text: string;
    image: string;
    imageAlt: string;
    stats: { value: string; label: string }[];
    secondImage: string;
    secondImageAlt: string;
    secondImageCaption: string;
  };
  collection: {
    eyebrow: string;
    title: string;
    text: string;
    ctaLabel: string;
    /** Category the collection CTA links to. */
    ctaCategory: string;
  };
  newsletter: {
    title: string;
    text: string;
    /** Full success line shown after subscribing (without the leading ✓). */
    success: string;
  };
  /** Feature block for the landing page's "now open" section. */
  spotlight: {
    title: string;
    text: string;
    statValue: string;
    statLabel: string;
  };
  about: {
    headline: string;
    intro: string;
    image: string;
    imageAlt: string;
    milestones: { value: string; label: string }[];
    values: { title: string; text: string }[];
  };
  contact: {
    email: string;
    emailNote: string;
    address: string;
    addressHours: string;
    phone: string;
    phoneHours: string;
    helpTitle: string;
    helpText: string;
    /** First topic is the form's default selection. */
    topics: string[];
  };
  /** Labels for the 3 PDP gallery crop views, e.g. ["Full view", "Detail", "Fabric"]. */
  galleryLabels: [string, string, string];
  shippingLines: string[];
  returnsLines: string[];
  /** One-line shipping/returns trust line on the PDP, e.g. "🚚 Free shipping over $150 · ↩ 60-day free returns · 🔒 Secure demo checkout — no real payment." */
  trustLine: string;
  searchPlaceholder: string;
  /** Labels for the two variant selectors on the PDP ("Color"/"Size" for fashion). */
  variantLabels: { colorLabel: string; sizeLabel: string };
  /** Order-number prefix on the checkout success screen, e.g. "AU". */
  orderPrefix: string;
  freeShippingThreshold: number;
  flatShipping: number;
}

export const PROMO_CODE = 'WELCOME10';
export const PROMO_PERCENT = 10;

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/**
 * Slug → store data. New store modules are registered here (one import +
 * one entry each) once their src/data/<slug>.ts exists.
 */
export const STORE_DATA: Record<string, StoreData> = {
  aurelle: AURELLE_DATA,
  gadget: GADGET_DATA,
  restaurant: RESTAURANT_DATA,
  'mom-children': MOM_CHILDREN_DATA,
  healthcare: HEALTHCARE_DATA,
  groceries: GROCERIES_DATA,
  games: GAMES_DATA,
  ebook: EBOOK_DATA,
  'digital-service': DIGITAL_SERVICE_DATA,
  'gym-sports': GYM_SPORTS_DATA,
  'car-bike': CAR_BIKE_DATA,
};

export function getStoreData(slug: string): StoreData | undefined {
  return STORE_DATA[slug];
}

export function getStoreProduct(slug: string, id: string): Product | undefined {
  const data = STORE_DATA[slug];
  return data?.products.find((p) => p.id === id || p.slug === id);
}

/** Find a product by id across every store (wishlist is store-agnostic). */
export function findProduct(id: string): { product: Product; slug: string } | undefined {
  for (const [slug, data] of Object.entries(STORE_DATA)) {
    const product = data.products.find((p) => p.id === id || p.slug === id);
    if (product) return { product, slug };
  }
  return undefined;
}

export function relatedStoreProducts(slug: string, id: string, count = 4): Product[] {
  const data = STORE_DATA[slug];
  if (!data) return [];
  const current = data.products.find((p) => p.id === id);
  const sameCategory = data.products.filter((p) => p.id !== id && p.category === current?.category);
  const rest = data.products.filter((p) => p.id !== id && p.category !== current?.category);
  return [...sameCategory, ...rest].slice(0, count);
}
