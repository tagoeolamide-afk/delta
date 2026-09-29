"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { dateTime, money, price as fmtPrice, qty } from "@/lib/format";
import { track } from "@/lib/analytics";
import { activity as t, result } from "@/content/copy";
import { AssetLogo, TypeLabel } from "@/components/identity";
import { Banner, EmptyState } from "@/components/feedback";
import { TopBar } from "@/components/chrome";

export default function TransactionPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const s = useStore();
  const o = s.orders.find((x) => x.id === orderId);
  useEffect(() => { if (o) track("transaction_detail_viewed", { status: o.status }); }, [o]);
  if (!o) return <main id="content"><TopBar back title={t.detail} heading={false} /><div className="screen no-tabs"><EmptyState title="We couldn't find this transaction." /></div></main>;
  const a = s.asset(o.assetId)!;
  const buy = o.side === "buy";
  return (
    <main id="content" className={`reg-${a.type}`}>
      <TopBar back title={t.detail} heading={false} />
      <div className="screen no-tabs">
        <Link href={`/asset/${a.id}`} className="hstack" style={{ gap: 12 }}>
          <AssetLogo asset={a} size={44} />
          <span><span style={{ fontWeight: 600 }}>{a.name}</span> <span className="num muted">{a.symbol}</span><br /><TypeLabel type={a.type} /></span>
        </Link>
        <h1 className="display-2" style={{ marginTop: 20, fontSize: "2.25rem" }}>{buy ? t.bought(a.symbol) : t.sold(a.symbol)}</h1>
        {o.status === "pending" && <div style={{ marginTop: 12 }}><Banner tone="info" icon="clock">{result.pendingBody}</Banner></div>}
        {o.status === "unknown" && <div style={{ marginTop: 12 }}><Banner tone="warn">{result.unknownBody}</Banner></div>}
        <dl className="card" style={{ marginTop: 20, paddingTop: 6, paddingBottom: 6 }}>
          <div className="kv"><dt>{t.status}</dt><dd>{result.statusChip[o.status]}</dd></div>
          <div className="kv"><dt>{buy ? "You paid" : "You received"}</dt><dd className="num">{money(o.usd)}</dd></div>
          <div className="kv"><dt>Quantity</dt><dd className="num">{qty(o.quantity, a.symbol)}</dd></div>
          <div className="kv"><dt>Price</dt><dd className="num">{fmtPrice(o.price).text}</dd></div>
          <div className="kv"><dt>Delta fee</dt><dd className="num">{money(o.fee)}</dd></div>
          <div className="kv"><dt>{t.date}</dt><dd>{dateTime(o.createdAt)}</dd></div>
          <div className="kv"><dt>{t.id}</dt><dd style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontWeight: 500 }}>{o.id}</dd></div>
        </dl>
      </div>
    </main>
  );
}
