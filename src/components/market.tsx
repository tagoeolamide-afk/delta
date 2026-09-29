"use client";

import { useId, useMemo, useRef, useState } from "react";
import { ago, direction, money as fmtMoney, pct, price as fmtPrice, signedMoney, spokenChange } from "@/lib/format";
import type { Range } from "@/lib/types";
import { RANGES } from "@/lib/data";

export function PriceText({ value, className = "" }: { value: number; className?: string }) {
  const p = fmtPrice(value);
  return (
    <span className={`num ${className}`} title={p.full}>
      <span aria-hidden>{p.text}</span>
      <span className="sr-only">{p.full}</span>
    </span>
  );
}

/**
 * Crypto.com number system: small leading "$", big integer, dimmed decimals,
 * small trailing unit. Decimals are only dimmed for values ≥ 1 — sub-cent
 * prices keep full contrast because every digit matters there.
 */
export function Money({ value, unit, kind = "money", className = "" }: { value: number; unit?: string; kind?: "money" | "price"; className?: string }) {
  const p = kind === "price" ? fmtPrice(value) : { text: fmtMoney(value), full: fmtMoney(value) };
  const body = p.text.replace(/^\$/, "");
  const dot = value >= 1 ? body.lastIndexOf(".") : -1;
  return (
    <span className={`money ${className}`} title={p.full}>
      <span aria-hidden className="sym">$</span>
      <span aria-hidden>{dot > -1 ? body.slice(0, dot) : body}</span>
      {dot > -1 && <span aria-hidden className="dec">{body.slice(dot)}</span>}
      {unit && <span aria-hidden className="unit">{unit}</span>}
      <span className="sr-only">{p.full}{unit ? ` ${unit}` : ""}</span>
    </span>
  );
}

/** Movement never relies on color: arrow + sign + value (+ period). `pill` = tinted Crypto.com-style chip. */
export function PriceChange({ pctValue, abs, period, pill = false, className = "" }: { pctValue: number; abs?: number; period?: string; pill?: boolean; className?: string }) {
  const d = direction(pctValue);
  const arrow = d === "up" ? "▲" : d === "down" ? "▼" : "■";
  return (
    <span className={`chg ${d} num ${pill ? "pill" : ""} ${className}`}>
      <span className="arrow" aria-hidden>{arrow}</span>
      <span aria-hidden>
        {abs !== undefined ? `${signedMoney(abs)} (${pct(pctValue)})` : pct(pctValue)}
      </span>
      {period && <span className="period" aria-hidden>{period}</span>}
      <span className="sr-only">
        {spokenChange(pctValue)}{abs !== undefined ? `, ${signedMoney(abs).replace("−", "minus ")}` : ""}{period ? ` ${period}` : ""}
      </span>
    </span>
  );
}

/** "● LIVE" while fresh; amber "Price last updated 2 min ago" when stale (PRD §19). */
export function UpdatedAt({ ts, now, stale }: { ts: number; now: number; stale: boolean }) {
  return stale
    ? <span className="live stale">Price last updated {ago(ts, now)}</span>
    : <span className="live" title={`Updated ${ago(ts, now)}`}>LIVE</span>;
}

function path(values: number[], w: number, h: number, pad = 4) {
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join("");
}

export function MiniChart({ values, up }: { values: number[]; up: boolean }) {
  return (
    <svg className="spark" width="56" height="24" viewBox="0 0 56 24" aria-hidden style={{ color: up ? "var(--gain)" : "var(--loss)" }}>
      <path d={path(values, 56, 24, 3)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Interactive line chart. Scrub with pointer or ←/→ keys. Always accompanied by
 * a text summary (PRD §21 "Charts cannot be visual-only").
 */
export function FullChart({ values, summary, onScrub, height = 180 }: { values: number[]; summary: string; onScrub?: (i: number | null) => void; height?: number }) {
  const w = 400;
  const [i, setI] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const id = useId();
  const d = useMemo(() => path(values, w, height, 10), [values, height]);
  const up = values[values.length - 1] >= values[0];
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pt = (k: number) => ({ x: (k / (values.length - 1)) * w, y: 10 + (1 - (values[k] - min) / span) * (height - 20) });

  const set = (k: number | null) => { setI(k); onScrub?.(k); };
  const fromEvent = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    const k = Math.round(((clientX - r.left) / r.width) * (values.length - 1));
    set(Math.max(0, Math.min(values.length - 1, k)));
  };

  return (
    <figure style={{ margin: 0 }}>
      <svg
        ref={ref} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" width="100%" height={height}
        role="img" aria-labelledby={id} tabIndex={0}
        style={{ display: "block", touchAction: "pan-y", color: up ? "var(--gain)" : "var(--loss)", overflow: "visible" }}
        onPointerMove={(e) => fromEvent(e.clientX)}
        onPointerDown={(e) => fromEvent(e.clientX)}
        onPointerLeave={() => set(null)}
        onPointerCancel={() => set(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") set(Math.max(0, (i ?? values.length - 1) - 1));
          else if (e.key === "ArrowRight") set(Math.min(values.length - 1, (i ?? values.length - 2) + 1));
          else if (e.key === "Escape") set(null);
        }}
        onBlur={() => set(null)}
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" x2={w} y1={pt(0).y} y2={pt(0).y} stroke="var(--line-2)" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
        <path d={`${d}L${w},${height}L0,${height}Z`} fill={`url(#${id}-fill)`} stroke="none" />
        <path d={d} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {i !== null && (
          <>
            <line x1={pt(i).x} x2={pt(i).x} y1="0" y2={height} stroke="var(--text-3)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={pt(i).x} cy={pt(i).y} r="4" fill="var(--bg)" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      <figcaption id={id} className="sr-only">{summary}</figcaption>
    </figure>
  );
}

export function RangeSelector({ value, onChange, label = "Chart period" }: { value: Range; onChange: (r: Range) => void; label?: string }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {RANGES.map((r) => (
        <button key={r} type="button" aria-pressed={r === value} onClick={() => onChange(r)}>{r}</button>
      ))}
    </div>
  );
}
