'use client';

import { useId, useState } from 'react';

/**
 * Hand-rolled SVG charts (no new dependencies). All charts accept a `color`
 * so the dashboard can re-theme them from the active shop's brand color.
 */

const CHART_PALETTE = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export function palette(i: number): string {
  return CHART_PALETTE[i % CHART_PALETTE.length];
}

function niceMax(values: number[]): number {
  const max = Math.max(1, ...values);
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * pow;
}

function points(values: number[], w: number, h: number, pad: number, max: number): string {
  return values
    .map((v, i) => {
      const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
      const y = h - pad - (v / max) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

export function AreaChart({
  labels,
  values,
  color,
  height = 220,
  format = (v: number) => String(Math.round(v)),
}: {
  labels: string[];
  values: number[];
  color: string;
  height?: number;
  format?: (v: number) => string;
}) {
  const gid = useId();
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = height;
  const pad = 14;
  const max = niceMax(values);
  const pts = points(values, W, H, pad, max);
  const area = `${pad},${H - pad} ${pts} ${W - pad},${H - pad}`;
  const step = (W - pad * 2) / Math.max(values.length - 1, 1);
  const hoverX = hover !== null ? pad + hover * step : null;
  const hoverY = hover !== null ? H - pad - (values[hover] / max) * (H - pad * 2) : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Revenue chart"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          const idx = Math.round((x - pad) / step);
          setHover(Math.max(0, Math.min(values.length - 1, idx)));
        }}
      >
        <defs>
          <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad} x2={W - pad} y1={H - pad - f * (H - pad * 2)} y2={H - pad - f * (H - pad * 2)} stroke="#e5e7eb" strokeDasharray="4 4" />
        ))}
        <polygon points={area} fill={`url(#${gid}-fill)`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && hoverX !== null && hoverY !== null && (
          <g>
            <line x1={hoverX} x2={hoverX} y1={pad} y2={H - pad} stroke={color} strokeOpacity="0.4" />
            <circle cx={hoverX} cy={hoverY} r="5" fill={color} stroke="#fff" strokeWidth="2" />
          </g>
        )}
        {labels.map((l, i) =>
          i % Math.ceil(labels.length / 6) === 0 ? (
            <text key={l + i} x={pad + i * step} y={H - 2} fontSize="10" fill="#9ca3af" textAnchor="middle">
              {l}
            </text>
          ) : null,
        )}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-lg">
          {labels[hover]} · {format(values[hover])}
        </div>
      )}
    </div>
  );
}

export function BarChart({
  labels,
  values,
  color,
  height = 220,
  format = (v: number) => String(Math.round(v)),
}: {
  labels: string[];
  values: number[];
  color: string;
  height?: number;
  format?: (v: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = height;
  const pad = 14;
  const max = niceMax(values);
  const slot = (W - pad * 2) / values.length;
  const barW = Math.max(8, slot * 0.55);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Orders bar chart" onMouseLeave={() => setHover(null)}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad} x2={W - pad} y1={H - pad - f * (H - pad * 2)} y2={H - pad - f * (H - pad * 2)} stroke="#e5e7eb" strokeDasharray="4 4" />
        ))}
        {values.map((v, i) => {
          const bh = (v / max) * (H - pad * 2);
          const x = pad + i * slot + (slot - barW) / 2;
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              <rect x={x} y={H - pad - bh} width={barW} height={bh} rx={Math.min(6, barW / 2)} fill={hover === i ? color : color} fillOpacity={hover === i || hover === null ? 0.9 : 0.35} />
              {i % Math.ceil(labels.length / 8) === 0 && (
                <text x={x + barW / 2} y={H - 2} fontSize="10" fill="#9ca3af" textAnchor="middle">
                  {labels[i]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-lg">
          {labels[hover]} · {format(values[hover])}
        </div>
      )}
    </div>
  );
}

export function DualChart({
  labels,
  bars,
  line,
  barColor,
  lineColor,
  height = 240,
}: {
  labels: string[];
  bars: number[];
  line: number[];
  barColor: string;
  lineColor: string;
  height?: number;
}) {
  const W = 640;
  const H = height;
  const pad = 14;
  const maxBar = niceMax(bars);
  const maxLine = niceMax(line);
  const slot = (W - pad * 2) / bars.length;
  const barW = Math.max(8, slot * 0.5);
  const linePts = points(line, W, H, pad, maxLine);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Revenue versus orders chart">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad} x2={W - pad} y1={H - pad - f * (H - pad * 2)} y2={H - pad - f * (H - pad * 2)} stroke="#e5e7eb" strokeDasharray="4 4" />
      ))}
      {bars.map((v, i) => {
        const bh = (v / maxBar) * (H - pad * 2);
        return <rect key={i} x={pad + i * slot + (slot - barW) / 2} y={H - pad - bh} width={barW} height={bh} rx={5} fill={barColor} fillOpacity="0.75" />;
      })}
      <polyline points={linePts} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinejoin="round" />
      {labels.map((l, i) =>
        i % Math.ceil(labels.length / 6) === 0 ? (
          <text key={l + i} x={pad + i * slot + slot / 2} y={H - 2} fontSize="10" fill="#9ca3af" textAnchor="middle">
            {l}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export function DonutChart({
  segments,
  size = 180,
  thickness = 26,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}) {
  const total = Math.max(1, segments.reduce((n, s) => n + s.value, 0));
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  let acc = 0;
  const arcs = segments.map((s) => {
    const start = acc / total;
    acc += s.value;
    const end = acc / total;
    const large = end - start > 0.5 ? 1 : 0;
    const a0 = start * Math.PI * 2 - Math.PI / 2;
    const a1 = end * Math.PI * 2 - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    return { ...s, d: `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`, pct: (s.value / total) * 100 };
  });

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Share donut chart" className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
        {arcs.map((a) => (
          <path key={a.label} d={a.d} fill="none" stroke={a.color} strokeWidth={thickness} strokeLinecap="butt" />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="700" fill="#111827">
          {segments.length}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="#6b7280">
          segments
        </text>
      </svg>
      <ul className="min-w-[140px] flex-1 space-y-2">
        {arcs.map((a) => (
          <li key={a.label} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: a.color }} />
            <span className="flex-1 text-gray-600">{a.label}</span>
            <span className="font-semibold text-gray-900">{a.pct.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ values, color, width = 96, height = 32 }: { values: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const pts = values
    .map((v, i) => `${(i / Math.max(values.length - 1, 1)) * width},${height - 3 - ((v - min) / range) * (height - 6)}`)
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
