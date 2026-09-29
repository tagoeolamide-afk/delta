"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { PRODUCT } from "@/lib/config";
import { money, price as fmtPrice, qty } from "@/lib/format";
import { track } from "@/lib/analytics";
import { result as r } from "@/content/copy";
import type { OrderStatus } from "@/lib/types";
import { Icon, type IconName } from "@/components/Icon";
import { AssetLogo, TypeLabel } from "@/components/identity";

type Phase = "submitting" | "checking" | "settled";

const STATUS_STYLE: Record<OrderStatus, { icon: IconName; bg: string; fg: string }> = {
  completed: { icon: "check", bg: "var(--gain-tint)", fg: "var(--gain)" },
  pending: { icon: "clock", bg: "var(--accent-tint)", fg: "var(--accent)" },
  unknown: { icon: "clock", bg: "var(--warn-tint)", fg: "var(--warn)" },
  failed: { icon: "alert", bg: "var(--error-tint)", fg: "var(--loss)" },
};

export default function OrderResultPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const s = useStore();
  const router = useRouter();
  const order = s.orders.find((o) => o.id === orderId);
  const [phase, setPhase] = useState<Phase>(order?.status === "pending" && s.now - order.createdAt < 5000 ? "submitting" : "settled");
  const seen = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  // The trade is handed off: drop the draft so a fresh Buy starts empty.
  useEffect(() => { s.setDraft(null); }, [s.setDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  // Submitting → resolve. If connectivity drops, never assume failure: go to "checking".
  useEffect(() => {
    if (phase !== "submitting") return;
    const t1 = setTimeout(() => {
      if (s.lab.offline) { setPhase("checking"); return; }
      s.checkOrder(orderId);
      setPhase("settled");
    }, 1100);
    return () => clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  useEffect(() => {
    if (phase !== "checking") return;
    const t = setTimeout(() => { s.checkOrder(orderId); setPhase("settled"); }, PRODUCT.submitTimeoutMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const status: OrderStatus | undefined = order ? (phase === "settled" && s.lab.offline && order.status === "pending" ? "unknown" : order.status) : undefined;

  useEffect(() => {
    if (phase !== "settled" || !status || seen.current === status) return;
    seen.current = status;
    heading.current?.focus();
    if (status === "completed") { track("trade_success_seen", { side: order!.side }); navigator.vibrate?.(12); }
    else if (status === "failed") track("trade_failure_seen", { side: order!.side });
    else track("trade_pending_seen", { side: order!.side, status });
  }, [phase, status, order]);

  if (!order) {
    return <main id="content" className="screen no-tabs" style={{ paddingTop: 80 }}><p className="h-section">We couldn&apos;t find this order.</p>
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => router.replace("/activity")}>{r.viewActivity}</button></main>;
  }
  const a = s.asset(order.assetId)!;
  const buy = order.side === "buy";

  if (phase !== "settled") {
    return (
      <main id="content" style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "0 var(--gutter)" }} aria-busy="true">
        <div role="status" style={{ display: "grid", justifyItems: "center", gap: 14, textAlign: "center" }}>
          <span className="sk" style={{ width: 56, height: 56, borderRadius: 28 }} aria-hidden />
          <p className="h-section">{phase === "submitting" ? r.submitting : r.checking}</p>
          <p className="small muted">{r.submittingHelp}</p>
        </div>
      </main>
    );
  }

  const st = STATUS_STYLE[status!];
  const title = status === "completed" ? (buy ? r.completedBuy : r.completedSell)
    : status === "pending" ? r.pending : status === "unknown" ? r.unknown : r.failed;
  const body = status === "pending" ? r.pendingBody : status === "unknown" ? r.unknownBody : status === "failed" ? r.failedBody : null;
  const done = () => router.replace(`/asset/${a.id}`);

  return (
    <main id="content" className={`reg-${a.type}`} style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", padding: "0 var(--gutter)" }}>
      <div style={{ flex: 1, paddingTop: 72 }} className="fade-in">
        <span className="hstack small" style={{ display: "inline-flex", gap: 6, padding: "6px 12px 6px 8px", borderRadius: 999, background: st.bg, color: st.fg, fontWeight: 600 }}>
          <Icon name={st.icon} size={16} />{r.statusChip[status!]}
        </span>
        <h1 ref={heading} tabIndex={-1} className="display-2" style={{ marginTop: 18, outline: "none" }}>{title}</h1>
        {body && <p className="muted" style={{ marginTop: 10, maxWidth: "34ch" }}>{body}</p>}

        <div className="card" style={{ marginTop: 28 }}>
          <div className="hstack" style={{ gap: 10 }}>
            <AssetLogo asset={a} size={32} />
            <div><p className="small" style={{ fontWeight: 600 }}>{a.name} <span className="num muted">{a.symbol}</span></p><TypeLabel type={a.type} /></div>
          </div>
          <dl style={{ marginTop: 8 }}>
            <div className="kv"><dt>{buy ? "You paid" : "You sold"}</dt><dd className="num">{buy ? money(order.usd) : qty(order.quantity, a.symbol)}</dd></div>
            <div className="kv"><dt>{status === "completed" ? "You received" : "Expected"}</dt><dd className="num">{status === "completed" ? "" : "≈ "}{buy ? qty(order.quantity, a.symbol) : money(order.usd)}</dd></div>
            <div className="kv"><dt>Price</dt><dd className="num">{fmtPrice(order.price).text}</dd></div>
            <div className="kv"><dt>Delta fee</dt><dd className="num">{money(order.fee)}</dd></div>
            <div className="kv"><dt>Order ID</dt><dd className="num" style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>{order.id}</dd></div>
          </dl>
        </div>
      </div>

      <div className="dock-row" style={{ padding: "16px 0 calc(20px + env(safe-area-inset-bottom))" }}>
        {status === "completed" && <>
          <button className="btn btn-secondary" onClick={() => router.replace(`/position/${a.id}`)}>{r.viewPosition}</button>
          <button className="btn btn-primary" onClick={done}>{r.done}</button>
        </>}
        {(status === "pending" || status === "unknown") && <>
          <button className="btn btn-secondary" onClick={() => router.replace(`/activity/${order.id}`)}>{r.viewActivity}</button>
          <button className="btn btn-primary" onClick={done}>{r.done}</button>
        </>}
        {status === "failed" && <>
          <button className="btn btn-secondary" onClick={() => router.replace(`/activity/${order.id}`)}>{r.viewActivity}</button>
          <button className="btn btn-primary" onClick={() => {
            s.setDraft({ assetId: a.id, side: order.side, amount: String(buy ? order.usd : +order.quantity.toFixed(8)), unit: buy ? "usd" : "asset" });
            router.replace(`/trade/${a.id}/${order.side}`);
          }}>{r.tryAgain}</button>
        </>}
      </div>
    </main>
  );
}
