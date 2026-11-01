import { STORES } from './stores';
import { STORE_DATA, formatPrice } from './catalog';
import type { Product } from './catalog';

/**
 * Master Dashboard data + permission model (demo only — no backend).
 *
 * Everything here is deterministic: the same shop slug always produces the
 * same numbers, so the static export is stable across builds. All image
 * paths come from the catalog data, which already carries the '/shopverse'
 * prefix required by the unoptimized next/image setup.
 */

// ---------------------------------------------------------------------------
// Permissions & roles
// ---------------------------------------------------------------------------

export type PermissionId =
  | 'view_overview'
  | 'view_analytics'
  | 'manage_orders'
  | 'manage_products'
  | 'manage_inventory'
  | 'manage_customers'
  | 'manage_discounts'
  | 'manage_team'
  | 'manage_settings';

export interface PermissionMeta {
  id: PermissionId;
  label: string;
  description: string;
}

export const PERMISSIONS: PermissionMeta[] = [
  { id: 'view_overview', label: 'View overview', description: 'See the dashboard home, KPIs and recent activity.' },
  { id: 'view_analytics', label: 'View analytics', description: 'See charts, channels and exportable reports.' },
  { id: 'manage_orders', label: 'Manage orders', description: 'Change order statuses and view order details.' },
  { id: 'manage_products', label: 'Manage products', description: 'Edit product prices and stock from the catalog.' },
  { id: 'manage_inventory', label: 'Manage inventory', description: 'Adjust stock levels and reorder points.' },
  { id: 'manage_customers', label: 'Manage customers', description: 'View customer profiles and order history.' },
  { id: 'manage_discounts', label: 'Manage discounts', description: 'Create and edit promo codes.' },
  { id: 'manage_team', label: 'Manage team', description: 'Edit roles and per-user permission overrides.' },
  { id: 'manage_settings', label: 'Manage settings', description: 'Change shop settings and preferences.' },
];

export type RoleId = 'super_admin' | 'manager' | 'viewer';

/**
 * Roles are DATA, not hardcoded constants. The dashboard ships with three
 * default (built-in) roles; the Super Admin can create, edit and delete
 * custom roles at runtime. Roles persist to localStorage
 * (`shopverse.dashboard.roles`). Every role carries a shop scope: 'all'
 * shops or a specific subset. A user's accessible shops come from their
 * role's scope unless a per-user shop override replaces it.
 */
export interface RoleDef {
  id: string;
  label: string;
  description: string;
  permissions: PermissionId[];
  scope: 'all' | 'custom';
  /** Used when scope === 'custom'. Ignored when scope === 'all'. */
  shops: string[];
  /** Built-in roles cannot be deleted; the Super Admin role's permission set cannot be reduced. */
  builtIn: boolean;
  /** Read-only roles can view permitted sections but cannot perform any mutation, even when granted a manage permission via override. */
  readOnly: boolean;
}

export const DEFAULT_ROLES: RoleDef[] = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    description: 'Full access to every shop and every permission. Cannot be deleted; permissions cannot be reduced.',
    permissions: PERMISSIONS.map((p) => p.id),
    scope: 'all',
    shops: [],
    builtIn: true,
    readOnly: false,
  },
  {
    id: 'manager',
    label: 'Store Manager',
    description: 'Runs day-to-day operations for assigned shops. Cannot manage the team by default.',
    permissions: [
      'view_overview',
      'view_analytics',
      'manage_orders',
      'manage_products',
      'manage_inventory',
      'manage_customers',
      'manage_discounts',
      'manage_settings',
    ],
    scope: 'custom',
    shops: ['gadget', 'restaurant', 'groceries'],
    builtIn: true,
    readOnly: false,
  },
  {
    id: 'viewer',
    label: 'Staff / Viewer',
    description: 'Read-only. Can view the overview and analytics of one assigned shop.',
    permissions: ['view_overview', 'view_analytics'],
    scope: 'custom',
    shops: ['gadget'],
    builtIn: true,
    readOnly: true,
  },
];

export function resolveRole(roles: RoleDef[], roleId: string): RoleDef | undefined {
  return roles.find((r) => r.id === roleId) ?? DEFAULT_ROLES.find((r) => r.id === roleId);
}

/** A role id counts as "Super Admin" only when it resolves to the built-in super_admin role. */
export function isSuperAdminRole(roles: RoleDef[], roleId: string): boolean {
  const role = resolveRole(roles, roleId);
  return !!role && role.id === 'super_admin' && role.builtIn;
}

export interface UserOverrides {
  grants: PermissionId[];
  revokes: PermissionId[];
  /** null = use the role's shop scope. 'all' or a slug list replaces the role scope. */
  shops: string[] | 'all' | null;
}

export const EMPTY_OVERRIDES: UserOverrides = { grants: [], revokes: [], shops: null };

/** Effective permissions = role set + grants − revokes. */
export function effectivePermissionsFor(role: RoleDef | undefined, override: UserOverrides | undefined): Set<PermissionId> {
  const set = new Set<PermissionId>(role?.permissions ?? []);
  (override?.grants ?? []).forEach((p) => set.add(p));
  (override?.revokes ?? []).forEach((p) => set.delete(p));
  return set;
}

/** Effective shop scope: per-user override wins over the role scope. */
export function effectiveShopsFor(role: RoleDef | undefined, override: UserOverrides | undefined): string[] | 'all' {
  if (override && override.shops !== null) return override.shops;
  if (!role) return [];
  if (role.scope === 'all') return 'all';
  return role.shops;
}

export function accessibleShopsFor(role: RoleDef | undefined, override: UserOverrides | undefined) {
  const scope = effectiveShopsFor(role, override);
  return scope === 'all' ? STORES : STORES.filter((s) => scope.includes(s.slug));
}

export function canAccessShopFor(role: RoleDef | undefined, override: UserOverrides | undefined, slug: string): boolean {
  const scope = effectiveShopsFor(role, override);
  return scope === 'all' || scope.includes(slug);
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  /** Initial role assignment (editable by Super Admin; assignments persist to localStorage). */
  role: RoleId;
  initials: string;
  /** Shown on the login screen as a quick-pick account. */
  demoLogin: boolean;
  /** Base per-user overrides shipped with the demo (editable by Super Admin). */
  baseOverrides: UserOverrides;
}

export const DEMO_PASSWORD = 'demo123';

export const TEAM_MEMBERS: DemoUser[] = [
  {
    id: 'u-admin',
    name: 'Amara Chen',
    email: 'amara@shopverse.demo',
    jobTitle: 'Head of Commerce',
    role: 'super_admin',
    initials: 'AC',
    demoLogin: true,
    baseOverrides: { grants: [], revokes: [], shops: null },
  },
  {
    id: 'u-manager',
    name: 'Rahim Uddin',
    email: 'rahim@shopverse.demo',
    jobTitle: 'Store Manager',
    role: 'manager',
    initials: 'RU',
    demoLogin: true,
    // Demo override: Rahim was also granted team management for his shops.
    baseOverrides: { grants: ['manage_team'], revokes: [], shops: null },
  },
  {
    id: 'u-staff',
    name: 'Sofia Reyes',
    email: 'sofia@shopverse.demo',
    jobTitle: 'Sales Assistant',
    role: 'viewer',
    initials: 'SR',
    demoLogin: true,
    // Demo override: Sofia may view orders (read-only browsing) but cannot change them.
    baseOverrides: { grants: ['manage_orders'], revokes: [], shops: null },
  },
  {
    id: 'u-ops',
    name: 'Daniel Okafor',
    email: 'daniel@shopverse.demo',
    jobTitle: 'Operations Lead',
    role: 'manager',
    initials: 'DO',
    demoLogin: false,
    baseOverrides: { grants: [], revokes: ['manage_discounts'], shops: ['games', 'ebook'] },
  },
  {
    id: 'u-support',
    name: 'Priya Raman',
    email: 'priya@shopverse.demo',
    jobTitle: 'Support Specialist',
    role: 'viewer',
    initials: 'PR',
    demoLogin: false,
    baseOverrides: { grants: ['manage_customers'], revokes: [], shops: ['restaurant'] },
  },
];

export const DEMO_LOGIN_USERS = TEAM_MEMBERS.filter((u) => u.demoLogin);

export function getUser(id: string): DemoUser | undefined {
  return TEAM_MEMBERS.find((u) => u.id === id);
}

/** Stored overrides (edited by Super Admin) replace the shipped base overrides wholesale. */
export function resolveOverrides(user: DemoUser, stored: UserOverrides | undefined): UserOverrides {
  return stored ?? user.baseOverrides;
}

// ---------------------------------------------------------------------------
// Seeded deterministic data per shop
// ---------------------------------------------------------------------------

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DayPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface MonthPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface DashboardOrderItem {
  productId: string;
  name: string;
  image: string;
  qty: number;
  price: number;
}

export type OrderStatus = 'Delivered' | 'Shipped' | 'Processing' | 'Pending' | 'Cancelled';

export interface DashboardOrder {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: DashboardOrderItem[];
  total: number;
  status: OrderStatus;
  channel: 'Online' | 'In-store' | 'App';
  payment: 'Card' | 'Cash' | 'PayPal';
}

export interface DashboardCustomer {
  id: string;
  name: string;
  email: string;
  city: string;
  segment: 'VIP' | 'Regular' | 'New';
  totalSpent: number;
  orders: number;
  lastOrder: string;
  joined: string;
}

export interface InventoryRow {
  product: Product;
  sku: string;
  stock: number;
  reorderPoint: number;
  cost: number;
  supplier: string;
}

export interface DiscountRow {
  code: string;
  percent: number;
  usage: number;
  usageLimit: number;
  minOrder: number;
  status: 'Active' | 'Scheduled' | 'Expired';
  expires: string;
}

export interface Kpi {
  value: string;
  raw: number;
  delta: number;
  deltaLabel: string;
}

export interface ShopDashboardData {
  slug: string;
  months: MonthPoint[];
  days: DayPoint[]; // last 30 days
  prevDays: DayPoint[]; // previous 30 days (for deltas)
  kpis: {
    revenue: Kpi;
    orders: Kpi;
    aov: Kpi;
    conversion: Kpi;
    returning: Kpi;
  };
  orders: DashboardOrder[];
  customers: DashboardCustomer[];
  inventory: InventoryRow[];
  discounts: DiscountRow[];
  topProducts: { product: Product; revenue: number; units: number }[];
  categoryShare: { category: string; value: number }[];
  channelShare: { channel: string; value: number }[];
  weekdayPattern: { day: string; orders: number }[];
  notifications: { id: string; kind: 'low-stock' | 'order' | 'review'; text: string; time: string }[];
}

const FIRST_NAMES = ['Aisha', 'Liam', 'Maya', 'Noah', 'Elena', 'Omar', 'Priya', 'Daniel', 'Sofia', 'Lucas', 'Nadia', 'Ethan'];
const LAST_NAMES = ['Khan', 'Smith', 'Rahman', 'Garcia', 'Chen', 'Patel', 'Ahmed', 'Kim', 'Ali', 'Novak', 'Hossain', 'Silva'];
const CITIES = ['Dhaka', 'New York', 'London', 'Toronto', 'Sydney', 'Berlin', 'Austin', 'Chattogram', 'Chicago', 'Dubai'];
const SUPPLIERS = ['Northwind Supply', 'Atlas Goods', 'Meridian Trading', 'BluePeak Distributors', 'Casa Verde Co.'];
const REVIEW_SNIPPETS = [
  '“Beautiful quality — better than the photos.”',
  '“Fast delivery and lovely packaging.”',
  '“My second order this month. Never disappoints.”',
  '“Exactly as described. Will buy again.”',
];

const MONTH_LABELS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const DAY_LABELS = Array.from({ length: 30 }, (_, i) => `Oct ${i + 1}`);

export function buildShopDashboard(slug: string): ShopDashboardData {
  const data = STORE_DATA[slug];
  const rng = mulberry32(hashSeed(slug));
  const products = data?.products ?? [];
  const avgPrice = products.length ? products.reduce((n, p) => n + p.price, 0) / products.length : 50;
  // Scale: busier shops (higher avg price) run smaller order counts, cheaper shops more volume.
  const dailyBase = Math.max(6, Math.round(2600 / Math.max(avgPrice, 8)));
  const jitter = (v: number, amt: number) => Math.max(0, Math.round(v + (rng() - 0.5) * 2 * amt));

  const makeDay = (label: string, idx: number): DayPoint => {
    const weekly = 1 + 0.35 * Math.sin((idx / 7) * Math.PI * 2 + hashSeed(slug) % 6);
    const growth = 1 + idx * 0.004;
    const orders = jitter(dailyBase * weekly * growth, dailyBase * 0.25);
    const revenue = Math.round(orders * avgPrice * (0.9 + rng() * 0.35));
    return { label, revenue, orders };
  };

  const prevDays = Array.from({ length: 30 }, (_, i) => makeDay(`Sep ${i + 1}`, i));
  const days = DAY_LABELS.map((label, i) => makeDay(label, i + 30));

  const months: MonthPoint[] = MONTH_LABELS.map((label, i) => {
    const seasonal = 1 + 0.3 * Math.sin((i / 12) * Math.PI * 2 + 1.2);
    const orders = jitter(dailyBase * 30 * seasonal * (1 + i * 0.02), dailyBase * 6);
    return { label, revenue: Math.round(orders * avgPrice * (0.92 + rng() * 0.3)), orders };
  });

  const sum = (arr: DayPoint[], key: 'revenue' | 'orders') => arr.reduce((n, d) => n + d[key], 0);
  const rev30 = sum(days, 'revenue');
  const revPrev = sum(prevDays, 'revenue');
  const ord30 = sum(days, 'orders');
  const ordPrev = sum(prevDays, 'orders');
  const pct = (cur: number, prev: number) => (prev === 0 ? 0 : ((cur - prev) / prev) * 100);
  const aov = ord30 ? rev30 / ord30 : 0;
  const aovPrev = ordPrev ? revPrev / ordPrev : 0;
  const conversion = 2.1 + rng() * 2.4;
  const returning = 24 + rng() * 22;

  // Customers (generated first so orders reference them).
  const customers: DashboardCustomer[] = Array.from({ length: 9 }, (_, i) => {
    const name = `${FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]}`;
    const spent = Math.round((80 + rng() * 2400) * (avgPrice / 60 + 0.4));
    const orderCount = 1 + Math.floor(rng() * 14);
    return {
      id: `cus-${slug}-${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
      city: CITIES[Math.floor(rng() * CITIES.length)],
      segment: spent > 1500 ? 'VIP' : orderCount <= 2 ? 'New' : 'Regular',
      totalSpent: spent,
      orders: orderCount,
      lastOrder: `Oct ${28 - Math.floor(rng() * 20)}`,
      joined: `${['Jan', 'Mar', 'May', 'Jul', 'Sep'][Math.floor(rng() * 5)]} 202${Math.floor(rng() * 6)}`,
    };
  });

  const statuses: OrderStatus[] = ['Delivered', 'Delivered', 'Delivered', 'Shipped', 'Shipped', 'Processing', 'Pending', 'Cancelled'];
  const orders: DashboardOrder[] = Array.from({ length: 10 }, (_, i) => {
    const customer = customers[Math.floor(rng() * customers.length)];
    const itemCount = 1 + Math.floor(rng() * 3);
    const items: DashboardOrderItem[] = [];
    const used = new Set<number>();
    for (let k = 0; k < itemCount && products.length; k++) {
      let idx = Math.floor(rng() * products.length);
      if (used.has(idx)) idx = (idx + 1) % products.length;
      used.add(idx);
      const p = products[idx];
      items.push({ productId: p.id, name: p.name, image: p.image, qty: 1 + Math.floor(rng() * 2), price: p.price });
    }
    const total = items.reduce((n, it) => n + it.qty * it.price, 0);
    return {
      id: `${data?.orderPrefix ?? 'SV'}-2026-${2410 + i * 7}`,
      customer: customer.name,
      email: customer.email,
      date: `Oct ${31 - Math.floor(i / 4)}`,
      items,
      total,
      status: statuses[Math.floor(rng() * statuses.length)],
      channel: (['Online', 'Online', 'In-store', 'App'] as const)[Math.floor(rng() * 4)],
      payment: (['Card', 'Card', 'Cash', 'PayPal'] as const)[Math.floor(rng() * 4)],
    };
  });

  const inventory: InventoryRow[] = products.map((p, i) => ({
    product: p,
    sku: `${(data?.orderPrefix ?? 'SV')}-${String(100 + i)}`,
    stock: [4, 9, 14, 22, 31, 48, 7, 63][i % 8] + Math.floor(rng() * 8),
    reorderPoint: 10 + Math.floor(rng() * 8),
    cost: Math.max(1, Math.round(p.price * 0.55)),
    supplier: SUPPLIERS[Math.floor(rng() * SUPPLIERS.length)],
  }));

  const prefix = (data?.orderPrefix ?? 'SV').toUpperCase();
  const discounts: DiscountRow[] = [
    { code: 'WELCOME10', percent: 10, usage: 120 + Math.floor(rng() * 180), usageLimit: 500, minOrder: 0, status: 'Active', expires: 'Dec 31, 2026' },
    { code: `${prefix}15`, percent: 15, usage: 20 + Math.floor(rng() * 60), usageLimit: 200, minOrder: 75, status: 'Active', expires: 'Nov 30, 2026' },
    { code: `${prefix}FREESHIP`, percent: 0, usage: 45 + Math.floor(rng() * 90), usageLimit: 300, minOrder: 50, status: 'Active', expires: 'Nov 15, 2026' },
    { code: `${prefix}FESTIVE20`, percent: 20, usage: 0, usageLimit: 150, minOrder: 100, status: 'Scheduled', expires: 'Dec 20, 2026' },
  ];

  const topProducts = products
    .map((p) => ({ product: p, units: 20 + Math.floor(rng() * 220), revenue: 0 }))
    .map((t) => ({ ...t, revenue: t.units * t.product.price }))
    .sort((a, b) => b.revenue - a.revenue);

  const categoryShare = (data?.categories ?? []).map((c) => {
    const catProducts = products.filter((p) => p.category === c);
    const value = catProducts.reduce((n, p) => n + p.price * (20 + hashSeed(p.id) % 120), 0);
    return { category: c, value };
  });

  const channelShare = [
    { channel: 'Online', value: 52 + Math.floor(rng() * 18) },
    { channel: 'In-store', value: 18 + Math.floor(rng() * 12) },
    { channel: 'App', value: 12 + Math.floor(rng() * 10) },
  ];

  const weekdayPattern = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    day,
    orders: jitter(dailyBase * (i >= 5 ? 1.25 : 1), dailyBase * 0.3),
  }));

  const lowStock = inventory.filter((r) => r.stock <= r.reorderPoint);
  const notifications: ShopDashboardData['notifications'] = [
    ...lowStock.slice(0, 2).map((r, i) => ({
      id: `n-low-${i}`,
      kind: 'low-stock' as const,
      text: `Low stock: ${r.product.name} — ${r.stock} left (reorder at ${r.reorderPoint}).`,
      time: `${1 + i}h ago`,
    })),
    {
      id: 'n-order',
      kind: 'order' as const,
      text: `New order ${orders[0]?.id ?? ''} — ${formatPrice(orders[0]?.total ?? 0)} from ${orders[0]?.customer ?? ''}.`,
      time: '26m ago',
    },
    {
      id: 'n-review',
      kind: 'review' as const,
      text: `New 5★ review: ${REVIEW_SNIPPETS[Math.floor(rng() * REVIEW_SNIPPETS.length)]}`,
      time: '3h ago',
    },
  ];

  return {
    slug,
    months,
    days,
    prevDays,
    kpis: {
      revenue: { value: formatPrice(rev30), raw: rev30, delta: pct(rev30, revPrev), deltaLabel: 'vs previous 30 days' },
      orders: { value: String(ord30), raw: ord30, delta: pct(ord30, ordPrev), deltaLabel: 'vs previous 30 days' },
      aov: { value: formatPrice(Math.round(aov * 100) / 100), raw: aov, delta: pct(aov, aovPrev), deltaLabel: 'vs previous 30 days' },
      conversion: { value: `${conversion.toFixed(1)}%`, raw: conversion, delta: 0.4 + rng() * 0.8, deltaLabel: 'vs previous 30 days' },
      returning: { value: `${Math.round(returning)}%`, raw: returning, delta: -(0.3 + rng() * 1.2), deltaLabel: 'vs previous 30 days' },
    },
    orders,
    customers,
    inventory,
    discounts,
    topProducts,
    categoryShare,
    channelShare,
    weekdayPattern,
    notifications,
  };
}

export function ordersToCsv(orders: DashboardOrder[]): string {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [
    ['Order ID', 'Date', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Channel', 'Payment'],
    ...orders.map((o) => [
      o.id,
      o.date,
      o.customer,
      o.email,
      o.items.map((i) => `${i.qty}× ${i.name}`).join('; '),
      o.total.toFixed(2),
      o.status,
      o.channel,
      o.payment,
    ]),
  ];
  return rows.map((r) => r.map(esc).join(',')).join('\n');
}

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
