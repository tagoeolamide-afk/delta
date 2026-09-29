"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ASSETS, byId } from "./data";
import { PRODUCT } from "./config";
import type { Asset, AssetType, Holding, Order, OrderStatus, TradeSide } from "./types";
import { track } from "./analytics";

// ---------- State lab (prototype-only forcing of PRD states) ----------
export interface Lab {
  offline: boolean;
  /** When the connection dropped — prices are "as of" this moment while offline. */
  offlineSince?: number;
  stale: boolean;
  slowLoad: boolean;
  chartFail: boolean;
  searchFail: boolean;
  trendingFail: boolean;
  unavailable: string[]; // asset ids with trading paused
  noPrice: string[]; // asset ids with no current price
  outcome: OrderStatus; // what the next order resolves to
  reviewMove: number; // % the price moves while on Review (0 = none)
}

const LAB_DEFAULT: Lab = {
  offline: false, stale: false, slowLoad: false, chartFail: false, searchFail: false, trendingFail: false,
  unavailable: [], noPrice: [], outcome: "completed", reviewMove: 0,
};

export interface Draft {
  assetId: string;
  side: TradeSide;
  amount: string; // as typed
  unit: "usd" | "asset";
  /** Price the user saw when opening Review (for movement detection). */
  reviewPrice?: number;
}

export interface Toast { id: number; text: string; action?: { label: string; run: () => void } }

interface Persisted {
  cash: number;
  holdings: Holding[];
  watchlist: string[];
  orders: Order[];
  recent: string[];
  seenIntro: AssetType[];
  lab: Lab;
}

const SEED: Persisted = {
  cash: 2450.2,
  holdings: [
    { assetId: "doge", quantity: 14202.8, costBasis: 2104.55 },
    { assetId: "aapl", quantity: 12.5, costBasis: 2688.1 },
    { assetId: "bonk", quantity: 80_000_000, costBasis: 1402.0 },
    { assetId: "nvda", quantity: 20, costBasis: 2911.4 },
  ],
  watchlist: ["pepe", "tsla", "glub"],
  orders: [
    { id: "ord_7Q2K", assetId: "nvda", side: "buy", usd: 500, quantity: 2.7338, price: 181.07, fee: 5, status: "completed", createdAt: Date.now() - 86400e3 * 2 },
    { id: "ord_5M1P", assetId: "doge", side: "buy", usd: 250, quantity: 1394.1, price: 0.1775, fee: 2.5, status: "completed", createdAt: Date.now() - 86400e3 * 6 },
    { id: "ord_3X9B", assetId: "wif", side: "sell", usd: 118.2, quantity: 214.9, price: 0.5555, fee: 1.19, status: "completed", createdAt: Date.now() - 86400e3 * 9 },
  ],
  recent: ["doge", "aapl"],
  seenIntro: [],
  lab: LAB_DEFAULT,
};

const EMPTY: Persisted = { ...SEED, cash: 2450.2, holdings: [], orders: [], watchlist: [], recent: [] };

const KEY = "delta.v1";

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...SEED, ...JSON.parse(raw), lab: { ...LAB_DEFAULT, ...JSON.parse(raw).lab } };
  } catch { /* storage unavailable — fall back to seed */ }
  return SEED;
}

// ---------- quotes ----------
export interface Quote { price: number; change24h: number; updatedAt: number; available: boolean }

export function fee(usd: number) {
  return usd <= 0 ? 0 : Math.max(PRODUCT.minFee, +(usd * PRODUCT.feeRate).toFixed(2));
}

/** Pure trade math — shared by amount entry, review and result. */
export function computeTrade(draft: Draft, price: number) {
  const n = parseFloat(draft.amount) || 0;
  if (draft.side === "buy") {
    const pay = draft.unit === "usd" ? n : 0;
    if (draft.unit === "usd") {
      const f = fee(pay);
      return { usd: pay, fee: f, invested: Math.max(0, pay - f), quantity: Math.max(0, pay - f) / price };
    }
    // asset unit: user typed quantity; pay = qty*price + fee
    const gross = n * price;
    const f = fee(gross);
    return { usd: gross + f, fee: f, invested: gross, quantity: n };
  }
  const quantity = draft.unit === "asset" ? n : n / price;
  const gross = quantity * price;
  const f = fee(gross);
  return { usd: Math.max(0, gross - f), fee: f, invested: gross, quantity };
}

interface Store extends Persisted {
  ready: boolean;
  now: number;
  quote: (id: string) => Quote;
  asset: (id: string) => Asset | undefined;
  holding: (id: string) => Holding | undefined;
  isWatched: (id: string) => boolean;
  toggleWatch: (id: string) => void;
  addRecent: (id: string) => void;
  clearRecent: () => void;
  draft: Draft | null;
  setDraft: React.Dispatch<React.SetStateAction<Draft | null>>;
  placeOrder: (d: Draft, price: number) => Order;
  checkOrder: (id: string) => void;
  markIntroSeen: (t: AssetType) => void;
  setLab: (patch: Partial<Lab>) => void;
  resetDemo: (mode: "seed" | "empty") => void;
  toasts: Toast[];
  toast: (text: string, action?: Toast["action"]) => void;
  dismissToast: (id: number) => void;
  ui: Record<string, unknown>;
  setUi: (k: string, v: unknown) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(SEED);
  const [ready, setReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [drift, setDrift] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [ui, setUiState] = useState<Record<string, unknown>>({});
  const lastLive = useRef<number>(0);

  // hydrate from localStorage after mount (server render uses SEED, so this must be an effect)
  useEffect(() => {
    const p = load();
    lastLive.current = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from external storage
    setState(p);
    setHydrated(true);
    const t = setTimeout(() => setReady(true), p.lab.slowLoad ? 2600 : 450);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, hydrated]);

  // calm price ticks every 4s — no flashing, just quiet updates
  const { offline, stale } = state.lab;
  useEffect(() => {
    const iv = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (offline || stale) return;
      lastLive.current = t;
      setDrift((d) => {
        const next = { ...d };
        for (const a of ASSETS) {
          const step = (Math.random() - 0.5) * a.volatility * 0.08;
          next[a.id] = Math.max(-0.2, Math.min(0.2, (next[a.id] ?? 0) + step));
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(iv);
  }, [offline, stale]);

  const quote = useCallback((id: string): Quote => {
    const a = byId(id);
    if (!a || state.lab.noPrice.includes(id)) return { price: NaN, change24h: 0, updatedAt: 0, available: false };
    const f = Math.exp(drift[id] ?? 0);
    const p = a.price * f;
    const change = ((1 + a.change24h / 100) * f - 1) * 100;
    const updatedAt = state.lab.stale ? now - 2 * 60_000 - 4000 : state.lab.offline ? (state.lab.offlineSince ?? lastLive.current) : now;
    return { price: p, change24h: change, updatedAt, available: !state.lab.unavailable.includes(id) };
  }, [drift, now, state.lab]);

  const toast = useCallback((text: string, action?: Toast["action"]) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts.slice(-1), { id, text, action }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4000);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);

  const toggleWatch = useCallback((id: string) => {
    setState((s) => {
      const has = s.watchlist.includes(id);
      track(has ? "watchlist_removed" : "watchlist_added", { asset_id: id });
      return { ...s, watchlist: has ? s.watchlist.filter((x) => x !== id) : [id, ...s.watchlist] };
    });
  }, []);

  const resolveOrder = useCallback((order: Order, status: OrderStatus) => {
    setState((s) => {
      const orders = s.orders.map((o) => (o.id === order.id ? { ...o, status } : o));
      if (status !== "completed") {
        // pending/unknown: funds are reserved (buy) — reflected in cash below on placement
        if (status === "failed" && order.side === "buy") return { ...s, orders, cash: s.cash + order.usd };
        if (status === "failed" && order.side === "sell") {
          return { ...s, orders, holdings: addQty(s.holdings, order.assetId, order.quantity, order.usd + order.fee) };
        }
        return { ...s, orders };
      }
      if (order.side === "buy") return { ...s, orders, holdings: addQty(s.holdings, order.assetId, order.quantity, order.usd) };
      return { ...s, orders, cash: s.cash + order.usd };
    });
  }, []);

  const placeOrder = useCallback((d: Draft, price: number): Order => {
    const t = computeTrade(d, price);
    const order: Order = {
      id: "ord_" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      assetId: d.assetId, side: d.side, usd: +t.usd.toFixed(2), quantity: t.quantity, price, fee: t.fee,
      status: "pending", createdAt: Date.now(),
    };
    setState((s) => {
      // reserve funds / quantity immediately so the same money can't be spent twice
      if (d.side === "buy") return { ...s, cash: +(s.cash - order.usd).toFixed(2), orders: [order, ...s.orders] };
      return { ...s, holdings: addQty(s.holdings, d.assetId, -order.quantity, 0, true), orders: [order, ...s.orders] };
    });
    return order;
  }, []);

  /** Called by the result screen once "submitting" finishes. Applies the lab outcome. */
  const checkOrder = useCallback((id: string) => {
    const o = state.orders.find((x) => x.id === id);
    if (!o || o.status !== "pending") return;
    const outcome = state.lab.offline ? "unknown" : state.lab.outcome;
    if (outcome === "pending") return; // stays pending
    resolveOrder(o, outcome);
  }, [state.orders, state.lab, resolveOrder]);

  const value: Store = useMemo(() => ({
    ...state,
    ready,
    now,
    quote,
    asset: byId,
    holding: (id) => state.holdings.find((h) => h.assetId === id && h.quantity > 0),
    isWatched: (id) => state.watchlist.includes(id),
    toggleWatch,
    addRecent: (id) => setState((s) => ({ ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 5) })),
    clearRecent: () => setState((s) => ({ ...s, recent: [] })),
    draft,
    setDraft,
    placeOrder,
    checkOrder,
    markIntroSeen: (t) => setState((s) => ({ ...s, seenIntro: [...new Set([...s.seenIntro, t])] })),
    setLab: (patch) => setState((s) => ({
      ...s,
      lab: { ...s.lab, ...patch, ...(patch.offline === true && !s.lab.offline ? { offlineSince: Date.now() } : {}) },
    })),
    resetDemo: (mode) => setState((s) => ({ ...(mode === "seed" ? SEED : EMPTY), lab: s.lab })),
    toasts,
    toast,
    dismissToast,
    ui,
    setUi: (k, v) => setUiState((u) => ({ ...u, [k]: v })),
  }), [state, ready, now, quote, toggleWatch, draft, placeOrder, checkOrder, toasts, toast, dismissToast, ui]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function addQty(holdings: Holding[], assetId: string, q: number, cost: number, proportionalCost = false): Holding[] {
  const h = holdings.find((x) => x.assetId === assetId);
  if (!h) return q > 0 ? [...holdings, { assetId, quantity: q, costBasis: cost }] : holdings;
  const quantity = Math.max(0, h.quantity + q);
  const costBasis = proportionalCost && h.quantity > 0 ? h.costBasis * (quantity / h.quantity) : h.costBasis + cost;
  return holdings.map((x) => (x.assetId === assetId ? { ...x, quantity, costBasis } : x)).filter((x) => x.quantity > 1e-12);
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}

/** Portfolio totals. Assets without a price are excluded and counted. */
export function usePortfolio() {
  const s = useStore();
  const rows = s.holdings.map((h) => {
    const q = s.quote(h.assetId);
    return { holding: h, asset: s.asset(h.assetId)!, quote: q, value: isFinite(q.price) ? h.quantity * q.price : NaN };
  });
  let value = 0, cost = 0, dayStart = 0, excluded = 0;
  const byType = { meme: 0, stock: 0 };
  for (const r of rows) {
    if (!isFinite(r.value)) { excluded++; continue; }
    value += r.value; cost += r.holding.costBasis; dayStart += r.value / (1 + r.quote.change24h / 100);
    byType[r.asset.type] += r.value;
  }
  const total = value + s.cash;
  const dayChange = value - dayStart;
  // % is measured against everything the user had at the start of the day, cash included
  return { rows, value, total, cost, dayChange, dayPct: total - dayChange ? (dayChange / (total - dayChange)) * 100 : 0, totalReturn: value - cost, totalPct: cost ? ((value - cost) / cost) * 100 : 0, excluded, byType, cash: s.cash };
}
