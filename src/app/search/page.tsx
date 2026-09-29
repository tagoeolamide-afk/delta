"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { ASSETS } from "@/lib/data";
import { track } from "@/lib/analytics";
import { common, search } from "@/content/copy";
import { Icon } from "@/components/Icon";
import { AssetRow } from "@/components/AssetRow";
import { Banner, RetryState, SkeletonRows } from "@/components/feedback";

export default function SearchPage() {
  const s = useStore();
  const router = useRouter();
  const [q, setQ] = useState((s.ui["search:q"] as string) ?? "");
  const [loading, setLoading] = useState(false);
  const [debounced, setDebounced] = useState(q);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => { input.current?.focus(); return () => clearTimeout(timer.current); }, []);

  /** Results update while typing (debounced); the query is kept across navigation. */
  const change = (v: string) => {
    setQ(v);
    s.setUi("search:q", v);
    clearTimeout(timer.current);
    if (!v.trim()) { setDebounced(""); setLoading(false); return; }
    setLoading(true);
    timer.current = setTimeout(() => { setDebounced(v); setLoading(false); }, 220);
  };

  const term = debounced.trim().toLowerCase();
  const results = term
    ? ASSETS.filter((a) => a.symbol.toLowerCase().includes(term) || a.name.toLowerCase().includes(term))
        .sort((a, b) => Number(b.symbol.toLowerCase() === term) - Number(a.symbol.toLowerCase() === term))
    : [];
  const dupSymbols = [...new Set(results.map((r) => r.symbol))].filter((sym) => results.filter((r) => r.symbol === sym).length > 1);

  useEffect(() => {
    if (term && !loading && results.length === 0 && !s.lab.searchFail) track("search_zero_results", { query_length: term.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, loading]);

  const select = (id: string, i: number) => { s.addRecent(id); track("search_result_selected", { asset_id: id, position: i }); };
  const browse = (t: "meme" | "stock") => { s.setUi("discover:type", t); router.push("/discover"); };

  return (
    <main id="content">
      <h1 className="sr-only">Search</h1>
      <header className="topbar" style={{ gap: 4 }}>
        <button className="icon-btn" aria-label={common.back} onClick={() => router.back()}><Icon name="back" /></button>
        <div className="grow hstack" style={{ minHeight: 46, padding: "0 14px", borderRadius: 999, background: "var(--surface)" }}>
          <Icon name="search" size={18} />
          <label htmlFor="q" className="sr-only">{search.label}</label>
          <input
            id="q" ref={input} value={q} onChange={(e) => change(e.target.value)} type="search" inputMode="search" autoComplete="off" enterKeyHint="search"
            placeholder={common.searchPlaceholder}
            style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", fontSize: 16, minHeight: 44 }}
          />
          {q && <button className="icon-btn" style={{ width: 32, height: 32 }} aria-label="Clear search" onClick={() => { change(""); input.current?.focus(); }}><Icon name="close" size={16} /></button>}
        </div>
      </header>

      <div className="screen no-tabs" style={{ paddingTop: 8 }}>
        {!term && !loading ? (
          <>
            {s.recent.length > 0 && (
              <section>
                <div className="section-head"><h2 className="label">{search.recent}</h2>
                  <button className="btn-link small" onClick={s.clearRecent}>{search.clearRecent}</button></div>
                <ul>{s.recent.map((id, i) => { const a = s.asset(id); return a && <li key={id}><AssetRow asset={a} source="search_recent" onSelect={() => select(id, i)} /></li>; })}</ul>
              </section>
            )}
            <section className="section" style={{ marginTop: s.recent.length ? 28 : 0 }}>
              <div className="section-head"><h2 className="label">{search.trending}</h2></div>
              <ul>{ASSETS.filter((a) => a.trendingRank).sort((a, b) => a.trendingRank! - b.trendingRank!).slice(0, 4)
                .map((a, i) => <li key={a.id}><AssetRow asset={a} source="search_trending" onSelect={() => select(a.id, i)} /></li>)}</ul>
            </section>
          </>
        ) : loading ? (
          <SkeletonRows n={4} label="Loading results" />
        ) : s.lab.searchFail ? (
          <div style={{ marginTop: 8 }}>
            <RetryState message={search.failed} onRetry={() => { s.setLab({ searchFail: false }); setDebounced(q + ""); }} />
          </div>
        ) : results.length === 0 ? (
          <div className="stack-12" style={{ paddingTop: 16 }} role="status">
            <p className="h-section wrap-anywhere">{search.none(debounced.trim())}</p>
            <p className="muted">{search.noneHelp}</p>
            <div className="stack-8" style={{ paddingTop: 8 }}>
              <button className="btn btn-secondary btn-block" onClick={() => browse("meme")}>{search.browseMeme}</button>
              <button className="btn btn-secondary btn-block" onClick={() => browse("stock")}>{search.browseStock}</button>
            </div>
          </div>
        ) : (
          <section aria-live="polite">
            <p className="label" style={{ minHeight: 32 }}>{search.results(results.length)}</p>
            {dupSymbols.map((sym) => (
              <div key={sym} style={{ marginBottom: 8 }}><Banner tone="info">{search.sameSymbol(sym)}</Banner></div>
            ))}
            <ul>{results.map((a, i) => <li key={a.id}><AssetRow asset={a} source="search_results" onSelect={() => select(a.id, i)} /></li>)}</ul>
          </section>
        )}
        {!term && <p className="small faint" style={{ marginTop: 24 }}>Tip: search by name or symbol, e.g. “DOGE” or “Apple”.</p>}
      </div>
    </main>
  );
}
