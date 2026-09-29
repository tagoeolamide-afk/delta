"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePortfolio, useStore } from "@/lib/store";
import { RANGE_LABEL, series } from "@/lib/data";
import type { Range } from "@/lib/types";
import { money, spokenChange } from "@/lib/format";
import { track } from "@/lib/analytics";
import { portfolio as t } from "@/content/copy";
import { AssetRow } from "@/components/AssetRow";
import { FullChart, PriceChange, RangeSelector, UpdatedAt } from "@/components/market";
import { AllocationBar, ActivityRow } from "@/components/portfolio";
import { Banner, EmptyState, Skeleton, SkeletonRows } from "@/components/feedback";
import { useScrollMemory } from "@/components/chrome";

/** Sum of each priced holding's series × quantity, plus cash. */
function portfolioSeries(rows: ReturnType<typeof usePortfolio>["rows"], cash: number, range: Range): number[] {
  const parts = rows.filter((r) => isFinite(r.value))
    .map((r) => series(r.asset.seed, r.asset.volatility, r.quote.price, r.quote.change24h, range).map((v) => v * r.holding.quantity));
  if (!parts.length) return [];
  return parts[0].map((_, i) => parts.reduce((sum, arr) => sum + arr[i], 0) + cash);
}

export default function PortfolioPage() {
  const s = useStore();
  const p = usePortfolio();
  const [range, setRange] = useState<Range>("1D");
  const [scrub, setScrub] = useState<number | null>(null);
  useEffect(() => { track("portfolio_viewed"); }, []);
  useScrollMemory("portfolio", s.ready);

  const values = portfolioSeries(p.rows, p.cash, range);

  const empty = s.ready && s.holdings.length === 0;
  const first = values[0] ?? p.total;
  const shown = scrub !== null ? values[scrub] : p.total;
  const change = range === "1D" && scrub === null ? p.dayChange : shown - first;
  const changePct = range === "1D" && scrub === null ? p.dayPct : ((shown - first) / first) * 100;
  const pending = s.orders.filter((o) => o.status === "pending" || o.status === "unknown");

  return (
    <main id="content">
      <header className="topbar" style={{ paddingLeft: "var(--gutter)" }}><h1 className="title grow">{t.title}</h1></header>
      <div className="screen">
        {!s.ready ? (
          <div className="stack-12" role="status" aria-label="Loading portfolio">
            <Skeleton w="65%" h={52} /><Skeleton w="45%" h={16} /><Skeleton h={180} r={12} /><SkeletonRows n={3} />
          </div>
        ) : empty ? (
          <EmptyState icon="pie" title={t.emptyTitle} body={t.emptyBody} action={<Link className="btn btn-primary" href="/discover">{t.emptyCta}</Link>} />
        ) : (
          <>
            <section aria-label="Portfolio value">
              <p className="display-1 num">{money(shown)}</p>
              <p style={{ marginTop: 6 }}><PriceChange pctValue={changePct} abs={change} period={scrub !== null ? "since start of period" : RANGE_LABEL[range]} /></p>
              <p style={{ marginTop: 6 }}><UpdatedAt ts={s.quote(p.rows[0]?.holding.assetId ?? "doge").updatedAt} now={s.now} stale={s.lab.stale || s.lab.offline} /></p>
              {p.excluded > 0 && <div style={{ marginTop: 10 }}><Banner tone="warn">{t.excluded(p.excluded)}</Banner></div>}
              {pending.length > 0 && <div style={{ marginTop: 10 }}><Banner tone="info" icon="clock">{pending.length === 1 ? "1 order is" : `${pending.length} orders are`} waiting for confirmation. <Link href="/activity" className="btn-link" style={{ minHeight: 0, padding: 0 }}>View</Link></Banner></div>}
            </section>

            <section style={{ marginTop: 16 }}>
              {values.length > 1 && (
                <FullChart values={values} onScrub={setScrub}
                  summary={`Your portfolio is ${spokenChange(((values[values.length - 1] - first) / first) * 100)} over the ${range === "1D" ? "past day" : RANGE_LABEL[range]}.`} />
              )}
              <div style={{ marginTop: 12 }}><RangeSelector value={range} onChange={setRange} label="Portfolio period" /></div>
            </section>

            <section className="section">
              <h2 className="h-section" style={{ marginBottom: 12 }}>{t.allocation}</h2>
              <AllocationBar meme={p.byType.meme} stock={p.byType.stock} cash={p.cash} />
            </section>

            <section className="section">
              <div className="section-head"><h2 className="h-section">{t.holdings}</h2></div>
              <ul>
                {[...p.rows].sort((x, y) => (y.value || 0) - (x.value || 0)).map((r) => (
                  <li key={r.asset.id}>
                    <AssetRow asset={r.asset} source="portfolio" href={`/position/${r.asset.id}`}
                      onSelect={() => track("holding_selected", { asset_id: r.asset.id })}
                      end={isFinite(r.value) ? <>
                        <span className="v num">{money(r.value)}</span>
                        <PriceChange pctValue={((r.value - r.holding.costBasis) / r.holding.costBasis) * 100} period="total" className="small" />
                      </> : <span className="small muted">Price unavailable</span>} />
                  </li>
                ))}
              </ul>
            </section>

            <section className="section">
              <div className="section-head"><h2 className="h-section">{t.activity}</h2></div>
              <ul>{s.orders.slice(0, 3).map((o) => <li key={o.id}><ActivityRow order={o} /></li>)}</ul>
              <Link href="/activity" className="btn btn-ghost btn-block" style={{ marginTop: 12 }}>{t.seeAll}</Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
