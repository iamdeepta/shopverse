'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { getStore, STORES, type StoreEntry } from '@/data/stores';
import { formatPrice, getStoreData } from '@/data/catalog';
import {
  DEFAULT_ROLES,
  DEMO_LOGIN_USERS,
  DEMO_PASSWORD,
  EMPTY_OVERRIDES,
  ORDER_STATUSES,
  PERMISSIONS,
  TEAM_MEMBERS,
  buildShopDashboard,
  canAccessShopFor,
  effectivePermissionsFor,
  effectiveShopsFor,
  isSuperAdminRole,
  ordersToCsv,
  resolveOverrides,
  resolveRole,
  type DemoUser,
  type DiscountRow,
  type OrderStatus,
  type PermissionId,
  type RoleDef,
  type ShopDashboardData,
  type UserOverrides,
} from '@/data/dashboard';
import { AreaChart, BarChart, DonutChart, DualChart, Sparkline, palette } from '@/components/dashboard/Charts';

// ---------------------------------------------------------------------------
// Local storage keys (demo session data only — no backend, no real auth)
// ---------------------------------------------------------------------------

const LS = {
  session: 'shopverse.dashboard.session',
  roles: 'shopverse.dashboard.roles',
  assignments: 'shopverse.dashboard.assignments',
  overrides: 'shopverse.dashboard.overrides',
  settings: 'shopverse.dashboard.settings',
  activeShop: 'shopverse.dashboard.activeShop',
};
const stockKey = (slug: string) => `shopverse.dashboard.stock.${slug}`;
const priceKey = (slug: string) => `shopverse.dashboard.prices.${slug}`;
const orderStatusKey = (slug: string) => `shopverse.dashboard.orderStatus.${slug}`;
const discountsKey = (slug: string) => `shopverse.dashboard.discounts.${slug}`;

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — demo state stays in memory */
  }
}

type SectionId = 'overview' | 'orders' | 'products' | 'customers' | 'inventory' | 'analytics' | 'discounts' | 'team' | 'settings';

const SECTIONS: { id: SectionId; label: string; icon: string; permission: PermissionId }[] = [
  { id: 'overview', label: 'Overview', icon: '◉', permission: 'view_overview' },
  { id: 'orders', label: 'Orders', icon: '▤', permission: 'manage_orders' },
  { id: 'products', label: 'Products', icon: '▦', permission: 'manage_products' },
  { id: 'customers', label: 'Customers', icon: '◉', permission: 'manage_customers' },
  { id: 'inventory', label: 'Inventory', icon: '▥', permission: 'manage_inventory' },
  { id: 'analytics', label: 'Analytics', icon: '↗', permission: 'view_analytics' },
  { id: 'discounts', label: 'Discounts', icon: '%', permission: 'manage_discounts' },
  { id: 'team', label: 'Team & Roles', icon: '⚇', permission: 'manage_team' },
  { id: 'settings', label: 'Settings', icon: '⚙', permission: 'manage_settings' },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  Delivered: 'bg-emerald-100 text-emerald-700',
  Shipped: 'bg-sky-100 text-sky-700',
  Processing: 'bg-amber-100 text-amber-700',
  Pending: 'bg-slate-200 text-slate-600',
  Cancelled: 'bg-rose-100 text-rose-600',
};

function deltaBadge(delta: number) {
  const up = delta >= 0;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${up ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
      {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

function Card({ title, subtitle, action, children, className = '' }: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-display text-lg font-bold text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Login screen
// ---------------------------------------------------------------------------

function LoginScreen({ onLogin }: { onLogin: (userId: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e?: React.FormEvent, preset?: DemoUser) => {
    e?.preventDefault();
    const em = (preset?.email ?? email).trim().toLowerCase();
    const pw = preset ? DEMO_PASSWORD : password;
    const user = TEAM_MEMBERS.find((u) => u.email.toLowerCase() === em);
    if (!user || !user.demoLogin) {
      setError('No demo account matches that email. Pick one of the demo accounts below.');
      return;
    }
    if (pw !== DEMO_PASSWORD) {
      setError('Wrong password. The demo password is shown on each account card.');
      return;
    }
    onLogin(user.id);
  };

  return (
    <div className="grid min-h-screen bg-[#faf7f2] lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#171310] p-10 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#b4552d]/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-[#7c3aed]/25 blur-3xl" />
        <p className="relative font-display text-2xl font-bold tracking-[0.22em]">
          SHOP<span className="text-[#e09a72]">VERSE</span>
        </p>
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">Command Center</p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-[1.05]">
            One dashboard to run all eleven stores.
          </h1>
          <p className="mt-4 max-w-md leading-relaxed text-white/70">
            Switch shops, watch revenue, fulfil orders, manage stock and control who sees what — from a single login.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {['Single login, eleven shop dashboards', 'Role-based access, down to each permission', 'Live-style analytics, orders, inventory & customers', 'Every shop keeps its own look and data'].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative grid grid-cols-3 gap-4 text-center">
          {[
            ['11', 'stores'],
            ['88', 'products'],
            ['9', 'permission types'],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-white/10 bg-white/5 py-4">
              <p className="font-display text-3xl font-bold">{v}</p>
              <p className="text-xs uppercase tracking-wider text-white/60">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <p className="font-display text-2xl font-bold tracking-[0.22em] lg:hidden">
            SHOP<span className="text-[#b4552d]">VERSE</span>
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">Sign in to the dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">Demo accounts — no real authentication. Pick a card to sign in instantly.</p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <div>
              <label className="text-sm font-medium" htmlFor="dash-email">Email</label>
              <input
                id="dash-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@shopverse.demo"
                className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#b4552d] focus:ring-2 focus:ring-[#b4552d]/25"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="dash-password">Password</label>
              <input
                id="dash-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo123"
                className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#b4552d] focus:ring-2 focus:ring-[#b4552d]/25"
              />
            </div>
            {error && <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{error}</p>}
            <button type="submit" className="w-full rounded-full bg-[#221a15] py-3 text-sm font-semibold text-white transition hover:opacity-90">
              Sign in →
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Quick-pick demo accounts · password: demo123</p>
            {DEMO_LOGIN_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => submit(undefined, u)}
                className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#221a15] text-sm font-bold text-white">{u.initials}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{u.name} · {DEFAULT_ROLES.find((r) => r.id === u.role)?.label}</span>
                  <span className="block truncate text-xs text-gray-500">{u.email} · {u.jobTitle}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-[#b4552d]">Sign in →</span>
              </button>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-gray-500">
            Just browsing the mall? <Link href="/" className="font-semibold text-[#b4552d] underline underline-offset-4">Back to ShopVerse →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard shell
// ---------------------------------------------------------------------------

interface SettingsState {
  notifications: boolean;
  lowStockAlerts: boolean;
  weeklyDigest: boolean;
}

const DEFAULT_SETTINGS: SettingsState = { notifications: true, lowStockAlerts: true, weeklyDigest: false };

export default function DashboardPage() {
  const [hydrated, setHydrated] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  // Roles / assignments / overrides (editable data, persisted).
  const [roles, setRoles] = useState<RoleDef[]>(DEFAULT_ROLES);
  const [assignments, setAssignments] = useState<Record<string, string>>(() =>
    Object.fromEntries(TEAM_MEMBERS.map((u) => [u.id, u.role])),
  );
  const [storedOverrides, setStoredOverrides] = useState<Record<string, UserOverrides>>({});
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  // Shop + section state.
  const [activeShop, setActiveShop] = useState('aurelle');
  const [section, setSection] = useState<SectionId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Per-shop mutable demo state (persisted per shop).
  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>({});
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [orderStatusOverrides, setOrderStatusOverrides] = useState<Record<string, OrderStatus>>({});
  const [extraDiscounts, setExtraDiscounts] = useState<DiscountRow[]>([]);

  // Section-local UI state.
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | OrderStatus>('All');
  const [orderVisible, setOrderVisible] = useState(6);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('All');
  const [productSort, setProductSort] = useState<'name' | 'price-desc' | 'price-asc' | 'stock-asc'>('name');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '12m'>('30d');
  const [newDiscount, setNewDiscount] = useState({ code: '', percent: 10, minOrder: 0, expires: 'Dec 31, 2026' });
  const [roleForm, setRoleForm] = useState<null | { mode: 'create' | 'edit'; role: RoleDef }>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [overrideUserId, setOverrideUserId] = useState<string | null>(null);

  // Hydrate persisted state once (client-only; keeps the static prerender stable).
  useEffect(() => {
    const sid = window.localStorage.getItem(LS.session);
    if (sid && TEAM_MEMBERS.some((u) => u.id === sid)) setSessionUserId(sid);
    const savedRoles = readJson<RoleDef[]>(LS.roles);
    if (savedRoles && savedRoles.length > 0) setRoles(savedRoles);
    const savedAssignments = readJson<Record<string, string>>(LS.assignments);
    if (savedAssignments) setAssignments((prev) => ({ ...prev, ...savedAssignments }));
    const savedOverrides = readJson<Record<string, UserOverrides>>(LS.overrides);
    if (savedOverrides) setStoredOverrides(savedOverrides);
    const savedSettings = readJson<SettingsState>(LS.settings);
    if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
    const savedShop = window.localStorage.getItem(LS.activeShop);
    if (savedShop && getStore(savedShop)) setActiveShop(savedShop);
    setHydrated(true);
  }, []);

  // Persist role/assignment/override/settings changes.
  useEffect(() => {
    if (hydrated) writeJson(LS.roles, roles);
  }, [roles, hydrated]);
  useEffect(() => {
    if (hydrated) writeJson(LS.assignments, assignments);
  }, [assignments, hydrated]);
  useEffect(() => {
    if (hydrated) writeJson(LS.overrides, storedOverrides);
  }, [storedOverrides, hydrated]);
  useEffect(() => {
    if (hydrated) writeJson(LS.settings, settings);
  }, [settings, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem(LS.activeShop, activeShop);
  }, [activeShop, hydrated]);

  // Load per-shop mutable state when the shop changes.
  useEffect(() => {
    if (!hydrated) return;
    setStockOverrides(readJson(stockKey(activeShop)) ?? {});
    setPriceOverrides(readJson(priceKey(activeShop)) ?? {});
    setOrderStatusOverrides(readJson(orderStatusKey(activeShop)) ?? {});
    setExtraDiscounts(readJson(discountsKey(activeShop)) ?? []);
    setSelectedOrderId(null);
    setSelectedCustomerId(null);
    setOrderVisible(6);
  }, [activeShop, hydrated]);

  const user = useMemo(() => TEAM_MEMBERS.find((u) => u.id === sessionUserId), [sessionUserId]);
  const roleId = user ? (assignments[user.id] ?? user.role) : 'viewer';
  const role = useMemo(() => resolveRole(roles, roleId), [roles, roleId]);
  const overrides = useMemo(() => resolveOverrides(user ?? TEAM_MEMBERS[0], storedOverrides[user?.id ?? '']), [user, storedOverrides]);
  const perms = useMemo(() => effectivePermissionsFor(role, overrides), [role, overrides]);
  const isSuperAdmin = useMemo(() => isSuperAdminRole(roles, roleId), [roles, roleId]);
  const readOnly = !!role?.readOnly;
  const canWrite = (p: PermissionId) => perms.has(p) && !readOnly;
  const shops = useMemo(() => {
    if (!user) return STORES;
    const scope = effectiveShopsFor(role, overrides);
    return scope === 'all' ? STORES : STORES.filter((s) => scope.includes(s.slug));
  }, [user, role, overrides]);
  const store = getStore(activeShop) ?? STORES[0];

  // Graceful fallback: if the current user's role/permissions/shop access
  // changes (e.g. Super Admin edits their own role), never strand them on a
  // section or shop they can no longer open.
  const visibleSections = useMemo(
    () => SECTIONS.filter((s) => perms.has(s.permission)),
    [perms],
  );
  useEffect(() => {
    if (!hydrated || !user) return;
    if (!visibleSections.some((s) => s.id === section)) {
      setSection(visibleSections[0]?.id ?? 'overview');
    }
    if (!canAccessShopFor(role, overrides, activeShop)) {
      const first = shops[0];
      if (first) setActiveShop(first.slug);
    }
  }, [hydrated, user, visibleSections, section, role, overrides, activeShop, shops]);

  const base: ShopDashboardData = useMemo(() => buildShopDashboard(activeShop), [activeShop]);

  // Apply persisted per-shop mutations on top of the seeded data.
  const inventory = useMemo(
    () =>
      base.inventory.map((row) => ({
        ...row,
        stock: stockOverrides[row.product.id] ?? row.stock,
        product: priceOverrides[row.product.id] !== undefined ? { ...row.product, price: priceOverrides[row.product.id]! } : row.product,
      })),
    [base, stockOverrides, priceOverrides],
  );
  const products = useMemo(
    () =>
      base.inventory.map((row) => (priceOverrides[row.product.id] !== undefined ? { ...row.product, price: priceOverrides[row.product.id]! } : row.product)),
    [base, priceOverrides],
  );
  const orders = useMemo(
    () => base.orders.map((o) => ({ ...o, status: orderStatusOverrides[o.id] ?? o.status })),
    [base, orderStatusOverrides],
  );
  const discounts = useMemo(() => [...extraDiscounts, ...base.discounts], [extraDiscounts, base]);
  const lowStock = useMemo(() => inventory.filter((r) => r.stock <= r.reorderPoint), [inventory]);
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;
  const selectedCustomer = base.customers.find((c) => c.id === selectedCustomerId) ?? null;

  const setStock = (productId: string, stock: number) => {
    const next = { ...stockOverrides, [productId]: Math.max(0, stock) };
    setStockOverrides(next);
    writeJson(stockKey(activeShop), next);
  };
  const setPrice = (productId: string, price: number) => {
    const next = { ...priceOverrides, [productId]: Math.max(0, price) };
    setPriceOverrides(next);
    writeJson(priceKey(activeShop), next);
  };
  const setOrderStatus = (orderId: string, status: OrderStatus) => {
    const next = { ...orderStatusOverrides, [orderId]: status };
    setOrderStatusOverrides(next);
    writeJson(orderStatusKey(activeShop), next);
  };
  const addDiscount = (d: DiscountRow) => {
    const next = [d, ...extraDiscounts];
    setExtraDiscounts(next);
    writeJson(discountsKey(activeShop), next);
  };

  const logout = () => {
    window.localStorage.removeItem(LS.session);
    setSessionUserId(null);
    setSection('overview');
  };
  const login = (userId: string) => {
    window.localStorage.setItem(LS.session, userId);
    setSessionUserId(userId);
    const u = TEAM_MEMBERS.find((x) => x.id === userId);
    if (u) {
      const r = resolveRole(roles, assignments[u.id] ?? u.role);
      const ov = resolveOverrides(u, storedOverrides[u.id]);
      const scope = effectiveShopsFor(r, ov);
      const first = scope === 'all' ? STORES[0] : STORES.find((s) => scope.includes(s.slug));
      if (first) setActiveShop(first.slug);
      setSection('overview');
    }
  };

  // Global search across the current shop's products, orders and customers.
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return null;
    return {
      products: products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 3),
      orders: orders.filter((o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)).slice(0, 3),
      customers: base.customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [searchQuery, products, orders, base]);

  const exportCsv = () => {
    const blob = new Blob([ordersToCsv(orders)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeShop}-orders.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hydrated) {
    return <div className="min-h-screen bg-[#faf7f2]" aria-label="Loading dashboard" />;
  }
  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  // Theme: same token mechanism as the store layout — CSS variables from the
  // active shop's registry theme, applied to the dashboard root.
  const t = store.theme;
  const vars = {
    '--brand': t.brand,
    '--brand-soft': t.brandSoft,
    '--brand-ink': t.brandInk,
    '--surface': t.surface,
    '--surface-2': t.surface2,
    '--ink': t.ink,
    '--ink-soft': t.inkSoft,
    '--line': t.line,
    '--radius': t.radius,
  } as CSSProperties;
  const brand = t.brand;

  const periodData = chartPeriod === '12m' ? base.months : chartPeriod === '7d' ? base.days.slice(-7) : base.days;
  const periodLabels = periodData.map((d) => d.label);
  const periodRevenue = periodData.map((d) => d.revenue);
  const periodOrders = periodData.map((d) => d.orders);

  const sidebar = (
    <div className="flex h-full flex-col text-white" style={{ background: `color-mix(in srgb, ${brand} 78%, #171310)` }}>
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <Link href="/" className="font-display text-xl font-bold tracking-[0.18em]">
          SHOP<span className="opacity-80">VERSE</span>
        </Link>
        <button className="rounded-lg px-2 py-1 text-white/70 hover:bg-white/10 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
          ✕
        </button>
      </div>
      <p className="px-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Command Center</p>

      <div className="px-3 pt-3">
        <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Your shops ({shops.length})</p>
        <div className="nice-scroll max-h-56 space-y-1 overflow-y-auto pr-1">
          {shops.map((s) => (
            <button
              key={s.slug}
              onClick={() => {
                setActiveShop(s.slug);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                s.slug === activeShop ? 'bg-white font-semibold text-gray-900 shadow' : 'text-white/85 hover:bg-white/10'
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.gradient} text-sm font-bold text-white`}>
                {s.name.charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{s.name}</span>
                <span className={`block truncate text-xs ${s.slug === activeShop ? 'text-gray-500' : 'text-white/60'}`}>{s.tagline}</span>
              </span>
              {s.slug === activeShop && <span className="text-xs">●</span>}
            </button>
          ))}
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-1 px-3">
        <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Manage</p>
        {visibleSections.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSection(s.id);
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
              section === s.id ? 'bg-white font-semibold text-gray-900 shadow' : 'text-white/85 hover:bg-white/10'
            }`}
          >
            <span className="w-5 text-center">{s.icon}</span>
            {s.label}
            {s.id === 'inventory' && lowStock.length > 0 && (
              <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">{lowStock.length}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/15 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-900">{user.initials}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-white/65">{role?.label ?? ''}{readOnly ? ' · Read-only' : ''}</p>
          </div>
          <button onClick={logout} className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/20" title="Log out">
            Logout
          </button>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-white/55">
          {perms.size} of {PERMISSIONS.length} permissions · {shops.length} shop{shops.length === 1 ? '' : 's'} · Demo data only
        </p>
      </div>
    </div>
  );

  return (
    <div style={vars} className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 lg:block">{sidebar}</aside>
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">{sidebar}</aside>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/90 backdrop-blur">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
              <button className="rounded-lg border border-gray-200 px-2.5 py-2 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                ☰
              </button>
              <div>
                <h1 className="font-display text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
                  {store.name} <span className="font-body text-sm font-normal text-gray-500">· {store.tagline}</span>
                </h1>
                <p className="text-xs text-gray-500">
                  Signed in as {user.name} ({role?.label}) · Theme follows the active shop
                </p>
              </div>

              <div className="relative ml-auto w-full sm:w-72">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${store.name} products, orders, customers…`}
                  className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:bg-white focus:ring-2 focus:ring-[var(--brand)]/20"
                />
                {searchResults && (
                  <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    {searchResults.products.length + searchResults.orders.length + searchResults.customers.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-500">No matches in {store.name} for “{searchQuery}”.</p>
                    ) : (
                      <>
                        {searchResults.products.length > 0 && (
                          <div className="border-b border-gray-100 px-4 py-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Products</p>
                            {searchResults.products.map((p) => (
                              <button
                                key={p.id}
                                className="block w-full truncate py-1 text-left text-sm hover:text-[var(--brand)]"
                                onClick={() => {
                                  setSection('products');
                                  setProductSearch(p.name);
                                  setSearchQuery('');
                                }}
                              >
                                {p.name} · {formatPrice(p.price)}
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.orders.length > 0 && (
                          <div className="border-b border-gray-100 px-4 py-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Orders</p>
                            {searchResults.orders.map((o) => (
                              <button
                                key={o.id}
                                className="block w-full truncate py-1 text-left text-sm hover:text-[var(--brand)]"
                                onClick={() => {
                                  setSection('orders');
                                  setSelectedOrderId(o.id);
                                  setSearchQuery('');
                                }}
                              >
                                {o.id} · {o.customer} · {formatPrice(o.total)}
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.customers.length > 0 && (
                          <div className="px-4 py-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Customers</p>
                            {searchResults.customers.map((c) => (
                              <button
                                key={c.id}
                                className="block w-full truncate py-1 text-left text-sm hover:text-[var(--brand)]"
                                onClick={() => {
                                  setSection('customers');
                                  setSelectedCustomerId(c.id);
                                  setSearchQuery('');
                                }}
                              >
                                {c.name} · {formatPrice(c.totalSpent)} spent
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShopMenuOpen(!shopMenuOpen);
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                  style={{ background: brand }}
                >
                  <span className="max-w-[140px] truncate">{store.name}</span> ▾
                </button>
                {shopMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <p className="border-b border-gray-100 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Switch shop</p>
                    {shops.map((s) => (
                      <button
                        key={s.slug}
                        onClick={() => {
                          setActiveShop(s.slug);
                          setShopMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                      >
                        <span className={`h-3 w-3 rounded-full bg-gradient-to-br ${s.gradient}`} />
                        <span className="flex-1">{s.name}</span>
                        {s.slug === activeShop && <span className="font-bold" style={{ color: brand }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setShopMenuOpen(false);
                  }}
                  className="relative rounded-full border border-gray-200 bg-white px-3.5 py-2.5 text-sm"
                  aria-label="Notifications"
                >
                  🔔
                  {settings.notifications && base.notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {base.notifications.length}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <p className="border-b border-gray-100 px-4 py-2.5 text-sm font-bold">Notifications · {store.name}</p>
                    {settings.notifications ? (
                      base.notifications.map((n) => (
                        <button
                          key={n.id}
                          className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
                          onClick={() => {
                            setNotifOpen(false);
                            if (n.kind === 'low-stock') setSection('inventory');
                            if (n.kind === 'order') setSection('orders');
                          }}
                        >
                          <span className="mr-2">{n.kind === 'low-stock' ? '⚠️' : n.kind === 'order' ? '🧾' : '⭐'}</span>
                          {n.text}
                          <span className="block pl-6 text-xs text-gray-400">{n.time}</span>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-gray-500">Notifications are turned off in Settings.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile section tabs */}
            <div className="nice-scroll flex gap-1 overflow-x-auto border-t border-gray-100 px-3 py-2 lg:hidden">
              {visibleSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${section === s.id ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                  style={section === s.id ? { background: brand } : undefined}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            {section === 'overview' && (
              <OverviewSection
                base={base}
                brand={brand}
                inventory={inventory}
                orders={orders}
                period={chartPeriod}
                setPeriod={setChartPeriod}
                periodLabels={periodLabels}
                periodRevenue={periodRevenue}
                periodOrders={periodOrders}
                onOpenOrder={(id) => {
                  setSelectedOrderId(id);
                  setSection('orders');
                }}
                onGotoInventory={() => setSection('inventory')}
              />
            )}
            {section === 'orders' && (
              <OrdersSection
                orders={orders}
                brand={brand}
                canChange={canWrite('manage_orders')}
                search={orderSearch}
                setSearch={setOrderSearch}
                statusFilter={orderStatusFilter}
                setStatusFilter={setOrderStatusFilter}
                visible={orderVisible}
                setVisible={setOrderVisible}
                onChangeStatus={setOrderStatus}
                selectedOrder={selectedOrder}
                onSelectOrder={setSelectedOrderId}
                readOnly={readOnly}
              />
            )}
            {section === 'products' && (
              <ProductsSection
                products={products}
                inventory={inventory}
                brand={brand}
                canEdit={canWrite('manage_products')}
                search={productSearch}
                setSearch={setProductSearch}
                category={productCategory}
                setCategory={setProductCategory}
                sort={productSort}
                setSort={setProductSort}
                editingId={editingProductId}
                setEditingId={setEditingProductId}
                editPrice={editPrice}
                setEditPrice={setEditPrice}
                editStock={editStock}
                setEditStock={setEditStock}
                onSave={(id, price, stock) => {
                  setPrice(id, price);
                  setStock(id, stock);
                  setEditingProductId(null);
                }}
                readOnly={readOnly}
              />
            )}
            {section === 'customers' && (
              <CustomersSection
                customers={base.customers}
                orders={orders}
                brand={brand}
                search={customerSearch}
                setSearch={setCustomerSearch}
                selected={selectedCustomer}
                onSelect={setSelectedCustomerId}
                canView={perms.has('manage_customers')}
              />
            )}
            {section === 'inventory' && (
              <InventorySection
                inventory={inventory}
                brand={brand}
                canAdjust={canWrite('manage_inventory')}
                onAdjust={(id, delta) => {
                  const row = inventory.find((r) => r.product.id === id);
                  if (row) setStock(id, row.stock + delta);
                }}
                readOnly={readOnly}
              />
            )}
            {section === 'analytics' && (
              <AnalyticsSection base={base} brand={brand} onExport={exportCsv} period={chartPeriod} setPeriod={setChartPeriod} />
            )}
            {section === 'discounts' && (
              <DiscountsSection
                discounts={discounts}
                brand={brand}
                canCreate={canWrite('manage_discounts')}
                draft={newDiscount}
                setDraft={setNewDiscount}
                onCreate={addDiscount}
                readOnly={readOnly}
              />
            )}
            {section === 'team' && (
              <TeamSection
                roles={roles}
                setRoles={setRoles}
                assignments={assignments}
                setAssignments={setAssignments}
                storedOverrides={storedOverrides}
                setStoredOverrides={setStoredOverrides}
                brand={brand}
                isSuperAdmin={isSuperAdmin}
                roleForm={roleForm}
                setRoleForm={setRoleForm}
                deleteRoleId={deleteRoleId}
                setDeleteRoleId={setDeleteRoleId}
                overrideUserId={overrideUserId}
                setOverrideUserId={setOverrideUserId}
                currentUserId={user.id}
              />
            )}
            {section === 'settings' && (
              <SettingsSection
                store={store}
                brand={brand}
                settings={settings}
                setSettings={setSettings}
                user={user}
                role={role}
                perms={perms}
                shops={shops}
              />
            )}
          </main>

          <footer className="px-6 pb-8 text-center text-xs text-gray-400">
            ShopVerse Command Center · Demo data — no real orders or payments · Theme: {store.name} · <Link href="/" className="underline">Back to the mall →</Link>
          </footer>
        </div>
      </div>

      {/* Order detail drawer */}
      {selectedOrder && section === 'orders' && (
        <OrderDrawer order={selectedOrder} brand={brand} canChange={canWrite('manage_orders')} onChangeStatus={setOrderStatus} onClose={() => setSelectedOrderId(null)} readOnly={readOnly} />
      )}
      {/* Customer detail drawer */}
      {selectedCustomer && section === 'customers' && (
        <CustomerDrawer
          customer={selectedCustomer}
          orders={orders.filter((o) => o.customer === selectedCustomer.name)}
          brand={brand}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function OverviewSection({
  base,
  brand,
  inventory,
  orders,
  period,
  setPeriod,
  periodLabels,
  periodRevenue,
  periodOrders,
  onOpenOrder,
  onGotoInventory,
}: {
  base: ShopDashboardData;
  brand: string;
  inventory: ShopDashboardData['inventory'];
  orders: ShopDashboardData['orders'];
  period: '7d' | '30d' | '12m';
  setPeriod: (p: '7d' | '30d' | '12m') => void;
  periodLabels: string[];
  periodRevenue: number[];
  periodOrders: number[];
  onOpenOrder: (id: string) => void;
  onGotoInventory: () => void;
}) {
  const kpis = [
    { label: 'Revenue (30 days)', kpi: base.kpis.revenue, spark: base.days.map((d) => d.revenue) },
    { label: 'Orders (30 days)', kpi: base.kpis.orders, spark: base.days.map((d) => d.orders) },
    { label: 'Avg. order value', kpi: base.kpis.aov, spark: base.days.map((d) => (d.orders ? d.revenue / d.orders : 0)) },
    { label: 'Conversion rate', kpi: base.kpis.conversion, spark: base.days.map((d) => 2 + (d.orders % 5) * 0.4) },
  ];
  const lowStock = inventory.filter((r) => r.stock <= r.reorderPoint);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, kpi, spark }) => (
          <div key={label} className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-gray-500">{label}</p>
              {deltaBadge(kpi.delta)}
            </div>
            <p className="mt-1 font-display text-3xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-400">{kpi.deltaLabel}</p>
            <div className="mt-3 flex justify-end">
              <Sparkline values={spark} color={brand} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Revenue"
          subtitle="Gross revenue for the selected period"
          className="lg:col-span-2"
          action={
            <div className="flex gap-1 rounded-full bg-gray-100 p-1 text-sm">
              {(['7d', '30d', '12m'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-full px-3 py-1 font-medium ${period === p ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}
                >
                  {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '12 months'}
                </button>
              ))}
            </div>
          }
        >
          <AreaChart labels={periodLabels} values={periodRevenue} color={brand} format={(v) => formatPrice(v)} />
        </Card>
        <Card title="Sales by category" subtitle="Revenue share across this shop's categories">
          <DonutChart
            segments={base.categoryShare.map((c, i) => ({ label: c.category, value: c.value, color: i === 0 ? brand : palette(i) }))}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Orders" subtitle="Order volume for the selected period" className="lg:col-span-2">
          <BarChart labels={periodLabels} values={periodOrders} color={brand} />
        </Card>
        <Card title="Top products" subtitle="By revenue, last 30 days">
          <ul className="space-y-3">
            {base.topProducts.slice(0, 4).map(({ product, revenue, units }) => (
              <li key={product.id} className="flex items-center gap-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{product.name}</span>
                  <span className="text-xs text-gray-400">{units} sold · {product.category}</span>
                </span>
                <span className="text-sm font-semibold">{formatPrice(revenue)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Recent orders"
          subtitle="Latest orders for this shop — click a row for details"
          className="lg:col-span-2"
          action={
            <button className="text-sm font-semibold" style={{ color: brand }} onClick={() => onOpenOrder(orders[0]?.id ?? '')}>
              View all →
            </button>
          }
        >
          <OrderTable orders={orders.slice(0, 5)} onOpen={onOpenOrder} />
        </Card>
        <Card
          title="Low-stock alerts"
          subtitle={`${lowStock.length} item${lowStock.length === 1 ? '' : 's'} at or below reorder point`}
          action={
            <button className="text-sm font-semibold" style={{ color: brand }} onClick={onGotoInventory}>
              Inventory →
            </button>
          }
        >
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-500">All stock levels are healthy. 🎉</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.slice(0, 4).map((r) => (
                <li key={r.product.id} className="flex items-center gap-3 text-sm">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={r.product.image} alt={r.product.name} fill sizes="40px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{r.product.name}</span>
                    <span className="text-xs text-gray-400">Reorder at {r.reorderPoint}</span>
                  </span>
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-600">{r.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function OrderTable({ orders, onOpen }: { orders: ShopDashboardData['orders']; onOpen: (id: string) => void }) {
  if (orders.length === 0) return <p className="py-6 text-center text-sm text-gray-500">No orders match the current filters.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
            <th className="pb-2 pr-3 font-semibold">Order</th>
            <th className="pb-2 pr-3 font-semibold">Customer</th>
            <th className="pb-2 pr-3 font-semibold">Total</th>
            <th className="pb-2 pr-3 font-semibold">Status</th>
            <th className="pb-2 font-semibold">Channel</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50" onClick={() => onOpen(o.id)}>
              <td className="py-2.5 pr-3 font-medium">{o.id}</td>
              <td className="py-2.5 pr-3">{o.customer}</td>
              <td className="py-2.5 pr-3 font-semibold">{formatPrice(o.total)}</td>
              <td className="py-2.5 pr-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[o.status]}`}>{o.status}</span>
              </td>
              <td className="py-2.5 text-gray-500">{o.channel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersSection({
  orders,
  brand,
  canChange,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  visible,
  setVisible,
  onChangeStatus,
  selectedOrder,
  onSelectOrder,
  readOnly,
}: {
  orders: ShopDashboardData['orders'];
  brand: string;
  canChange: boolean;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: 'All' | OrderStatus;
  setStatusFilter: (v: 'All' | OrderStatus) => void;
  visible: number;
  setVisible: (n: number) => void;
  onChangeStatus: (id: string, s: OrderStatus) => void;
  selectedOrder: ShopDashboardData['orders'][number] | null;
  onSelectOrder: (id: string | null) => void;
  readOnly: boolean;
}) {
  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    const matches = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    return matches && (statusFilter === 'All' || o.status === statusFilter);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-bold">Orders</h2>
          <p className="text-sm text-gray-500">
            {filtered.length} order{filtered.length === 1 ? '' : 's'}
            {!canChange && ' · Status changes are disabled for your role' + (readOnly ? ' (read-only)' : '') + ' — requires the Manage orders permission.'}
          </p>
        </div>
      </div>
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer or email…"
            className="min-w-[220px] flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | OrderStatus)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none"
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <OrderTable orders={filtered.slice(0, visible)} onOpen={(id) => onSelectOrder(id)} />
        {filtered.length > visible && (
          <button
            className="mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-semibold hover:bg-gray-50"
            onClick={() => setVisible(visible + 6)}
          >
            Show more ({filtered.length - visible} remaining)
          </button>
        )}
        {selectedOrder && (
          <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Viewing <strong>{selectedOrder.id}</strong> in the side panel →
            {!canChange && ' Status changes need the Manage orders permission.'}
          </p>
        )}
      </Card>
      {!canChange && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          🔒 Order status changes are hidden for your account. Ask a Super Admin to grant the “Manage orders” permission.
        </p>
      )}
      <span className="hidden" style={{ color: brand }} />
    </div>
  );
}

function OrderDrawer({
  order,
  brand,
  canChange,
  onChangeStatus,
  onClose,
  readOnly,
}: {
  order: ShopDashboardData['orders'][number];
  brand: string;
  canChange: boolean;
  onChangeStatus: (id: string, s: OrderStatus) => void;
  onClose: () => void;
  readOnly: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <aside className="nice-scroll absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-bold">{order.id}</h3>
            <p className="text-sm text-gray-500">{order.date} · {order.channel} · {order.payment}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-2.5 py-1.5" aria-label="Close order details">✕</button>
        </div>
        <div className="mt-5 space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.name}</span>
                <span className="text-xs text-gray-400">Qty {item.qty} × {formatPrice(item.price)}</span>
              </span>
              <span className="text-sm font-semibold">{formatPrice(item.qty * item.price)}</span>
            </div>
          ))}
        </div>
        <dl className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Customer</dt><dd className="font-medium">{order.customer}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-medium">{order.email}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Total</dt><dd className="font-bold">{formatPrice(order.total)}</dd></div>
        </dl>
        <div className="mt-5">
          <label className="text-sm font-medium" htmlFor="order-status">Order status</label>
          <select
            id="order-status"
            value={order.status}
            disabled={!canChange}
            onChange={(e) => onChangeStatus(order.id, e.target.value as OrderStatus)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {!canChange && (
            <p className="mt-2 text-xs text-gray-500">
              Requires the “Manage orders” permission{readOnly ? ' — your role is read-only' : ''}.
            </p>
          )}
        </div>
        <button className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-white" style={{ background: brand }} onClick={onClose}>
          Done
        </button>
      </aside>
    </div>
  );
}

function ProductsSection({
  products,
  inventory,
  brand,
  canEdit,
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  editingId,
  setEditingId,
  editPrice,
  setEditPrice,
  editStock,
  setEditStock,
  onSave,
  readOnly,
}: {
  products: ShopDashboardData['inventory'][number]['product'][];
  inventory: ShopDashboardData['inventory'];
  brand: string;
  canEdit: boolean;
  search: string;
  setSearch: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  sort: 'name' | 'price-desc' | 'price-asc' | 'stock-asc';
  setSort: (v: 'name' | 'price-desc' | 'price-asc' | 'stock-asc') => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editPrice: string;
  setEditPrice: (v: string) => void;
  editStock: string;
  setEditStock: (v: string) => void;
  onSave: (id: string, price: number, stock: number) => void;
  readOnly: boolean;
}) {
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const stockOf = (id: string) => inventory.find((r) => r.product.id === id)?.stock ?? 0;
  const rows = products
    .filter((p) => {
      const q = search.trim().toLowerCase();
      return (!q || p.name.toLowerCase().includes(q)) && (category === 'All' || p.category === category);
    })
    .sort((a, b) => {
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'stock-asc') return stockOf(a.id) - stockOf(b.id);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-bold">Products</h2>
        <p className="text-sm text-gray-500">
          {rows.length} product{rows.length === 1 ? '' : 's'}
          {!canEdit && ' · Editing is disabled for your role' + (readOnly ? ' (read-only)' : '') + ' — requires the Manage products permission.'}
        </p>
      </div>
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="min-w-[200px] flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none" aria-label="Filter by category">
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none" aria-label="Sort products">
            <option value="name">Name A–Z</option>
            <option value="price-desc">Price: high → low</option>
            <option value="price-asc">Price: low → high</option>
            <option value="stock-asc">Stock: low first</option>
          </select>
        </div>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">No products match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                  <th className="pb-2 pr-3 font-semibold">Product</th>
                  <th className="pb-2 pr-3 font-semibold">Category</th>
                  <th className="pb-2 pr-3 font-semibold">Price</th>
                  <th className="pb-2 pr-3 font-semibold">Stock</th>
                  <th className="pb-2 pr-3 font-semibold">Rating</th>
                  <th className="pb-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const stock = stockOf(p.id);
                  const reorder = inventory.find((r) => r.product.id === p.id)?.reorderPoint ?? 0;
                  const editing = editingId === p.id;
                  return (
                    <tr key={p.id} className="border-b border-gray-50 align-middle last:border-0 hover:bg-gray-50">
                      <td className="py-2.5 pr-3">
                        <span className="flex items-center gap-3">
                          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <Image src={p.image} alt={p.name} fill sizes="44px" className="object-cover" />
                          </span>
                          <span className="font-medium">{p.name}</span>
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-gray-500">{p.category}</td>
                      <td className="py-2.5 pr-3">
                        {editing ? (
                          <input
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            inputMode="decimal"
                            className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none"
                            aria-label="Edit price"
                          />
                        ) : (
                          <span className="font-semibold">{formatPrice(p.price)}</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        {editing ? (
                          <input
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            inputMode="numeric"
                            className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none"
                            aria-label="Edit stock"
                          />
                        ) : (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stock <= reorder ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {stock} {stock <= reorder ? '· Low' : '· In stock'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">★ {p.rating.toFixed(1)} <span className="text-gray-400">({p.reviews})</span></td>
                      <td className="py-2.5">
                        {editing ? (
                          <span className="flex gap-2">
                            <button
                              className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                              style={{ background: brand }}
                              onClick={() => onSave(p.id, Math.max(0, parseFloat(editPrice) || p.price), Math.max(0, parseInt(editStock, 10) || 0))}
                            >
                              Save
                            </button>
                            <button className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold" onClick={() => setEditingId(null)}>
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            disabled={!canEdit}
                            title={canEdit ? 'Edit price and stock' : 'Requires the Manage products permission'}
                            className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => {
                              setEditingId(p.id);
                              setEditPrice(String(p.price));
                              setEditStock(String(stock));
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function CustomersSection({
  customers,
  orders,
  brand,
  search,
  setSearch,
  selected,
  onSelect,
  canView,
}: {
  customers: ShopDashboardData['customers'];
  orders: ShopDashboardData['orders'];
  brand: string;
  search: string;
  setSearch: (v: string) => void;
  selected: ShopDashboardData['customers'][number] | null;
  onSelect: (id: string | null) => void;
  canView: boolean;
}) {
  const rows = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
  });
  const segmentStyle: Record<string, string> = {
    VIP: 'bg-violet-100 text-violet-700',
    Regular: 'bg-sky-100 text-sky-700',
    New: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-bold">Customers</h2>
        <p className="text-sm text-gray-500">{rows.length} customer{rows.length === 1 ? '' : 's'} · Click a row for profile &amp; order history.</p>
      </div>
      <Card>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or city…"
          className="mb-4 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
        />
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">No customers match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                  <th className="pb-2 pr-3 font-semibold">Customer</th>
                  <th className="pb-2 pr-3 font-semibold">City</th>
                  <th className="pb-2 pr-3 font-semibold">Segment</th>
                  <th className="pb-2 pr-3 font-semibold">Orders</th>
                  <th className="pb-2 pr-3 font-semibold">Total spent</th>
                  <th className="pb-2 font-semibold">Last order</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50" onClick={() => onSelect(c.id)}>
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: brand }}>
                          {c.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                        </span>
                        <span>
                          <span className="block font-medium">{c.name}</span>
                          <span className="block text-xs text-gray-400">{c.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-gray-500">{c.city}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${segmentStyle[c.segment]}`}>{c.segment}</span>
                    </td>
                    <td className="py-2.5 pr-3">{c.orders}</td>
                    <td className="py-2.5 pr-3 font-semibold">{formatPrice(c.totalSpent)}</td>
                    <td className="py-2.5">{c.lastOrder}, 2026</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selected && <p className="mt-4 text-sm text-gray-500">Viewing <strong>{selected.name}</strong> in the side panel →</p>}
        {!canView && <p className="mt-4 text-sm text-amber-700">Note: customer profiles are visible in this demo; full management needs the Manage customers permission.</p>}
        <span className="hidden">{orders.length}</span>
      </Card>
    </div>
  );
}

function CustomerDrawer({
  customer,
  orders,
  brand,
  onClose,
}: {
  customer: ShopDashboardData['customers'][number];
  orders: ShopDashboardData['orders'];
  brand: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <aside className="nice-scroll absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: brand }}>
              {customer.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </span>
            <div>
              <h3 className="font-display text-2xl font-bold">{customer.name}</h3>
              <p className="text-sm text-gray-500">{customer.email} · {customer.city}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-2.5 py-1.5" aria-label="Close customer details">✕</button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[
            [formatPrice(customer.totalSpent), 'Total spent'],
            [String(customer.orders), 'Orders'],
            [customer.segment, 'Segment'],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-gray-50 py-3">
              <p className="font-display text-lg font-bold">{v}</p>
              <p className="text-[11px] uppercase tracking-wider text-gray-400">{l}</p>
            </div>
          ))}
        </div>
        <h4 className="mt-6 font-display text-lg font-bold">Order history (this shop)</h4>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No recent generated orders for this customer in the last 10 orders. Their lifetime total above includes earlier orders.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-3.5 py-2.5 text-sm">
                <span>
                  <span className="font-medium">{o.id}</span> <span className="text-gray-400">· {o.date}</span>
                </span>
                <span className="font-semibold">{formatPrice(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-gray-400">Customer since {customer.joined}. Demo profile — no real personal data.</p>
        <button className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-white" style={{ background: brand }} onClick={onClose}>
          Done
        </button>
      </aside>
    </div>
  );
}

function InventorySection({
  inventory,
  brand,
  canAdjust,
  onAdjust,
  readOnly,
}: {
  inventory: ShopDashboardData['inventory'];
  brand: string;
  canAdjust: boolean;
  onAdjust: (id: string, delta: number) => void;
  readOnly: boolean;
}) {
  const low = inventory.filter((r) => r.stock <= r.reorderPoint);
  const totalUnits = inventory.reduce((n, r) => n + r.stock, 0);
  const totalValue = inventory.reduce((n, r) => n + r.stock * r.cost, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-bold">Inventory</h2>
        <p className="text-sm text-gray-500">
          {totalUnits} units on hand · {formatPrice(totalValue)} at cost · {low.length} item{low.length === 1 ? '' : 's'} at/below reorder point
          {!canAdjust && ' · Stock adjustments are disabled for your role' + (readOnly ? ' (read-only)' : '') + '.'}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Units on hand', String(totalUnits)],
          ['Inventory value (cost)', formatPrice(totalValue)],
          ['Low-stock items', String(low.length)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{l}</p>
            <p className="mt-1 font-display text-3xl font-bold text-gray-900">{v}</p>
          </div>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-2 pr-3 font-semibold">Product</th>
                <th className="pb-2 pr-3 font-semibold">SKU</th>
                <th className="pb-2 pr-3 font-semibold">Stock</th>
                <th className="pb-2 pr-3 font-semibold">Reorder at</th>
                <th className="pb-2 pr-3 font-semibold">Cost</th>
                <th className="pb-2 pr-3 font-semibold">Supplier</th>
                <th className="pb-2 font-semibold">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((r) => {
                const isLow = r.stock <= r.reorderPoint;
                return (
                  <tr key={r.product.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-3">
                        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <Image src={r.product.image} alt={r.product.name} fill sizes="44px" className="object-cover" />
                        </span>
                        <span className="font-medium">{r.product.name}</span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-gray-500">{r.sku}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isLow ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'}`}>
                        {r.stock} units
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">{r.reorderPoint}</td>
                    <td className="py-2.5 pr-3">{formatPrice(r.cost)}</td>
                    <td className="py-2.5 pr-3 text-gray-500">{r.supplier}</td>
                    <td className="py-2.5">
                      <span className="flex gap-1.5">
                        <button
                          disabled={!canAdjust}
                          title={canAdjust ? 'Decrease stock by 1' : 'Requires the Manage inventory permission'}
                          className="h-8 w-8 rounded-full border border-gray-200 font-bold disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => onAdjust(r.product.id, -1)}
                        >
                          −
                        </button>
                        <button
                          disabled={!canAdjust}
                          title={canAdjust ? 'Increase stock by 1' : 'Requires the Manage inventory permission'}
                          className="h-8 w-8 rounded-full border border-gray-200 font-bold disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => onAdjust(r.product.id, 1)}
                        >
                          +
                        </button>
                        <button
                          disabled={!canAdjust}
                          title={canAdjust ? 'Restock by 10' : 'Requires the Manage inventory permission'}
                          className="rounded-full px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                          style={{ background: brand }}
                          onClick={() => onAdjust(r.product.id, 10)}
                        >
                          +10
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AnalyticsSection({
  base,
  brand,
  onExport,
  period,
  setPeriod,
}: {
  base: ShopDashboardData;
  brand: string;
  onExport: () => void;
  period: '7d' | '30d' | '12m';
  setPeriod: (p: '7d' | '30d' | '12m') => void;
}) {
  const data = period === '12m' ? base.months : period === '7d' ? base.days.slice(-7) : base.days;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-bold">Analytics</h2>
          <p className="text-sm text-gray-500">Revenue, orders, channels and weekly patterns for this shop.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 rounded-full bg-gray-100 p-1 text-sm">
            {(['7d', '30d', '12m'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-3 py-1.5 font-medium ${period === p ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}
              >
                {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '12 months'}
              </button>
            ))}
          </div>
          <button onClick={onExport} className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110" style={{ background: brand }}>
            ⬇ Export orders CSV
          </button>
        </div>
      </div>

      <Card title="Revenue vs orders" subtitle="Bars = revenue · Line = orders">
        <DualChart
          labels={data.map((d) => d.label)}
          bars={data.map((d) => d.revenue)}
          line={data.map((d) => d.orders)}
          barColor={brand}
          lineColor="#f59e0b"
        />
        <div className="mt-2 flex gap-5 text-sm text-gray-500">
          <span><span className="mr-1 inline-block h-3 w-3 rounded-sm" style={{ background: brand }} /> Revenue</span>
          <span><span className="mr-1 inline-block h-3 w-3 rounded-sm bg-amber-500" /> Orders</span>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Sales channels" subtitle="Where orders come from">
          <DonutChart segments={base.channelShare.map((c, i) => ({ label: c.channel, value: c.value, color: i === 0 ? brand : palette(i) }))} />
        </Card>
        <Card title="Orders by weekday" subtitle="Average daily orders per weekday">
          <BarChart labels={base.weekdayPattern.map((w) => w.day)} values={base.weekdayPattern.map((w) => w.orders)} color={brand} height={180} />
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Returning customers', base.kpis.returning.value, base.kpis.returning.delta],
          ['Conversion rate', base.kpis.conversion.value, base.kpis.conversion.delta],
          ['Avg. order value', base.kpis.aov.value, base.kpis.aov.delta],
        ].map(([label, value, delta]) => (
          <div key={label as string} className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-gray-900">{value}</p>
            <div className="mt-2">{deltaBadge(delta as number)}</div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        The CSV export downloads this shop&apos;s {base.orders.length} most recent generated orders with items, totals and statuses.
      </p>
    </div>
  );
}

function DiscountsSection({
  discounts,
  brand,
  canCreate,
  draft,
  setDraft,
  onCreate,
  readOnly,
}: {
  discounts: DiscountRow[];
  brand: string;
  canCreate: boolean;
  draft: { code: string; percent: number; minOrder: number; expires: string };
  setDraft: (d: { code: string; percent: number; minOrder: number; expires: string }) => void;
  onCreate: (d: DiscountRow) => void;
  readOnly: boolean;
}) {
  const [formError, setFormError] = useState('');
  const [justAdded, setJustAdded] = useState('');

  const create = () => {
    const code = draft.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (code.length < 4) {
      setFormError('Code needs at least 4 characters (letters and numbers).');
      return;
    }
    if (discounts.some((d) => d.code.toUpperCase() === code)) {
      setFormError(`“${code}” already exists for this shop.`);
      return;
    }
    if (draft.percent < 1 || draft.percent > 90) {
      setFormError('Discount must be between 1% and 90%.');
      return;
    }
    onCreate({ code, percent: draft.percent, usage: 0, usageLimit: 200, minOrder: Math.max(0, draft.minOrder), status: 'Active', expires: draft.expires || 'Dec 31, 2026' });
    setJustAdded(code);
    setFormError('');
    setDraft({ code: '', percent: 10, minOrder: 0, expires: 'Dec 31, 2026' });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-bold">Discounts</h2>
        <p className="text-sm text-gray-500">
          Promo codes for this shop · WELCOME10 (10%) works in every store.
          {!canCreate && ' · Creating discounts is disabled for your role' + (readOnly ? ' (read-only)' : '') + '.'}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Create a discount" subtitle="Added to this shop's list instantly (demo session only)" className="lg:col-span-1">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium" htmlFor="disc-code">Code</label>
              <input
                id="disc-code"
                value={draft.code}
                disabled={!canCreate}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                placeholder="e.g. SUMMER25"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm uppercase outline-none disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="disc-pct">Discount %</label>
              <input
                id="disc-pct"
                type="number"
                min={1}
                max={90}
                value={draft.percent}
                disabled={!canCreate}
                onChange={(e) => setDraft({ ...draft, percent: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="disc-min">Minimum order ($)</label>
              <input
                id="disc-min"
                type="number"
                min={0}
                value={draft.minOrder}
                disabled={!canCreate}
                onChange={(e) => setDraft({ ...draft, minOrder: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="disc-exp">Expires</label>
              <input
                id="disc-exp"
                value={draft.expires}
                disabled={!canCreate}
                onChange={(e) => setDraft({ ...draft, expires: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none disabled:bg-gray-50"
              />
            </div>
            {formError && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
            {justAdded && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">✓ “{justAdded}” is now live for this shop.</p>}
            <button
              disabled={!canCreate}
              onClick={create}
              title={canCreate ? 'Create discount' : 'Requires the Manage discounts permission'}
              className="w-full rounded-full py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: brand }}
            >
              Create discount
            </button>
            {!canCreate && <p className="text-xs text-gray-500">Requires the “Manage discounts” permission.</p>}
          </div>
        </Card>
        <Card title="Active codes" subtitle={`${discounts.length} codes`} className="lg:col-span-2">
          <div className="space-y-3">
            {discounts.map((d) => (
              <div key={d.code} className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3">
                <span className="rounded-lg px-3 py-1.5 font-mono text-sm font-bold" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                  {d.code}
                </span>
                <span className="text-sm font-semibold">{d.percent === 0 ? 'Free shipping' : `${d.percent}% off`}</span>
                <span className="text-xs text-gray-400">Min {formatPrice(d.minOrder)} · Expires {d.expires}</span>
                <span className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-gray-500">{d.usage}/{d.usageLimit} used</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${d.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : d.status === 'Scheduled' ? 'bg-sky-100 text-sky-700' : 'bg-gray-200 text-gray-500'}`}>
                    {d.status}
                  </span>
                </span>
                <span className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <span className="block h-full rounded-full" style={{ width: `${Math.min(100, (d.usage / Math.max(1, d.usageLimit)) * 100)}%`, background: brand }} />
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TeamSection({
  roles,
  setRoles,
  assignments,
  setAssignments,
  storedOverrides,
  setStoredOverrides,
  brand,
  isSuperAdmin,
  roleForm,
  setRoleForm,
  deleteRoleId,
  setDeleteRoleId,
  overrideUserId,
  setOverrideUserId,
  currentUserId,
}: {
  roles: RoleDef[];
  setRoles: (r: RoleDef[]) => void;
  assignments: Record<string, string>;
  setAssignments: (a: Record<string, string>) => void;
  storedOverrides: Record<string, UserOverrides>;
  setStoredOverrides: (o: Record<string, UserOverrides>) => void;
  brand: string;
  isSuperAdmin: boolean;
  roleForm: null | { mode: 'create' | 'edit'; role: RoleDef };
  setRoleForm: (f: null | { mode: 'create' | 'edit'; role: RoleDef }) => void;
  deleteRoleId: string | null;
  setDeleteRoleId: (id: string | null) => void;
  overrideUserId: string | null;
  setOverrideUserId: (id: string | null) => void;
  currentUserId: string;
}) {
  const memberCount = (roleId: string) => TEAM_MEMBERS.filter((u) => (assignments[u.id] ?? u.role) === roleId).length;

  const patchOverride = (userId: string, patch: Partial<UserOverrides>) => {
    const user = TEAM_MEMBERS.find((u) => u.id === userId);
    if (!user) return;
    const current = resolveOverrides(user, storedOverrides[userId]);
    setStoredOverrides({ ...storedOverrides, [userId]: { ...current, ...patch } });
  };

  const togglePermissionOverride = (userId: string, perm: PermissionId) => {
    const user = TEAM_MEMBERS.find((u) => u.id === userId);
    if (!user) return;
    const role = resolveRole(roles, assignments[userId] ?? user.role);
    const current = resolveOverrides(user, storedOverrides[userId]);
    const effective = effectivePermissionsFor(role, current);
    let grants = [...current.grants];
    let revokes = [...current.revokes];
    if (effective.has(perm)) {
      // Currently allowed: remove a grant, or add a revoke.
      if (grants.includes(perm)) grants = grants.filter((p) => p !== perm);
      else if (!revokes.includes(perm)) revokes = [...revokes, perm];
    } else {
      // Currently denied: remove a revoke, or add a grant.
      if (revokes.includes(perm)) revokes = revokes.filter((p) => p !== perm);
      else if (!grants.includes(perm)) grants = [...grants, perm];
    }
    patchOverride(userId, { grants, revokes });
  };

  const saveRoleForm = () => {
    if (!roleForm) return;
    const draft = { ...roleForm.role, label: roleForm.role.label.trim() || 'Untitled role' };
    if (draft.id === 'super_admin') {
      // The built-in Super Admin role can never lose permissions or shop access.
      draft.permissions = PERMISSIONS.map((p) => p.id);
      draft.scope = 'all';
      draft.shops = [];
    }
    if (roleForm.mode === 'create') {
      const baseId = draft.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-role';
      let id = baseId;
      let n = 2;
      while (roles.some((r) => r.id === id)) id = `${baseId}-${n++}`;
      setRoles([...roles, { ...draft, id, builtIn: false }]);
    } else {
      setRoles(roles.map((r) => (r.id === draft.id ? draft : r)));
    }
    setRoleForm(null);
  };

  const deleteRole = (roleId: string) => {
    const target = roles.find((r) => r.id === roleId);
    if (!target || target.builtIn) return;
    const fallback = roles.find((r) => r.id === 'viewer') ?? roles.find((r) => r.id !== roleId);
    setRoles(roles.filter((r) => r.id !== roleId));
    if (fallback) {
      const next = { ...assignments };
      TEAM_MEMBERS.forEach((u) => {
        if ((next[u.id] ?? u.role) === roleId) next[u.id] = fallback.id;
      });
      setAssignments(next);
    }
    setDeleteRoleId(null);
    if (roleForm?.role.id === roleId) setRoleForm(null);
  };

  const overrideUser = TEAM_MEMBERS.find((u) => u.id === overrideUserId) ?? null;
  const overrideRole = overrideUser ? resolveRole(roles, assignments[overrideUser.id] ?? overrideUser.role) : undefined;
  const overrideState = overrideUser ? resolveOverrides(overrideUser, storedOverrides[overrideUser.id]) : EMPTY_OVERRIDES;
  const overrideEffective = effectivePermissionsFor(overrideRole, overrideState);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-bold">Team &amp; Roles</h2>
          <p className="text-sm text-gray-500">
            Roles are editable data — create custom roles, assign them, and fine-tune permissions per user.
            {!isSuperAdmin && ' You can view this page read-only; only a Super Admin can change roles, assignments and overrides.'}
          </p>
        </div>
        {isSuperAdmin && (
          <button
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            style={{ background: brand }}
            onClick={() =>
              setRoleForm({
                mode: 'create',
                role: { id: '', label: '', description: '', permissions: ['view_overview', 'view_analytics'], scope: 'custom', shops: ['gadget'], builtIn: false, readOnly: false },
              })
            }
          >
            + Create role
          </button>
        )}
      </div>

      {/* Roles list */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {roles.map((r) => (
          <div key={r.id} className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-gray-900">{r.label}</h3>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {memberCount(r.id)} member{memberCount(r.id) === 1 ? '' : 's'}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{r.description}</p>
            <p className="mt-3 text-xs text-gray-400">
              {r.scope === 'all' ? 'All 11 shops' : `${r.shops.length} shop${r.shops.length === 1 ? '' : 's'}: ${r.shops.map((s) => getStore(s)?.name ?? s).join(', ')}`}
              {r.readOnly ? ' · Read-only' : ''} {r.builtIn ? ' · Built-in' : ' · Custom'}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.permissions.map((p) => (
                <span key={p} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                  {PERMISSIONS.find((x) => x.id === p)?.label}
                </span>
              ))}
              {r.permissions.length === 0 && <span className="text-xs text-gray-400">No permissions</span>}
            </div>
            {isSuperAdmin && (
              <div className="mt-4 flex gap-2">
                <button className="rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-semibold" onClick={() => setRoleForm({ mode: 'edit', role: { ...r } })}>
                  Edit role
                </button>
                {!r.builtIn && (
                  deleteRoleId === r.id ? (
                    <span className="flex gap-2">
                      <button className="rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white" onClick={() => deleteRole(r.id)}>
                        Confirm delete
                      </button>
                      <button className="rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-semibold" onClick={() => setDeleteRoleId(null)}>
                        Keep
                      </button>
                    </span>
                  ) : (
                    <button className="rounded-full border border-rose-200 px-3.5 py-1.5 text-xs font-semibold text-rose-600" onClick={() => setDeleteRoleId(r.id)}>
                      Delete
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Role create/edit form */}
      {roleForm && isSuperAdmin && (
        <Card title={roleForm.mode === 'create' ? 'Create role' : `Edit role — ${roleForm.role.label}`} subtitle="Permission and shop-scope changes apply immediately to everyone with this role.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium" htmlFor="role-name">Role name</label>
              <input
                id="role-name"
                value={roleForm.role.label}
                onChange={(e) => setRoleForm({ ...roleForm, role: { ...roleForm.role, label: e.target.value } })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none"
                placeholder="e.g. Regional Manager"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="role-desc">Description</label>
              <input
                id="role-desc"
                value={roleForm.role.description}
                onChange={(e) => setRoleForm({ ...roleForm, role: { ...roleForm.role, description: e.target.value } })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none"
                placeholder="What is this role for?"
              />
            </div>
          </div>
          <fieldset className="mt-5">
            <legend className="text-sm font-medium">Permissions {roleForm.role.id === 'super_admin' && '(locked: Super Admin always has every permission)'}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PERMISSIONS.map((p) => {
                const checked = roleForm.role.id === 'super_admin' ? true : roleForm.role.permissions.includes(p.id);
                return (
                  <label key={p.id} className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${checked ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-gray-200'}`}>
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={checked}
                      disabled={roleForm.role.id === 'super_admin'}
                      onChange={(e) => {
                        const next = e.target.checked ? [...roleForm.role.permissions, p.id] : roleForm.role.permissions.filter((x) => x !== p.id);
                        setRoleForm({ ...roleForm, role: { ...roleForm.role, permissions: next } });
                      }}
                    />
                    <span>
                      <span className="block font-medium">{p.label}</span>
                      <span className="block text-xs text-gray-500">{p.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <fieldset className="mt-5">
            <legend className="text-sm font-medium">Shop scope {roleForm.role.id === 'super_admin' && '(locked: all shops)'}</legend>
            <div className="mt-2 flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={roleForm.role.scope === 'all'}
                  disabled={roleForm.role.id === 'super_admin'}
                  onChange={() => setRoleForm({ ...roleForm, role: { ...roleForm.role, scope: 'all' } })}
                />
                All shops
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={roleForm.role.scope === 'custom'}
                  disabled={roleForm.role.id === 'super_admin'}
                  onChange={() => setRoleForm({ ...roleForm, role: { ...roleForm.role, scope: 'custom' } })}
                />
                Specific shops
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={roleForm.role.readOnly}
                  onChange={(e) => setRoleForm({ ...roleForm, role: { ...roleForm.role, readOnly: e.target.checked } })}
                />
                Read-only role (no mutations)
              </label>
            </div>
            {roleForm.role.scope === 'custom' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {STORES.map((s) => {
                  const on = roleForm.role.shops.includes(s.slug);
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => {
                        const next = on ? roleForm.role.shops.filter((x) => x !== s.slug) : [...roleForm.role.shops, s.slug];
                        setRoleForm({ ...roleForm, role: { ...roleForm.role, shops: next } });
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${on ? 'text-white' : 'border border-gray-200'}`}
                      style={on ? { background: brand } : undefined}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
          <div className="mt-5 flex gap-2">
            <button className="rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: brand }} onClick={saveRoleForm}>
              {roleForm.mode === 'create' ? 'Create role' : 'Save changes'}
            </button>
            <button className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold" onClick={() => setRoleForm(null)}>
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Members + assignments */}
      <Card title="Team members" subtitle="Assign roles and open per-user overrides. Assignments apply immediately.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-2 pr-3 font-semibold">Member</th>
                <th className="pb-2 pr-3 font-semibold">Role</th>
                <th className="pb-2 pr-3 font-semibold">Shops (effective)</th>
                <th className="pb-2 pr-3 font-semibold">Permissions</th>
                <th className="pb-2 font-semibold">Overrides</th>
              </tr>
            </thead>
            <tbody>
              {TEAM_MEMBERS.map((u) => {
                const rid = assignments[u.id] ?? u.role;
                const r = resolveRole(roles, rid);
                const ov = resolveOverrides(u, storedOverrides[u.id]);
                const eff = effectivePermissionsFor(r, ov);
                const scope = effectiveShopsFor(r, ov);
                const hasOverride = ov.grants.length > 0 || ov.revokes.length > 0 || ov.shops !== null;
                return (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">{u.initials}</span>
                        <span>
                          <span className="block font-medium">
                            {u.name} {u.id === currentUserId && <span className="text-xs text-gray-400">(you)</span>}
                          </span>
                          <span className="block text-xs text-gray-400">{u.email} · {u.jobTitle}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <select
                        value={rid}
                        disabled={!isSuperAdmin}
                        onChange={(e) => setAssignments({ ...assignments, [u.id]: e.target.value })}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none disabled:bg-gray-50"
                        aria-label={`Assign role to ${u.name}`}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 pr-3 text-gray-500">
                      {scope === 'all' ? 'All shops' : `${scope.length} shop${scope.length === 1 ? '' : 's'}`}
                      {ov.shops !== null && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">override</span>}
                    </td>
                    <td className="py-2.5 pr-3">{eff.size}/{PERMISSIONS.length}</td>
                    <td className="py-2.5">
                      <button
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                        disabled={!isSuperAdmin}
                        title={isSuperAdmin ? 'Edit per-user overrides' : 'Only a Super Admin can edit overrides'}
                        onClick={() => setOverrideUserId(overrideUserId === u.id ? null : u.id)}
                      >
                        {hasOverride ? 'Overrides ✓' : 'Overrides'} {overrideUserId === u.id ? '▴' : '▾'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Per-user override editor */}
      {overrideUser && isSuperAdmin && (
        <Card title={`Overrides — ${overrideUser.name}`} subtitle={`Role: ${overrideRole?.label ?? '—'}. Toggles add a grant (✓) or a revoke (✕) on top of the role. Shop override replaces the role's shop scope.`}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PERMISSIONS.map((p) => {
              const inRole = overrideRole?.permissions.includes(p.id) ?? false;
              const granted = overrideState.grants.includes(p.id);
              const revoked = overrideState.revokes.includes(p.id);
              const allowed = overrideEffective.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePermissionOverride(overrideUser.id, p.id)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm ${allowed ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'}`}
                >
                  <span>
                    <span className="block font-medium">{p.label}</span>
                    <span className="block text-xs text-gray-500">
                      {granted ? 'Granted by override' : revoked ? 'Revoked by override' : inRole ? 'From role' : 'Not granted'}
                    </span>
                  </span>
                  <span className={`text-base font-bold ${allowed ? 'text-emerald-600' : 'text-gray-300'}`}>{allowed ? '✓' : '—'}</span>
                </button>
              );
            })}
          </div>
          <fieldset className="mt-5">
            <legend className="text-sm font-medium">Shop access override</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { key: 'role', label: 'Use role scope' },
                { key: 'all', label: 'All shops' },
                { key: 'custom', label: 'Specific shops' },
              ].map((opt) => {
                const active =
                  (opt.key === 'role' && overrideState.shops === null) ||
                  (opt.key === 'all' && overrideState.shops === 'all') ||
                  (opt.key === 'custom' && Array.isArray(overrideState.shops));
                return (
                  <button
                    key={opt.key}
                    onClick={() =>
                      patchOverride(overrideUser.id, {
                        shops: opt.key === 'role' ? null : opt.key === 'all' ? 'all' : (overrideRole?.shops ?? ['gadget']),
                      })
                    }
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${active ? 'text-white' : 'border border-gray-200'}`}
                    style={active ? { background: brand } : undefined}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {Array.isArray(overrideState.shops) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {STORES.map((s) => {
                  const on = (overrideState.shops as string[]).includes(s.slug);
                  return (
                    <button
                      key={s.slug}
                      onClick={() => {
                        const list = overrideState.shops as string[];
                        patchOverride(overrideUser.id, { shops: on ? list.filter((x) => x !== s.slug) : [...list, s.slug] });
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${on ? 'text-white' : 'border border-gray-200'}`}
                      style={on ? { background: brand } : undefined}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
          <button
            className="mt-5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold"
            onClick={() => {
              const { [overrideUser.id]: _removed, ...rest } = storedOverrides;
              setStoredOverrides(rest);
            }}
          >
            Reset {overrideUser.name.split(' ')[0]}&apos;s overrides to shipped defaults
          </button>
        </Card>
      )}

      {/* Roles × permissions matrix (read-only reference) */}
      <Card title="Permission matrix" subtitle="What each role can do. Edit a role above to change its row.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 pr-3 text-xs uppercase tracking-wider text-gray-400">Role</th>
                {PERMISSIONS.map((p) => (
                  <th key={p.id} className="pb-2 pr-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400" title={p.description}>
                    {p.label.replace('Manage ', '').replace('View ', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 pr-3 font-medium">{r.label}</td>
                  {PERMISSIONS.map((p) => (
                    <td key={p.id} className="py-2.5 pr-2 text-center">
                      {r.permissions.includes(p.id) ? <span className="font-bold text-emerald-600">✓</span> : <span className="text-gray-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Changes apply to the demo session only (saved in this browser). The built-in Super Admin role cannot be deleted and always keeps every permission.
        </p>
      </Card>
    </div>
  );
}

function SettingsSection({
  store,
  brand,
  settings,
  setSettings,
  user,
  role,
  perms,
  shops,
}: {
  store: StoreEntry;
  brand: string;
  settings: SettingsState;
  setSettings: (s: SettingsState) => void;
  user: DemoUser;
  role: RoleDef | undefined;
  perms: Set<PermissionId>;
  shops: StoreEntry[];
}) {
  const data = getStoreData(store.slug);
  const toggles: { key: keyof SettingsState; label: string; text: string }[] = [
    { key: 'notifications', label: 'Notifications', text: 'Show order, review and low-stock alerts in the topbar bell.' },
    { key: 'lowStockAlerts', label: 'Low-stock alerts', text: 'Surface low-stock items on the Overview and in notifications.' },
    { key: 'weeklyDigest', label: 'Weekly digest email', text: 'Email a weekly summary of this shop (demo toggle — nothing is sent).' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Settings</h2>
        <p className="text-sm text-gray-500">Shop profile, theme preview and your preferences. No destructive actions live here.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Shop profile" subtitle={`${store.name} · ${store.tagline}`}>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Description</dt><dd className="max-w-[60%] text-right">{store.description}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Categories</dt><dd>{store.categories.join(' · ')}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Products</dt><dd>{data?.products.length ?? 0}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Currency</dt><dd>USD ($)</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Free shipping over</dt><dd>{formatPrice(data?.freeShippingThreshold ?? 0)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Flat shipping</dt><dd>{formatPrice(data?.flatShipping ?? 0)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Shared promo</dt><dd className="font-mono font-semibold">WELCOME10 · 10% off</dd></div>
          </dl>
          <div className="mt-5">
            <p className="text-sm font-medium">Theme preview (this shop&apos;s tokens)</p>
            <div className="mt-2 flex gap-3">
              {[
                ['Brand', store.theme.brand],
                ['Soft', store.theme.brandSoft],
                ['Surface', store.theme.surface],
                ['Ink', store.theme.ink],
                ['Line', store.theme.line],
              ].map(([label, color]) => (
                <div key={label} className="text-center">
                  <span className="block h-10 w-10 rounded-full border border-gray-200 shadow-inner" style={{ background: color }} />
                  <span className="mt-1 block text-[11px] text-gray-500">{label}</span>
                  <span className="block font-mono text-[10px] text-gray-400">{color}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">Corner radius: {store.theme.radius} · Switch shops from the sidebar or topbar to see the whole dashboard re-theme.</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Preferences" subtitle="Saved in this browser (demo session only)">
            <div className="space-y-4">
              {toggles.map((t) => (
                <label key={t.key} className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={settings[t.key]}
                    onChange={(e) => setSettings({ ...settings, [t.key]: e.target.checked })}
                  />
                  <span>
                    <span className="block text-sm font-medium">{t.label}</span>
                    <span className="block text-sm text-gray-500">{t.text}</span>
                  </span>
                </label>
              ))}
            </div>
          </Card>
          <Card title="Your access" subtitle="Signed in as">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: brand }}>
                {user.initials}
              </span>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email} · {user.jobTitle}</p>
              </div>
            </div>
            <p className="mt-3 text-sm">
              Role: <strong>{role?.label ?? '—'}</strong> {role?.readOnly ? '(read-only)' : ''} · Shops: <strong>{shops.length}</strong>
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PERMISSIONS.map((p) => (
                <span
                  key={p.id}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${perms.has(p.id) ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                  style={perms.has(p.id) ? { background: brand } : undefined}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <p className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
        Demo note: settings, roles, overrides and stock/price edits are stored only in this browser (localStorage). Clearing site data restores the shipped defaults.
      </p>
    </div>
  );
}
