"use client";

import { useId, useMemo, useRef, useState } from "react";
import { ago, direction, pct, price as fmtPrice, signedMoney, spokenChange } from "@/lib/format";
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

/** Movement never relies on color: arrow + sign + value (+ period). */
export function PriceChange({ pctValue, abs, period, className = "" }: { pctValue: number; abs?: number; period?: string; className?: string }) {
  const d = direction(pctValue);
  const arrow = d === "up" ? "▲" : d === "down" ? "▼" : "■";
  return (
    <span className={`chg ${d} num ${className}`}>
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

export function UpdatedAt({ ts, now, stale }: { ts: number; now: number; stale: boolean }) {
  return (
    <span className="label" style={{ display: "inline-flex", gap: 6, alignItems: "center", color: stale ? "var(--warn)" : undefined }}>
      {stale ? `Price last updated ${ago(ts, now)}` : `Updated ${ago(ts, now)}`}
    </span>
  );
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
        <line x1="0" x2={w} y1={pt(0).y} y2={pt(0).y} stroke="var(--line-strong)" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {i !== null && (
          <>
            <line x1={pt(i).x} x2={pt(i).x} y1="0" y2={height} stroke="var(--ink-3)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={pt(i).x} cy={pt(i).y} r="4" fill="var(--paper)" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
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
