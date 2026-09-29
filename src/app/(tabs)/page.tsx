"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore, usePortfolio } from "@/lib/store";
import { ASSETS } from "@/lib/data";
import { track } from "@/lib/analytics";
import { home, common, TYPE_PLURAL } from "@/content/copy";
import { Icon, type IconName } from "@/components/Icon";
import { Money, PriceChange, UpdatedAt } from "@/components/market";
import { AssetRow } from "@/components/AssetRow";
import { EmptyState, Sheet, Skeleton, SkeletonRows, RetryState } from "@/components/feedback";
import { useScrollMemory } from "@/components/chrome";
import { PRODUCT } from "@/lib/config";

export default function HomePage() {
  const s = useStore();
  const p = usePortfolio();
  const router = useRouter();
  const [movers, setMovers] = useState<"gainers" | "losers">("gainers");
  const [infoOpen, setInfoOpen] = useState(false);
  const hidden = s.ui["home:hide"] === true;
  useEffect(() => { track("home_viewed"); }, []);
  useScrollMemory("home", s.ready);

  const trending = ASSETS.filter((a) => a.trendingRank).sort((a, b) => a.trendingRank! - b.trendingRank!).slice(0, 5);
  const sorted = [...ASSETS].sort((a, b) => s.quote(b.id).change24h - s.quote(a.id).change24h);
  const moverList = (movers === "gainers" ? sorted.filter((a) => s.quote(a.id).change24h > 0) : sorted.reverse().filter((a) => s.quote(a.id).change24h < 0)).slice(0, 3);
  const watch = s.watchlist.map((id) => s.asset(id)!).filter(Boolean);
  const hasHoldings = s.holdings.length > 0;
  const stale = s.lab.stale || s.lab.offline;

  const actions: { label: string; icon: IconName; run: () => void }[] = [
    { label: "Buy", icon: "plus", run: () => router.push("/discover") },
    { label: "Sell", icon: "minus", run: () => router.push("/portfolio") },
    { label: "Add funds", icon: "bank", run: () => s.toast("Add funds isn't part of this prototype") },
    { label: "Activity", icon: "history", run: () => router.push("/activity") },
  ];

  return (
    <main id="content">
      <header className="topbar" style={{ paddingLeft: "var(--gutter)" }}>
        <h1 className="grow brand"><span className="brand-mark" aria-hidden>Δ</span>{PRODUCT.name}</h1>
        <Link href="/search" className="icon-btn soft" aria-label="Search" onClick={() => track("search_started", { source: "home" })}><Icon name="search" /></Link>
        <button className="icon-btn soft" aria-label={common.notifications}><Icon name="bell" /></button>
      </header>

      <div className="screen">
        {/* Portfolio summary — centred, Crypto.com number system */}
        <section aria-labelledby="pf" style={{ paddingTop: 20, textAlign: "center" }}>
          {!s.ready ? (
            <div className="stack-12" role="status" aria-label="Loading portfolio" style={{ display: "grid", justifyItems: "center" }}>
              <Skeleton w={110} h={12} /><Skeleton w="62%" h={44} /><Skeleton w="40%" h={16} />
            </div>
          ) : hasHoldings ? (
            <>
              <div className="hstack" style={{ justifyContent: "center", gap: 4 }}>
                <h2 id="pf" className="label">Total balance</h2>
                <button className="icon-btn sm" aria-pressed={hidden} aria-label={hidden ? "Show balance" : "Hide balance"}
                  onClick={() => s.setUi("home:hide", !hidden)} style={{ color: "var(--text-2)" }}>
                  <Icon name={hidden ? "eyeOff" : "eye"} size={16} />
                </button>
              </div>
              <Link href="/portfolio" style={{ display: "inline-block" }} aria-label="Open portfolio">
                {hidden ? <p className="display-1" aria-label="Balance hidden">••••••</p> : <p className="display-1"><Money value={p.total} unit="USD" /></p>}
              </Link>
              <p style={{ marginTop: 6 }}>{!hidden && <PriceChange pctValue={p.dayPct} abs={p.dayChange} period="today" />}</p>
              <p style={{ marginTop: 10 }}><UpdatedAt ts={s.quote("doge").updatedAt} now={s.now} stale={stale} /></p>
            </>
          ) : (
            <div className="stack-12" style={{ display: "grid", justifyItems: "center", padding: "8px 0" }}>
              <h2 id="pf" className="display-2" style={{ fontSize: "1.625rem" }}>{home.emptyTitle}</h2>
              <p className="muted" style={{ maxWidth: "30ch" }}>{home.emptyBody}</p>
              <Link href="/discover" className="btn btn-primary">{home.emptyCta}</Link>
            </div>
          )}
        </section>

        {/* Round action buttons */}
        <nav aria-label="Quick actions" className="actions" style={{ marginTop: 24 }}>
          {actions.map((a) => (
            <button key={a.label} className="action" onClick={a.run}>
              <span className="action-ico"><Icon name={a.icon} size={22} /></span>{a.label}
            </button>
          ))}
        </nav>

        {/* Search */}
        <Link href="/search" className="hstack" onClick={() => track("search_started", { source: "home" })}
          style={{ marginTop: 24, minHeight: 48, padding: "0 14px", borderRadius: 12, background: "var(--s1)", color: "var(--text-2)" }}>
          <Icon name="search" size={18} /><span>{common.searchPlaceholder}</span>
        </Link>

        {/* Watchlist */}
        <section className="section" aria-labelledby="wl">
          <div className="section-head"><h2 id="wl" className="h-section">{home.watchlist}</h2>
            {watch.length > 4 && <Link href="/discover" className="btn-link">{home.seeAll}</Link>}</div>
          {!s.ready ? <SkeletonRows n={3} /> : watch.length === 0 ? (
            <EmptyState icon="star" title={home.watchEmptyTitle} action={<Link href="/discover" className="btn btn-secondary btn-sm">{home.watchEmptyCta}</Link>} />
          ) : (
            <ul>{watch.slice(0, 4).map((a) => <li key={a.id}><AssetRow asset={a} source="watchlist" spark /></li>)}</ul>
          )}
        </section>

        {/* Trending */}
        <section className="section" aria-labelledby="tr">
          <div className="section-head">
            <h2 id="tr" className="h-section hstack" style={{ gap: 2 }}>{home.trending}
              <button className="icon-btn sm" aria-label="How Trending works" onClick={() => setInfoOpen(true)} style={{ color: "var(--text-2)" }}><Icon name="info" size={16} /></button>
            </h2>
            <Link href="/discover" className="btn-link" onClick={() => s.setUi("discover:cat", "trending")}>{home.seeAll}</Link>
          </div>
          {!s.ready ? <SkeletonRows n={3} label="Loading trending" /> : s.lab.trendingFail ? (
            <RetryState message="Trending isn't available right now." onRetry={() => s.setLab({ trendingFail: false })} />
          ) : (
            <ol>{trending.map((a) => <li key={a.id}><AssetRow asset={a} rank={a.trendingRank} source="home_trending" /></li>)}</ol>
          )}
        </section>

        {/* Market movers */}
        <section className="section" aria-labelledby="mv">
          <div className="section-head"><h2 id="mv" className="h-section">{home.movers}</h2></div>
          <div className="chips" role="group" aria-label={home.movers} style={{ marginBottom: 4 }}>
            <button className="chip" aria-pressed={movers === "gainers"} onClick={() => setMovers("gainers")}>{home.gainers}</button>
            <button className="chip" aria-pressed={movers === "losers"} onClick={() => setMovers("losers")}>{home.losers}</button>
          </div>
          {!s.ready ? <SkeletonRows n={3} /> : <ul>{moverList.map((a) => <li key={a.id}><AssetRow asset={a} source={`home_${movers}`} /></li>)}</ul>}
        </section>

        {/* Explore by type */}
        <section className="section" aria-labelledby="ex">
          <div className="section-head"><h2 id="ex" className="h-section">{home.explore}</h2></div>
          <div className="stack-8">
            {(["meme", "stock"] as const).map((t) => (
              <Link key={t} href="/discover" onClick={() => { s.setUi("discover:type", t); track("category_selected", { category: t, source: "home" }); }}
                className="card between" style={{ minHeight: 76 }}>
                <span className="stack-4">
                  <span style={{ fontWeight: 600, display: "block" }}>{TYPE_PLURAL[t]}</span>
                  <span className="small muted" style={{ display: "block" }}>{t === "meme" ? home.memeBlurb : home.stockBlurb}</span>
                </span>
                <Icon name="chevron" size={18} />
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
