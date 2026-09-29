"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { computeTrade, useStore, type Draft } from "@/lib/store";
import { PRODUCT } from "@/lib/config";
import { money, qty } from "@/lib/format";
import { track } from "@/lib/analytics";
import { trade as t, common } from "@/content/copy";
import type { Asset, TradeSide } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { AssetLogo, TypeLabel } from "@/components/identity";
import { PriceText } from "@/components/market";
import { Banner, Sheet } from "@/components/feedback";
import { TopBar } from "@/components/chrome";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

export default function AmountPage() {
  const { id, side: rawSide } = useParams<{ id: string; side: string }>();
  const s = useStore();
  const a = s.asset(id);
  if (!a) return null;
  return <Amount asset={a} side={rawSide === "sell" ? "sell" : "buy"} />;
}

function Amount({ asset: a, side }: { asset: Asset; side: TradeSide }) {
  const id = a.id;
  const s = useStore();
  const router = useRouter();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const tracked = useRef(false);

  // initialise draft if we arrived directly
  useEffect(() => {
    if (!s.draft || s.draft.assetId !== id || s.draft.side !== side) {
      s.setDraft({ assetId: id, side, amount: "", unit: side === "buy" ? "usd" : "asset" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, side]);

  const draft: Draft = s.draft && s.draft.assetId === id && s.draft.side === side ? s.draft : { assetId: id, side, amount: "", unit: side === "buy" ? "usd" : "asset" };
  const q = s.quote(a.id);
  const price = q.price;
  const h = s.holding(a.id);
  const heldQty = h?.quantity ?? 0;
  const calc = computeTrade(draft, price);
  const n = parseFloat(draft.amount) || 0;

  const set = (amount: string) => s.setDraft({ ...draft, amount });
  /** Functional update so rapid taps/keystrokes never read a stale amount. */
  const press = (k: string) => s.setDraft((prev) => {
    const d = prev && prev.assetId === id && prev.side === side ? prev : draft;
    return { ...d, amount: nextAmount(d.amount, k, d.unit === "usd" ? 2 : 8) };
  });

  // physical keyboard support
  useKey((k) => { if (/^[0-9]$/.test(k) || k === ".") press(k); else if (k === "Backspace") press("⌫"); else if (k === "Enter" && valid) review(); });

  const toggleUnit = () => {
    if (!isFinite(price)) return;
    const nextUnit = draft.unit === "usd" ? "asset" : "usd";
    let amount = "";
    if (n > 0) {
      if (side === "buy") amount = nextUnit === "asset" ? trimNum(calc.quantity, 8) : trimNum(calc.usd, 2);
      else amount = nextUnit === "usd" ? trimNum(calc.quantity * price, 2) : trimNum(n / price, 8);
    }
    s.setDraft({ ...draft, unit: nextUnit, amount });
  };

  // ---- validation ----
  const offline = s.lab.offline;
  const tooSmall = n > 0 && (side === "buy" ? calc.usd : calc.invested) < PRODUCT.minOrderUsd;
  const insufficient = side === "buy" && calc.usd > s.cash + 1e-9;
  const oversell = side === "sell" && calc.quantity > heldQty + 1e-12;
  const unavailable = !q.available || !isFinite(price);
  const valid = n > 0 && !tooSmall && !insufficient && !oversell && !offline && !unavailable;

  useEffect(() => {
    if (valid && !tracked.current) { tracked.current = true; track("trade_amount_entered", { asset_id: a.id, side }); }
  }, [valid, a.id, side]);

  const preset = (v: number | "max") => {
    if (side === "buy") {
      const usd = v === "max" ? s.cash : v;
      s.setDraft({ ...draft, unit: "usd", amount: trimNum(usd, 2) });
    } else {
      const quantity = v === "max" ? heldQty : heldQty * (v as number);
      s.setDraft({ ...draft, unit: "asset", amount: trimNum(quantity, 8) });
    }
  };
  const isMaxSell = side === "sell" && heldQty > 0 && Math.abs(calc.quantity - heldQty) < 1e-9;

  function review() {
    if (!valid) return;
    s.setDraft({ ...draft, reviewPrice: price });
    router.push(`/trade/${a!.id}/${side}/review`);
  }
  const close = () => {
    if (n > 0) setLeaveOpen(true);
    else leave();
  };
  function leave() {
    track("trade_abandoned", { asset_id: a!.id, side, step: "amount" });
    s.setDraft(null);
    router.back();
  }

  const unitLabel = draft.unit === "usd" ? "USD" : a.symbol;
  const otherUnit = draft.unit === "usd" ? a.symbol : "USD";
  const display = groupDigits(draft.amount || "0");
  const conversion = draft.unit === "usd"
    ? `≈ ${qty(side === "buy" ? calc.quantity : n / price, a.symbol)}`
    : `≈ ${money(side === "buy" ? calc.usd : calc.invested)}`;

  const ctaLabel = offline ? t.offlineReview.split(".")[0]
    : n === 0 ? t.enterAmount
    : tooSmall ? t.minOrder(PRODUCT.minOrderUsd)
    : side === "buy" ? t.reviewBuy : t.reviewSell;

  return (
    <main id="content" className={`reg-${a.type}`} style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <TopBar back icon="close" backLabel={common.close} onBack={close} title={t.title(side, a.symbol)} />

      <div style={{ padding: "0 var(--gutter)", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Asset context */}
        <div className="between">
          {/* Crypto.com-style asset pill + Trust-style type chip */}
          <span className="hstack" style={{ gap: 8 }}>
            <span className="hstack chip solid" style={{ gap: 8, paddingLeft: 6 }}><AssetLogo asset={a} size={24} /><span style={{ fontWeight: 700 }}>{a.symbol}</span></span>
            <TypeLabel type={a.type} />
          </span>
          <span style={{ textAlign: "right" }}>
            <span className="label" style={{ display: "block" }}>Price</span>
            {isFinite(price) ? <PriceText value={price} className="small" /> : <span className="small muted">—</span>}
          </span>
        </div>
        <p className="small muted" style={{ marginTop: 6 }}>{a.name}</p>

        {/* Amount — the hero */}
        <div style={{ flex: 1, display: "grid", alignContent: "center", justifyItems: "center", gap: 10, padding: "20px 0", minHeight: 190 }}>
          <p
            className="display-1 num"
            aria-live="polite"
            aria-label={`Amount ${display} ${unitLabel}`}
            style={{ fontSize: display.length > 9 ? "2.6rem" : "3.5rem", color: n === 0 ? "var(--text-3)" : insufficient || oversell ? "var(--loss)" : "var(--accent-text)", textAlign: "center", wordBreak: "break-all" }}
          >
            {draft.unit === "usd" ? `$${display}` : <>{display}<span style={{ fontSize: "0.5em", marginLeft: 8 }}>{a.symbol}</span></>}
          </p>
          <button className="chip" onClick={toggleUnit} aria-label={t.toggle(otherUnit)} disabled={!isFinite(price)}>
            <Icon name="swap" size={16} />{conversion}
          </button>
        </div>

        {/* Messages — inline, amount stays visible */}
        <div style={{ minHeight: 56 }} aria-live="polite">
          {offline ? (
            <Banner tone="warn" icon="wifiOff">{t.offlineReview}</Banner>
          ) : insufficient ? (
            <Banner tone="error" role="alert">{t.insufficient(calc.usd - s.cash)}</Banner>
          ) : oversell ? (
            <Banner tone="error" role="alert">{t.oversell(heldQty, a.symbol)}</Banner>
          ) : isMaxSell ? (
            <Banner tone="info">{t.maxSellNote}</Banner>
          ) : (
            <p className="small muted" style={{ textAlign: "center", paddingTop: 8 }}>
              {side === "buy" ? t.availableCash(s.cash) : t.availableQty(heldQty, a.symbol)}
            </p>
          )}
        </div>

        {/* Presets */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, margin: "8px 0" }}>
          {(side === "buy" ? [...PRODUCT.buyPresets] : [...PRODUCT.sellPresets]).map((v) => (
            <button key={v} className="chip" style={{ justifyContent: "center" }} onClick={() => preset(v)}>
              {side === "buy" ? `$${v}` : `${v * 100}%`}
            </button>
          ))}
          <button className="chip" style={{ justifyContent: "center" }} onClick={() => preset("max")}>{t.max}</button>
        </div>

        {/* Keypad */}
        <div className="keypad" role="group" aria-label="Amount keypad">
          {KEYS.map((k) => (
            <button key={k} className="key" onClick={() => press(k)} aria-label={k === "⌫" ? "Delete" : k === "." ? "Decimal point" : k}>
              {k === "⌫" ? <Icon name="backspace" /> : k}
            </button>
          ))}
        </div>

        {/* CTA — thumb zone */}
        <div style={{ padding: "12px 0 calc(16px + env(safe-area-inset-bottom))" }}>
          {insufficient && !offline ? (
            <div className="dock-row">
              <button className="btn btn-secondary" onClick={() => set("")}>{t.editAmount}</button>
              <button className="btn btn-primary" onClick={() => s.toast("Add funds isn't part of this prototype")}>{t.addFunds}</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-block" disabled={!valid} onClick={review}>{ctaLabel}</button>
          )}
        </div>
      </div>

      <Sheet open={leaveOpen} onClose={() => setLeaveOpen(false)} title={t.leaveTitle}
        footer={<div className="dock-row">
          <button className="btn btn-secondary" onClick={leave}>{t.leave}</button>
          <button className="btn btn-primary" onClick={() => setLeaveOpen(false)}>{t.keepEditing}</button>
        </div>}>
        <p className="muted">{t.leaveBody}</p>
      </Sheet>
    </main>
  );
}

/** "10000.5" → "10,000.5" — keeps a trailing "." while the user is typing. */
function groupDigits(v: string): string {
  const [int, dec] = v.split(".");
  const grouped = (int || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec === undefined ? grouped : `${grouped}.${dec}`;
}

function nextAmount(v: string, k: string, maxDecimals: number): string {
  if (k === "⌫") return v.slice(0, -1);
  if (k === ".") return v.includes(".") ? v : (v || "0") + ".";
  if (v === "0") v = "";
  const [, dec] = v.split(".");
  if (dec !== undefined && dec.length >= maxDecimals) return v;
  if (v.replace(".", "").length >= 12) return v;
  return v + k;
}

function trimNum(n: number, d: number) {
  return (Math.floor(n * 10 ** d) / 10 ** d).toFixed(d).replace(/\.?0+$/, "");
}

function useKey(fn: (k: string) => void) {
  const onKey = useEffectEvent(fn);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement)?.closest?.("[role=dialog]")) return;
      onKey(e.key);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
}
