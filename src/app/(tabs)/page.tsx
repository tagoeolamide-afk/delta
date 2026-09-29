"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore, usePortfolio } from "@/lib/store";
import { ASSETS } from "@/lib/data";
import { money } from "@/lib/format";
import { track } from "@/lib/analytics";
import { home, common, TYPE_PLURAL } from "@/content/copy";
import { Icon } from "@/components/Icon";
import { AssetLogo, TypeLabel } from "@/components/identity";
import { PriceChange, PriceText, UpdatedAt } from "@/components/market";
import { AssetRow } from "@/components/AssetRow";
import { EmptyState, Sheet, Skeleton, SkeletonRows, RetryState } from "@/components/feedback";
import { useScrollMemory } from "@/components/chrome";
import { PRODUCT } from "@/lib/config";

export default function HomePage() {
  const s = useStore();
  const p = usePortfolio();
  const [movers, setMovers] = useState<"gainers" | "losers">("gainers");
  const [infoOpen, setInfoOpen] = useState(false);
  useEffect(() => { track("home_viewed"); }, []);
  useScrollMemory("home", s.ready);

  const trending = ASSETS.filter((a) => a.trendingRank).sort((a, b) => a.trendingRank! - b.trendingRank!).slice(0, 5);
  const sorted = [...ASSETS].sort((a, b) => s.quote(b.id).change24h - s.quote(a.id).change24h);
  const moverList = (movers === "gainers" ? sorted.filter((a) => s.quote(a.id).change24h > 0) : sorted.reverse().filter((a) => s.quote(a.id).change24h < 0)).slice(0, 3);
  const watch = s.watchlist.map((id) => s.asset(id)!).filter(Boolean);
  const hasHoldings = s.holdings.length > 0;
  const firstQuote = s.quote("doge");
  const stale = s.lab.stale || s.lab.offline;

  return (
    <main id="content">
      <header className="topbar">
        <Link href="/profile" className="icon-btn" aria-label="Profile">
          <span style={{ width: 32, height: 32, borderRadius: 16, background: "var(--surface-2)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600 }} aria-hidden>OT</span>
        </Link>
        <h1 className="grow brand" style={{ justifyContent: "center", fontSize: "1rem" }}>
          <span className="brand-mark" aria-hidden>Δ</span><span>{PRODUCT.name}</span>
        </h1>
        <button className="icon-btn" aria-label={common.notifications}><Icon name="bell" /></button>
      </header>

      <div className="screen">
        {/* 2. Portfolio summary */}
        <section aria-labelledby="pf" style={{ paddingTop: 12 }}>
          {!s.ready ? (
            <div className="stack-12" role="status" aria-label="Loading portfolio">
              <Skeleton w={110} h={12} /><Skeleton w="70%" h={52} /><Skeleton w="50%" h={16} />
            </div>
          ) : hasHoldings ? (
            <Link href="/portfolio" className="stack-8" style={{ display: "block" }}>
              <h2 id="pf" className="label">{home.portfolioLabel}</h2>
              <p className="display-1 num">{money(p.total)}</p>
              <PriceChange pctValue={p.dayPct} abs={p.dayChange} period="today" />
              <p><UpdatedAt ts={firstQuote.updatedAt} now={s.now} stale={stale} /></p>
            </Link>
          ) : (
            <div className="card reg-none" style={{ background: "var(--raised)" }}>
              <h2 id="pf" className="display-2" style={{ fontSize: "2rem" }}>{home.emptyTitle}</h2>
              <p className="muted" style={{ marginTop: 8 }}>{home.emptyBody}</p>
              <Link href="/discover" className="btn btn-primary" style={{ marginTop: 16 }}>{home.emptyCta}</Link>
            </div>
          )}
        </section>

        {/* 3. Search */}
        <Link href="/search" className="hstack" onClick={() => track("search_started", { source: "home" })}
          style={{ marginTop: 24, minHeight: 50, padding: "0 16px", borderRadius: 999, background: "var(--surface)", color: "var(--ink-2)" }}>
          <Icon name="search" size={20} /><span>{common.searchPlaceholder}</span>
        </Link>

        {/* 4. Watchlist */}
        <section className="section" aria-labelledby="wl">
          <div className="section-head"><h2 id="wl" className="h-section">{home.watchlist}</h2></div>
          {!s.ready ? <div className="hstack"><Skeleton w={140} h={120} r={16} /><Skeleton w={140} h={120} r={16} /></div>
            : watch.length === 0 ? (
              <EmptyState icon="star" title={home.watchEmptyTitle} action={<Link href="/discover" className="btn btn-secondary btn-sm">{home.watchEmptyCta}</Link>} />
            ) : (
              <ul className="chips" style={{ gap: 10 }}>
                {watch.map((a) => {
                  const q = s.quote(a.id);
                  return (
                    <li key={a.id} style={{ flex: "none" }}>
                      <Link href={`/asset/${a.id}`} onClick={() => track("asset_card_selected", { asset_id: a.id, source: "watchlist" })}
                        className="tile" style={{ display: "grid", gap: 8, width: 148, minHeight: 124 }}>
                        <span className="hstack"><AssetLogo asset={a} size={28} /><span className="num" style={{ fontWeight: 600 }}>{a.symbol}</span></span>
                        <TypeLabel type={a.type} />
                        <span style={{ display: "grid", gap: 2 }}>
                          {isFinite(q.price) ? <><PriceText value={q.price} className="small" /><PriceChange pctValue={q.change24h} className="small" /></> : <span className="small muted">Price unavailable</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
        </section>

        {/* 5. Trending */}
        <section className="section" aria-labelledby="tr">
          <div className="section-head">
            <h2 id="tr" className="h-section hstack">{home.trending}
              <button className="icon-btn" style={{ width: 32, height: 32 }} aria-label="How Trending works" onClick={() => setInfoOpen(true)}><Icon name="info" size={18} /></button>
            </h2>
            <Link href="/discover" className="btn-link small" onClick={() => s.setUi("discover:cat", "trending")}>{home.seeAll}</Link>
          </div>
          {!s.ready ? <SkeletonRows n={3} label="Loading trending" /> : s.lab.trendingFail ? (
            <RetryState message="Trending isn't available right now." onRetry={() => s.setLab({ trendingFail: false })} />
          ) : (
            <ol>{trending.map((a) => <li key={a.id}><AssetRow asset={a} rank={a.trendingRank} source="home_trending" /></li>)}</ol>
          )}
        </section>

        {/* 6. Market movers */}
        <section className="section" aria-labelledby="mv">
          <div className="section-head"><h2 id="mv" className="h-section">{home.movers}</h2></div>
          <div className="seg" role="group" aria-label={home.movers} style={{ marginBottom: 4 }}>
            <button aria-pressed={movers === "gainers"} onClick={() => setMovers("gainers")}>{home.gainers}</button>
            <button aria-pressed={movers === "losers"} onClick={() => setMovers("losers")}>{home.losers}</button>
          </div>
          {!s.ready ? <SkeletonRows n={3} /> : <ul>{moverList.map((a) => <li key={a.id}><AssetRow asset={a} source={`home_${movers}`} /></li>)}</ul>}
        </section>

        {/* 7. Explore by type */}
        <section className="section" aria-labelledby="ex">
          <div className="section-head"><h2 id="ex" className="h-section">{home.explore}</h2></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {(["meme", "stock"] as const).map((t) => (
              <Link key={t} href="/discover" onClick={() => { s.setUi("discover:type", t); track("category_selected", { category: t, source: "home" }); }}
                className={`reg-${t}`} style={{ display: "grid", gap: 8, padding: 16, minHeight: 112, borderRadius: 18, background: "var(--reg-tint)", borderLeft: "3px solid var(--reg)", alignContent: "end" }}>
                <span style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontWeight: 600 }}>{TYPE_PLURAL[t]}</span>
                  <span className="small muted">{t === "meme" ? home.memeBlurb : home.stockBlurb}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Sheet open={infoOpen} onClose={() => setInfoOpen(false)} title={home.trending}>
        <p className="muted">{home.trendingInfo}</p>
      </Sheet>
    </main>
  );
}
