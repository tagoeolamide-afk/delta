"use client";

import Link from "next/link";
import type { Order } from "@/lib/types";
import { useStore } from "@/lib/store";
import { dateTime, money, qty } from "@/lib/format";
import { activity as t, result, TYPE_PLURAL, portfolio as pc } from "@/content/copy";
import { AssetLogo } from "./identity";
import { track } from "@/lib/analytics";

/** Simple allocation bar (PRD §15) — segments use register colors AND text labels. */
export function AllocationBar({ meme, stock, cash }: { meme: number; stock: number; cash: number }) {
  const total = meme + stock + cash || 1;
  const parts = [
    { key: "meme", label: TYPE_PLURAL.meme, v: meme, color: "var(--meme)" },
    { key: "stock", label: TYPE_PLURAL.stock, v: stock, color: "var(--stock)" },
    { key: "cash", label: pc.cash, v: cash, color: "var(--line-strong)" },
  ];
  return (
    <div>
      <div role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.v / total) * 100)}%`).join(", ")}
        style={{ display: "flex", gap: 3, height: 10, borderRadius: 6, overflow: "hidden" }}>
        {parts.filter((p) => p.v > 0).map((p) => <span key={p.key} style={{ flex: p.v / total, background: p.color, minWidth: 4 }} />)}
      </div>
      <ul style={{ marginTop: 12 }}>
        {parts.map((p) => (
          <li key={p.key} className="kv" style={{ padding: "8px 0" }}>
            <span className="hstack" style={{ gap: 8 }}><span aria-hidden style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />{p.label}</span>
            <span className="num"><strong>{money(p.v)}</strong> <span className="muted">· {Math.round((p.v / total) * 100)}%</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ActivityRow({ order }: { order: Order }) {
  const { asset } = useStore();
  const a = asset(order.assetId)!;
  const buy = order.side === "buy";
  const status = order.status;
  return (
    <Link href={`/activity/${order.id}`} className="row row-link" onClick={() => track("transaction_detail_viewed", { status })}>
      <AssetLogo asset={a} size={36} />
      <span className="row-main">
        <span className="row-name">{buy ? t.bought(a.symbol) : t.sold(a.symbol)}</span>
        <span className="row-sub">{a.name} · {dateTime(order.createdAt)}</span>
      </span>
      <span className="row-end">
        <span className="v num">{buy ? "−" : "+"}{money(order.usd)}</span>
        <span className="small num muted">{buy ? "+" : "−"}{qty(order.quantity, a.symbol)}</span>
        {status !== "completed" && (
          <span className="small" style={{ fontWeight: 600, color: status === "failed" ? "var(--loss)" : status === "pending" ? "var(--accent)" : "var(--warn)" }}>
            {result.statusChip[status]}
          </span>
        )}
      </span>
    </Link>
  );
}
