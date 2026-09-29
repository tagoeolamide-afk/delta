"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { money, price as fmtPrice, qty } from "@/lib/format";
import { track } from "@/lib/analytics";
import { position as t, asset as ac } from "@/content/copy";
import { AssetLogo, TypeLabel } from "@/components/identity";
import { PriceChange, PriceText, UpdatedAt } from "@/components/market";
import { ActivityRow } from "@/components/portfolio";
import { Banner, EmptyState } from "@/components/feedback";
import { TopBar } from "@/components/chrome";
import { Icon } from "@/components/Icon";

export default function PositionPage() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const router = useRouter();
  const a = s.asset(id);
  const h = s.holding(id);
  if (!a) return null;
  const q = s.quote(a.id);
  const priced = isFinite(q.price);
  const orders = s.orders.filter((o) => o.assetId === a.id);

  const start = (side: "buy" | "sell") => {
    track(side === "buy" ? "buy_started" : "sell_started", { asset_id: a.id, type: a.type, source: "position" });
    s.setDraft({ assetId: a.id, side, amount: "", unit: side === "buy" ? "usd" : "asset" });
    router.push(`/trade/${a.id}/${side}`);
  };

  if (!h) {
    return (
      <main id="content"><TopBar back />
        <div className="screen no-tabs">
          <EmptyState title={`You don't own any ${a.symbol} right now.`} body="Your position will show up here after a buy completes."
            action={<Link href={`/asset/${a.id}`} className="btn btn-secondary">{t.viewAsset}</Link>} />
        </div>
      </main>
    );
  }

  const value = h.quantity * q.price;
  const total = value - h.costBasis;
  const today = value - value / (1 + q.change24h / 100);
  const avg = h.costBasis / h.quantity;

  return (
    <main id="content" className={`reg-${a.type}`}>
      <TopBar back title="Position" />
      <div className="screen no-tabs">
        <Link href={`/asset/${a.id}`} className="row row-link" style={{ gridTemplateColumns: "auto 1fr auto" }}>
          <AssetLogo asset={a} size={44} />
          <span className="row-main">
            <span className="row-name">{a.name}</span>
            <span className="row-sub"><span className="num" style={{ fontWeight: 600, color: "var(--text)" }}>{a.symbol}</span><TypeLabel type={a.type} /></span>
          </span>
          <Icon name="chevron" size={18} />
        </Link>

        <section style={{ marginTop: 20 }}>
          <p className="label">{t.value}</p>
          {priced ? <p className="display-1 num" style={{ marginTop: 6 }}>{money(value)}</p> : <Banner tone="warn">{ac.priceUnavailable}</Banner>}
          <p style={{ marginTop: 6 }}><UpdatedAt ts={q.updatedAt} now={s.now} stale={s.lab.stale || s.lab.offline} /></p>
        </section>

        {priced && (
          <dl className="card" style={{ marginTop: 20, paddingTop: 6, paddingBottom: 6 }}>
            <div className="kv"><dt>{t.quantity}</dt><dd className="num">{qty(h.quantity, a.symbol)}</dd></div>
            <div className="kv"><dt>{t.avg}</dt><dd className="num">{fmtPrice(avg).text}</dd></div>
            <div className="kv"><dt>Current price</dt><dd><PriceText value={q.price} /></dd></div>
            <div className="kv"><dt>{t.today}</dt><dd><PriceChange pctValue={q.change24h} abs={today} /></dd></div>
            <div className="kv"><dt>{t.total}</dt><dd><PriceChange pctValue={(total / h.costBasis) * 100} abs={total} /></dd></div>
          </dl>
        )}

        <section className="section">
          <div className="section-head"><h2 className="h-section">Activity</h2></div>
          {orders.length ? <ul>{orders.map((o) => <li key={o.id}><ActivityRow order={o} /></li>)}</ul> : <p className="muted small">No trades yet in this asset.</p>}
        </section>
      </div>

      <div className="dock">
        {!q.available ? <Banner tone="warn"><strong>{ac.unavailable}</strong></Banner> : (
          <div className="dock-row">
            <button className="btn btn-primary" disabled={s.lab.offline || !priced} onClick={() => start("buy")}>Buy</button>
            <button className="btn btn-secondary" disabled={s.lab.offline || !priced} onClick={() => start("sell")}>Sell</button>
          </div>
        )}
      </div>
    </main>
  );
}
