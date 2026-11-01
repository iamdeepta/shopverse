export type StoreStatus = 'live' | 'soon';

export interface StoreTheme {
  /** Primary brand color (buttons, links, accents). */
  brand: string;
  /** Soft tint of the brand color (chips, highlights). */
  brandSoft: string;
  /** Text color that sits on top of the brand color. */
  brandInk: string;
  /** Page background. */
  surface: string;
  /** Secondary surface (cards, alt sections). */
  surface2: string;
  /** Main text color. */
  ink: string;
  /** Muted text color. */
  inkSoft: string;
  /** Hairline / border color. */
  line: string;
  /** Corner radius used across the store. */
  radius: string;
}

export interface StoreEntry {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  /** Words that describe the store's vibe, shown on the landing card. */
  vibe: string[];
  /** Tailwind gradient classes for the "coming soon" landing card. */
  gradient: string;
  status: StoreStatus;
  theme: StoreTheme;
}

const ivoryTheme: StoreTheme = {
  brand: '#b4552d',
  brandSoft: '#f3e4da',
  brandInk: '#ffffff',
  surface: '#faf6f1',
  surface2: '#f1e9e1',
  ink: '#221a15',
  inkSoft: '#6f625a',
  line: '#e6ddd3',
  radius: '14px',
};

export const STORES: StoreEntry[] = [
  {
    slug: 'aurelle',
    name: 'AURELLE',
    tagline: 'Fashion & Lifestyle',
    description:
      'Considered clothing and objects for everyday rituals — tailored wool, washed linen, vegetable-tanned leather. Designed slowly, made to be worn daily.',
    categories: ['Women', 'Men', 'Accessories'],
    vibe: ['Editorial', 'Warm minimal', 'Premium'],
    gradient: 'from-[#b4552d] to-[#7c3f21]',
    status: 'live',
    theme: ivoryTheme,
  },
  {
    slug: 'gadget',
    name: 'VoltEdge',
    tagline: 'Gadgets & Tech',
    description: 'Next-generation gadgets, audio and smart-home gear — tested, compared and built to last.',
    categories: ['Audio', 'Wearables', 'Smart Home'],
    vibe: ['Electric', 'Sleek', 'Future-ready'],
    gradient: 'from-[#0ea5e9] to-[#1e3a8a]',
    status: 'live',
    theme: {
      brand: '#0284c7',
      brandSoft: '#e0f2fe',
      brandInk: '#ffffff',
      surface: '#f8fafc',
      surface2: '#eef2f7',
      ink: '#0f172a',
      inkSoft: '#64748b',
      line: '#e2e8f0',
      radius: '16px',
    },
  },
  {
    slug: 'restaurant',
    name: 'Saffron Table',
    tagline: 'Restaurant & Gourmet',
    description: 'Wood-fired dishes, seasonal menus and pantry staples from our kitchen to your table.',
    categories: ['Mains', 'Desserts', 'Pantry'],
    vibe: ['Warm', 'Artisanal', 'Appetizing'],
    gradient: 'from-[#dc2626] to-[#7c2d12]',
    status: 'live',
    theme: {
      brand: '#c2410c',
      brandSoft: '#ffedd5',
      brandInk: '#ffffff',
      surface: '#fffbf5',
      surface2: '#fef3e2',
      ink: '#292524',
      inkSoft: '#78716c',
      line: '#f5e6d3',
      radius: '18px',
    },
  },
  {
    slug: 'mom-children',
    name: 'Little Sprout',
    tagline: 'Mom & Children',
    description: 'Gentle essentials for mothers and little ones — soft, safe and thoughtfully made.',
    categories: ['Baby', 'Kids', 'Maternity'],
    vibe: ['Soft', 'Playful', 'Caring'],
    gradient: 'from-[#f472b6] to-[#a855f7]',
    status: 'live',
    theme: {
      brand: '#db2777',
      brandSoft: '#fce7f3',
      brandInk: '#ffffff',
      surface: '#fffafa',
      surface2: '#fdf2f8',
      ink: '#3b2a33',
      inkSoft: '#8a7a83',
      line: '#fbe4ee',
      radius: '22px',
    },
  },
  {
    slug: 'healthcare',
    name: 'VitaPure',
    tagline: 'Healthcare & Wellness',
    description: 'Clean supplements, skincare and everyday wellness — transparent ingredients, honest doses.',
    categories: ['Supplements', 'Skincare', 'Wellness'],
    vibe: ['Clean', 'Calm', 'Trusted'],
    gradient: 'from-[#10b981] to-[#0f766e]',
    status: 'live',
    theme: {
      brand: '#059669',
      brandSoft: '#d1fae5',
      brandInk: '#ffffff',
      surface: '#fbfefc',
      surface2: '#eefaf4',
      ink: '#12211b',
      inkSoft: '#5c7268',
      line: '#dcefe5',
      radius: '14px',
    },
  },
  {
    slug: 'groceries',
    name: 'FreshBasket',
    tagline: 'Groceries & Daily Needs',
    description: 'Farm-fresh produce, pantry staples and daily essentials, delivered the same day.',
    categories: ['Produce', 'Pantry', 'Household'],
    vibe: ['Fresh', 'Honest', 'Everyday'],
    gradient: 'from-[#65a30d] to-[#166534]',
    status: 'live',
    theme: {
      brand: '#4d7c0f',
      brandSoft: '#ecfccb',
      brandInk: '#ffffff',
      surface: '#fdfff8',
      surface2: '#f4f9e8',
      ink: '#1d2413',
      inkSoft: '#66755a',
      line: '#e4edd2',
      radius: '12px',
    },
  },
  {
    slug: 'games',
    name: 'PixelForge',
    tagline: 'Games & Play',
    description: 'Games, consoles and gear for every kind of player — from cozy indies to esports.',
    categories: ['Games', 'Consoles', 'Gear'],
    vibe: ['Bold', 'Neon', 'Playful'],
    gradient: 'from-[#7c3aed] to-[#312e81]',
    status: 'live',
    theme: {
      brand: '#7c3aed',
      brandSoft: '#ede9fe',
      brandInk: '#ffffff',
      surface: '#faf9ff',
      surface2: '#f1edfd',
      ink: '#1e1b2e',
      inkSoft: '#6b6785',
      line: '#e3ddf7',
      radius: '12px',
    },
  },
  {
    slug: 'ebook',
    name: 'Chapter One',
    tagline: 'E-books & Reading',
    description: 'E-books, audiobooks and reading lists — stories and ideas, instantly yours.',
    categories: ['Fiction', 'Non-fiction', 'Audiobooks'],
    vibe: ['Quiet', 'Curious', 'Literary'],
    gradient: 'from-[#92400e] to-[#451a03]',
    status: 'live',
    theme: {
      brand: '#92400e',
      brandSoft: '#fef3c7',
      brandInk: '#ffffff',
      surface: '#fffdf7',
      surface2: '#fbf3e3',
      ink: '#2b1d0f',
      inkSoft: '#7a6a58',
      line: '#efe2c9',
      radius: '10px',
    },
  },
  {
    slug: 'digital-service',
    name: 'PixelCraft Studio',
    tagline: 'Digital Services',
    description: 'Design, development and branding services — small studio, senior people, shipped work.',
    categories: ['Design', 'Development', 'Branding'],
    vibe: ['Sharp', 'Modern', 'Expert'],
    gradient: 'from-[#0891b2] to-[#164e63]',
    status: 'live',
    theme: {
      brand: '#0891b2',
      brandSoft: '#cffafe',
      brandInk: '#ffffff',
      surface: '#f8feff',
      surface2: '#ecf9fb',
      ink: '#0f2229',
      inkSoft: '#5b7178',
      line: '#d8edf1',
      radius: '10px',
    },
  },
  {
    slug: 'gym-sports',
    name: 'Apex Athletics',
    tagline: 'Gym & Sports',
    description: 'Training gear, equipment and nutrition for people who show up every day.',
    categories: ['Apparel', 'Equipment', 'Nutrition'],
    vibe: ['Energetic', 'Strong', 'Driven'],
    gradient: 'from-[#ea580c] to-[#991b1b]',
    status: 'live',
    theme: {
      brand: '#ea580c',
      brandSoft: '#ffedd5',
      brandInk: '#ffffff',
      surface: '#fffcf9',
      surface2: '#fdf0e6',
      ink: '#241812',
      inkSoft: '#74655c',
      line: '#f2e0d0',
      radius: '10px',
    },
  },
  {
    slug: 'car-bike',
    name: 'Torque & Co.',
    tagline: 'Car & Bike',
    description: 'Parts, accessories and care for cars and bikes — from weekend riders to daily drivers.',
    categories: ['Parts', 'Accessories', 'Care'],
    vibe: ['Rugged', 'Precise', 'Road-ready'],
    gradient: 'from-[#334155] to-[#020617]',
    status: 'live',
    theme: {
      brand: '#dc2626',
      brandSoft: '#fee2e2',
      brandInk: '#ffffff',
      surface: '#fafafa',
      surface2: '#f1f1f1',
      ink: '#18181b',
      inkSoft: '#71717a',
      line: '#e4e4e7',
      radius: '8px',
    },
  },
];

export function getStore(slug: string): StoreEntry | undefined {
  return STORES.find((s) => s.slug === slug);
}

export const LIVE_STORES = STORES.filter((s) => s.status === 'live');
export const SOON_STORES = STORES.filter((s) => s.status === 'soon');
