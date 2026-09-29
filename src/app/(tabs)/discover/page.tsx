"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { ASSETS } from "@/lib/data";
import type { Asset, AssetType } from "@/lib/types";
import { track } from "@/lib/analytics";
import { common, discover, home, TYPE_PLURAL } from "@/content/copy";
import { Icon } from "@/components/Icon";
import { AssetRow } from "@/components/AssetRow";
import { RetryState, Sheet, SkeletonRows, EmptyState } from "@/components/feedback";
import { useScrollMemory } from "@/components/chrome";

type Cat = keyof typeof discover.categories;
const CATS = Object.keys(discover.categories) as Cat[];

export default function DiscoverPage() {
  const s = useStore();
  const type = (s.ui["discover:type"] as AssetType | "all") ?? "all";
  const cat = (s.ui["discover:cat"] as Cat) ?? "trending";
  const [info, setInfo] = useState(false);
  useEffect(() => { track("discover_viewed"); }, []);
  useScrollMemory("discover", s.ready);

  const pool = ASSETS.filter((a) => type === "all" || a.type === type);
  const q = (a: Asset) => s.quote(a.id);
  const list: Asset[] = (() => {
    switch (cat) {
      case "trending": return pool.filter((a) => a.trendingRank).sort((a, b) => a.trendingRank! - b.trendingRank!);
      case "gainers": return pool.filter((a) => q(a).change24h > 0).sort((a, b) => q(b).change24h - q(a).change24h);
      case "losers": return pool.filter((a) => q(a).change24h < 0).sort((a, b) => q(a).change24h - q(b).change24h);
      case "new": return pool.filter((a) => a.listedDaysAgo <= 30).sort((a, b) => a.listedDaysAgo - b.listedDaysAgo);
      case "traded": return [...pool].sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0));
    }
  })();

  const setType = (t: AssetType | "all") => { s.setUi("discover:type", t); track("category_selected", { category: `type:${t}` }); };
  const setCat = (c: Cat) => { s.setUi("discover:cat", c); track("category_selected", { category: c }); };
  const failed = cat === "trending" && s.lab.trendingFail;

  return (
    <main id="content">
      <header className="topbar" style={{ paddingLeft: "var(--gutter)" }}>
        <h1 className="title grow">{discover.title}</h1>
        <Link href="/search" className="icon-btn" aria-label="Search" onClick={() => track("search_started", { source: "discover" })}><Icon name="search" /></Link>
      </header>
      <div className="screen">
        <Link href="/search" className="hstack" onClick={() => track("search_started", { source: "discover" })}
          style={{ minHeight: 48, padding: "0 14px", borderRadius: 12, background: "var(--s1)", color: "var(--text-2)" }}>
          <Icon name="search" size={20} /><span>{common.searchPlaceholder}</span>
        </Link>

        <div className="text-tabs" role="group" aria-label="Asset type" style={{ marginTop: 12 }}>
          <button aria-pressed={type === "all"} onClick={() => setType("all")}>{discover.all}</button>
          <button aria-pressed={type === "meme"} onClick={() => setType("meme")}>{TYPE_PLURAL.meme}</button>
          <button aria-pressed={type === "stock"} onClick={() => setType("stock")}>{TYPE_PLURAL.stock}</button>
        </div>

        <div className="chips" role="group" aria-label="Category" style={{ marginTop: 12 }}>
          {CATS.map((c) => (
            <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{discover.categories[c]}</button>
          ))}
        </div>

        <section style={{ marginTop: 12 }} aria-live="polite">
          <div className="between" style={{ minHeight: 44 }}>
            <h2 className="label">{discover.categories[cat]} · {type === "all" ? discover.all : TYPE_PLURAL[type]}</h2>
            {(cat === "trending" || cat === "new") && (
              <button className="btn-link small hstack" onClick={() => setInfo(true)}><Icon name="info" size={16} />About this list</button>
            )}
          </div>
          {!s.ready ? <SkeletonRows n={6} /> : failed ? (
            <RetryState message={discover.failed(discover.categories.trending)} onRetry={() => s.setLab({ trendingFail: false })} />
          ) : list.length === 0 ? (
            <EmptyState title={discover.empty} />
          ) : (
            <ol>
              {list.map((a, i) => (
                <li key={a.id}><AssetRow asset={a} rank={cat === "trending" ? i + 1 : undefined} source={`discover_${cat}`} spark /></li>
              ))}
            </ol>
          )}
        </section>
      </div>
      <Sheet open={info} onClose={() => setInfo(false)} title={discover.categories[cat]}>
        <p className="muted">{cat === "new" ? discover.newInfo : home.trendingInfo}</p>
      </Sheet>
    </main>
  );
}
