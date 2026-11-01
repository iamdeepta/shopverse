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

export const AURELLE_SLUG = 'aurelle';

export const CATEGORIES = ['Women', 'Men', 'Accessories'] as const;

export const PRODUCTS: Product[] = [
  {
    id: 'meridian-wool-coat',
    name: 'Meridian Oversized Wool Coat',
    slug: 'meridian-wool-coat',
    price: 289,
    compareAt: 360,
    rating: 4.9,
    reviews: 214,
    category: 'Women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Camel', 'Charcoal', 'Ivory'],
    badge: 'Bestseller',
    isBestseller: true,
    image: '/images/aurelle/product-coat.jpg',
    short: 'A sculpted oversized coat in double-faced Italian wool. The one you will reach for every cold morning.',
    description:
      'Cut with a dropped shoulder and a clean, collarless neckline, the Meridian coat is tailored to feel effortless. Double-faced Italian wool keeps it warm without weight, and the hidden closure keeps the silhouette uninterrupted from every angle.',
    details: [
      '100% double-faced Italian wool',
      'Dropped shoulder, oversized fit — take your usual size',
      'Hidden button closure, two deep side pockets',
      'Dry clean only',
    ],
  },
  {
    id: 'celine-satin-dress',
    name: 'Céline Satin Slip Dress',
    slug: 'celine-satin-dress',
    price: 148,
    compareAt: 189,
    rating: 4.8,
    reviews: 167,
    category: 'Women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Champagne', 'Noir', 'Sage'],
    badge: 'New',
    isNew: true,
    image: '/images/aurelle/product-dress.jpg',
    short: 'Bias-cut satin that moves like water. Dress it up, layer it down — it earns its place in every wardrobe.',
    description:
      'The Céline is cut on the bias so the satin skims instead of clinging. Adjustable straps, a midi length that works with trainers and heels alike, and a weight that feels substantial, never flimsy.',
    details: [
      'Bias-cut sandwashed satin, 100% viscose',
      'Adjustable spaghetti straps',
      'Midi length, true to size',
      'Hand wash cold, hang dry',
    ],
  },
  {
    id: 'voyager-leather-tote',
    name: 'Voyager Structured Leather Tote',
    slug: 'voyager-leather-tote',
    price: 215,
    compareAt: 260,
    rating: 4.9,
    reviews: 301,
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Tan', 'Black', 'Oxblood'],
    badge: 'Bestseller',
    isBestseller: true,
    image: '/images/aurelle/product-tote.jpg',
    short: 'Vegetable-tanned leather, a structured base and room for a 13" laptop. Carries the day, beautifully.',
    description:
      'The Voyager holds its shape empty or full. Full-grain, vegetable-tanned leather that deepens in color with wear, solid brass hardware, a suede-lined interior pocket for the things you reach for most, and a magnetic top closure.',
    details: [
      'Full-grain vegetable-tanned leather',
      'Fits a 13" laptop, interior zip pocket',
      'Solid brass hardware, magnetic closure',
      'Leather ages beautifully — condition twice a year',
    ],
  },
  {
    id: 'court-white-sneakers',
    name: 'Court Minimalist White Sneakers',
    slug: 'court-white-sneakers',
    price: 118,
    compareAt: 145,
    rating: 4.7,
    reviews: 189,
    category: 'Men',
    sizes: ['40', '41', '42', '43', '44', '45'],
    colors: ['White', 'White / Gum'],
    image: '/images/aurelle/product-sneakers.jpg',
    short: 'Clean lines, full-grain leather, a gum sole. The quiet sneaker that goes with everything you own.',
    description:
      'No logos, no noise. The Court is built from full-grain Italian leather on a cushioned gum cupsole, with a padded collar and a last shaped for all-day comfort. Designed to be the pair you stop thinking about.',
    details: [
      'Full-grain Italian leather upper',
      'Natural gum rubber cupsole',
      'Padded collar, removable insole',
      'Wipe clean with a damp cloth',
    ],
  },
  {
    id: 'nordic-chunky-sweater',
    name: 'Nordic Chunky Knit Sweater',
    slug: 'nordic-chunky-sweater',
    price: 128,
    compareAt: 165,
    rating: 4.8,
    reviews: 142,
    category: 'Women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Oat', 'Slate'],
    badge: 'Low stock',
    image: '/images/aurelle/product-sweater.jpg',
    short: 'A cloud of a sweater — chunky cable knit in brushed merino, with a relaxed fit made for slow mornings.',
    description:
      'Knitted in a soft brushed merino blend with a classic cable pattern, the Nordic sweater is warmth you can live in. Relaxed through the body, ribbed at the hem and cuffs, and pill-resistant through seasons of wear.',
    details: [
      'Brushed merino-blend cable knit',
      'Relaxed fit, ribbed hem and cuffs',
      'Pill-resistant yarn',
      'Hand wash cold, dry flat',
    ],
  },
  {
    id: 'aegean-linen-shirt',
    name: 'Aegean Linen Shirt',
    slug: 'aegean-linen-shirt',
    price: 88,
    compareAt: 110,
    rating: 4.6,
    reviews: 98,
    category: 'Men',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Ivory', 'Sky', 'Sand'],
    badge: 'New',
    isNew: true,
    image: '/images/aurelle/product-shirt.jpg',
    short: 'Garment-washed European linen that breathes. The shirt that makes warm days feel considered.',
    description:
      'Woven from European flax and garment-washed for softness from day one, the Aegean shirt is cut relaxed with a camp collar and a single chest pocket. It wrinkles the way good linen should — gracefully.',
    details: [
      '100% European flax linen, garment-washed',
      'Relaxed fit, camp collar',
      'Single chest pocket, corozo buttons',
      'Machine wash cold, line dry',
    ],
  },
  {
    id: 'tailored-pleated-trousers',
    name: 'Tailored Pleated Trousers',
    slug: 'tailored-pleated-trousers',
    price: 118,
    compareAt: 145,
    rating: 4.7,
    reviews: 121,
    category: 'Men',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Beige', 'Charcoal', 'Navy'],
    image: '/images/aurelle/product-trousers.jpg',
    short: 'High-rise, single pleat, tapered leg. Tailoring that feels as easy as sweatpants.',
    description:
      'A high-rise waist and single pleat give the trousers their drape; a tapered leg keeps them modern. Cut in a breathable wool-blend twill with an elasticated back waist for comfort that never shows.',
    details: [
      'Wool-blend twill, high-rise single pleat',
      'Tapered leg, elasticated back waist',
      'Side pockets, back welt pocket',
      'Dry clean or gentle machine wash',
    ],
  },
  {
    id: 'riviera-acetate-sunglasses',
    name: 'Riviera Acetate Sunglasses',
    slug: 'riviera-acetate-sunglasses',
    price: 95,
    compareAt: 130,
    rating: 4.8,
    reviews: 176,
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Tortoise', 'Black', 'Amber'],
    badge: 'Bestseller',
    isBestseller: true,
    image: '/images/aurelle/product-sunglasses.jpg',
    short: 'Hand-finished Italian acetate, green gradient lenses, gold-core temples. Sunlight, handled.',
    description:
      'The Riviera is cut from Italian Mazzucchelli acetate and polished by hand. Green gradient CR-39 lenses with full UV protection, gold-core temples, and a fit that suits most face shapes. Includes a leather case and cloth.',
    details: [
      'Italian Mazzucchelli acetate, hand-polished',
      'CR-39 green gradient lenses, 100% UV protection',
      'Gold-core temples, 5-barrel hinges',
      'Includes leather case and microfiber cloth',
    ],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id || p.slug === id);
}

export function relatedProducts(id: string, count = 4): Product[] {
  const current = getProduct(id);
  const sameCategory = PRODUCTS.filter((p) => p.id !== id && p.category === current?.category);
  const rest = PRODUCTS.filter((p) => p.id !== id && p.category !== current?.category);
  return [...sameCategory, ...rest].slice(0, count);
}

export const TESTIMONIALS = [
  {
    quote:
      'The Meridian coat is the best thing I have bought in years. The wool is substantial, the cut is perfect, and I get asked about it every single week.',
    name: 'Elena Marsh',
    role: 'Verified buyer · Coat',
    rating: 5,
  },
  {
    quote:
      'I ordered on Monday and wore the Céline dress to dinner on Friday. The packaging alone felt like a gift — the dress itself is even better.',
    name: 'Priya Raman',
    role: 'Verified buyer · Dress',
    rating: 5,
  },
  {
    quote:
      'Finally, a tote that holds my laptop, survives the commute and still looks elegant at dinner. The leather just keeps getting better.',
    name: 'Daniel Okafor',
    role: 'Verified buyer · Tote',
    rating: 5,
  },
];

export const PERKS = [
  {
    title: 'Free shipping over $150',
    text: 'Fast, tracked delivery on every order over $150 — worldwide.',
  },
  {
    title: '60-day returns',
    text: 'Wear it, live in it. If it is not right, send it back free.',
  },
  {
    title: '2-year craftsmanship warranty',
    text: 'Stitching, hardware and leather — covered, no fine print.',
  },
  {
    title: 'Carbon-neutral delivery',
    text: 'Every parcel offset. Better for you, lighter on the planet.',
  },
];

export const HERO_COPY = {
  eyebrow: 'Autumn / Winter 2026',
  title: 'Dress like the light is yours.',
  subtitle:
    'Considered clothing in wool, linen and leather — designed slowly in our atelier, made to be worn every day.',
  ctaPrimary: 'Shop new arrivals',
  ctaSecondary: 'Our story',
};

export const LOOKBOOK_COPY = {
  eyebrow: 'The Lookbook',
  title: 'Worn in, not worn out.',
  text: 'Every Aurelle piece is designed to soften, deepen and settle into your life. Wool that holds its shape. Leather that learns your hand. Linen that breathes with you — season after season.',
};

export const COLLECTION_COPY = {
  eyebrow: 'The Voyager Collection',
  title: 'Carry the day, beautifully.',
  text: 'Full-grain leather goods, hand-finished and built to age with you. This season: the Voyager tote in three new colors.',
};

export const FREE_SHIPPING_THRESHOLD = 150;
export const FLAT_SHIPPING = 8;
export const PROMO_CODE = 'WELCOME10';
export const PROMO_PERCENT = 10;

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
