"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { RANGE_LABEL, series } from "@/lib/data";
import type { Range, RiskFlag } from "@/lib/types";
import { compact, compactNum, qty, spokenChange } from "@/lib/format";
import { track } from "@/lib/analytics";
import { asset as t, common, RISK_DETAIL, RISK_LABEL, trade as tc } from "@/content/copy";
import { Icon } from "@/components/Icon";
import { AssetLogo, TypeLabel } from "@/components/identity";
import { FullChart, Money, PriceChange, RangeSelector, UpdatedAt } from "@/components/market";
import { Banner, EmptyState, Sheet } from "@/components/feedback";
import { TopBar } from "@/components/chrome";

type SheetKind = null | "risks" | "about" | "own" | "intro";

export default function AssetPage() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const router = useRouter();
  const a = s.asset(id);
  const [range, setRange] = useState<Range>("1D");
  const [scrub, setScrub] = useState<number | null>(null);
  const [sheet, setSheet] = useState<SheetKind>(null);
  /** Range whose chart data has "arrived" — anything else shows "Loading chart…". */
  const [loadedRange, setLoadedRange] = useState<Range | null>(null);
  const chartLoading = loadedRange !== range;

  useEffect(() => { if (a) track("asset_viewed", { asset_id: a.id, type: a.type }); }, [a]);
  useEffect(() => { const tm = setTimeout(() => setLoadedRange(range), 350); return () => clearTimeout(tm); }, [range]);

  const q = a ? s.quote(a.id) : null;
  const values = a && q && isFinite(q.price) ? series(a.seed, a.volatility, q.price, q.change24h, range) : [];

  if (!a || !q) {
    return (<main id="content"><TopBar back /><div className="screen"><EmptyState title="We couldn't find this asset." body="It may have been removed or the link is wrong." /></div></main>);
  }

  const h = s.holding(a.id);
  const hasPrice = isFinite(q.price);
  const stale = s.lab.stale || s.lab.offline;
  const shown = scrub !== null ? values[scrub] : q.price;
  const first = values[0] ?? q.price;
  const rangePct = range === "1D" && scrub === null ? q.change24h : ((shown - first) / first) * 100;
  const watched = s.isWatched(a.id);
  const canTrade = q.available && hasPrice && !s.lab.offline && a.session !== "closed";

  const toggleWatch = () => {
    s.toggleWatch(a.id);
    s.toast(watched ? common.removedWatch : common.addedWatch, { label: common.undo, run: () => s.toggleWatch(a.id) });
  };

  const openSheet = (k: Exclude<SheetKind, null | "intro">) => {
    setSheet(k);
    track(k === "risks" ? "risk_info_opened" : k === "own" ? "ownership_info_opened" : "asset_info_opened", { asset_id: a.id });
  };

  const startTrade = (side: "buy" | "sell") => {
    if (side === "buy" && !s.seenIntro.includes(a.type)) { setSheet("intro"); return; }
    track(side === "buy" ? "buy_started" : "sell_started", { asset_id: a.id, type: a.type });
    s.setDraft({ assetId: a.id, side, amount: "", unit: side === "buy" ? "usd" : "asset" });
    router.push(`/trade/${a.id}/${side}`);
  };

  return (
    <main id="content" className={`reg-${a.type}`}>
      <TopBar back right={
        <button className="icon-btn" aria-pressed={watched} aria-label={watched ? common.removeWatch(a.symbol) : common.addWatch(a.symbol)} onClick={toggleWatch}
          style={{ color: watched ? "var(--accent)" : undefined }}>
          <Icon name="star" filled={watched} />
        </button>
      } />

      <div className="screen no-tabs">
        {/* Identity — G1: name, symbol, type, price, movement, owned?, tradable? within first viewport */}
        <div className="hstack" style={{ gap: 10, alignItems: "flex-start" }}>
          <AssetLogo asset={a} size={36} />
          <div style={{ minWidth: 0 }}>
            <h1 className="h-section wrap-anywhere" style={{ fontSize: "1.125rem" }}>{a.name}</h1>
            <p className="hstack" style={{ gap: 6, flexWrap: "wrap", marginTop: 2 }}>
              <span className="num small" style={{ fontWeight: 600, color: "var(--text-2)" }}>{a.symbol}</span>
              <TypeLabel type={a.type} />
            </p>
            {a.identityNote && <p className="small muted" style={{ marginTop: 4 }}>{a.identityNote}</p>}
          </div>
        </div>

        {/* Price row: big figure left, change pill right (Crypto.com) */}
        <div style={{ marginTop: 18 }} aria-live="off">
          {hasPrice ? (
            <>
              <div className="between" style={{ alignItems: "flex-end", flexWrap: "wrap", rowGap: 8 }}>
                <p className="display-2"><Money value={shown} kind="price" unit="USD" /></p>
                <PriceChange pctValue={rangePct} pill />
              </div>
              <p className="small muted" style={{ marginTop: 6 }}>
                {h ? <>{t.youOwn} <strong style={{ color: "var(--text)" }}>{qty(h.quantity, a.symbol)}</strong></> : t.notOwned}
                <span aria-hidden> · </span>
                {scrub !== null ? "since start of period" : RANGE_LABEL[range]}
              </p>
            </>
          ) : (
            <Banner tone="warn">{t.priceUnavailable}</Banner>
          )}
        </div>

        {/* Chart: LIVE + range pills above (Crypto.com) */}
        <section style={{ marginTop: 16, minHeight: 180 + 48 }} aria-label="Price chart">
          <div className="hstack" style={{ gap: 12, marginBottom: 12 }}>
            {hasPrice && <UpdatedAt ts={q.updatedAt} now={s.now} stale={stale} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <RangeSelector value={range} onChange={(r) => { setRange(r); track("chart_range_changed", { asset_id: a.id, range: r }); }} />
            </div>
          </div>
          {!hasPrice || s.lab.chartFail ? (
            <div className="tile" style={{ height: 180, display: "grid", placeItems: "center", textAlign: "center" }}>
              <span className="muted hstack"><Icon name="alert" size={18} />{t.chartUnavailable}</span>
            </div>
          ) : chartLoading || !s.ready ? (
            <div style={{ height: 180, display: "grid", placeItems: "center" }} role="status">
              <span className="small muted">{t.chartLoading}</span>
            </div>
          ) : (
            <FullChart
              values={values}
              onScrub={setScrub}
              summary={t.chartSummary(a.symbol, spokenChange(((values[values.length - 1] - first) / first) * 100), range === "1D" ? "past day" : RANGE_LABEL[range])}
            />
          )}
        </section>

        {/* YOUR BALANCE data block (Crypto.com) */}
        {h && hasPrice && (
          <section className="section">
            <h2 className="label">Your balance</h2>
            <div className="between" style={{ marginTop: 6, alignItems: "flex-end" }}>
              <div>
                <p className="title"><Money value={h.quantity * q.price} /></p>
                <p className="small muted num" style={{ marginTop: 2 }}>{qty(h.quantity, a.symbol)}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="label" style={{ marginBottom: 4 }}>{t.totalReturn}</p>
                <PriceChange pctValue={((h.quantity * q.price - h.costBasis) / h.costBasis) * 100} abs={h.quantity * q.price - h.costBasis} className="small" />
              </div>
            </div>
          </section>
        )}

        {/* Register module */}
        {a.type === "meme" ? (
          <section className="section">
            {a.risks.length > 0 && (
              <div className="hstack" style={{ flexWrap: "wrap", gap: 8 }}>
                {a.risks.slice(0, 3).map((r) => (
                  <span key={r} className="hstack small" style={{ gap: 6, padding: "6px 10px", borderRadius: 999, background: "var(--warn-tint)" }}>
                    <span style={{ color: "var(--warn)", display: "inline-grid" }}><Icon name="alert" size={14} /></span>{RISK_LABEL[r]}
                  </span>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="section card" aria-labelledby="own">
            <h2 id="own" className="label">{t.whatYouOwn}</h2>
            <p style={{ marginTop: 8 }}>{a.ownership!.summary}</p>
            <p className="small muted" style={{ marginTop: 6 }}>{t.underlying}: {a.underlying}</p>
          </section>
        )}

        {/* Key stats as a divided strip (Crypto.com) */}
        <section className="section" aria-labelledby="ks">
          <h2 id="ks" className="h-section" style={{ marginBottom: 10 }}>{t.stats}</h2>
          <dl className="stats wrap">
            {a.marketCap !== undefined && <div><dt>{t.marketValue}</dt><dd className="num">{compact(a.marketCap)}</dd></div>}
            {a.volume24h !== undefined && <div><dt>{t.volume}</dt><dd className="num">{a.type === "stock" ? `${compactNum(a.volume24h)} sh` : compact(a.volume24h)}</dd></div>}
            {a.supply !== undefined && <div><dt>{t.supply}</dt><dd className="num">{compactNum(a.supply)}</dd></div>}
            <div><dt>{t.listed}</dt><dd>{a.listedDaysAgo <= 30 ? `${a.listedDaysAgo} days ago` : new Date(s.now - a.listedDaysAgo * 864e5).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</dd></div>
          </dl>
        </section>

        {/* Layer 3 — progressive disclosure as nav rows (Crypto.com) */}
        <section className="section nav-list">
          {a.type === "stock" && (
            <>
              <button className="nav-row" onClick={() => openSheet("own")}>
                <span className="nr-ico"><Icon name="shield" size={16} /></span>
                <span className="nr-label">{t.rights}</span><Icon name="chevron" size={18} />
              </button>
              <div className="nav-row" style={{ cursor: "default" }}>
                <span className="nr-ico"><Icon name="clock" size={16} /></span>
                <span className="nr-label">Trading hours</span>
                <span className="nr-value">{a.session === "open" ? "Open now" : a.session === "extended" ? "Extended hours" : "Closed"}</span>
              </div>
            </>
          )}
          <button className="nav-row" onClick={() => openSheet("about")}>
            <span className="nr-ico"><Icon name="info" size={16} /></span>
            <span className="nr-label">{t.about} {a.name}</span><Icon name="chevron" size={18} />
          </button>
          <button className="nav-row" onClick={() => openSheet("risks")}>
            <span className="nr-ico"><Icon name="alert" size={16} /></span>
            <span className="nr-label">{t.risks}</span>
            {a.risks.length > 0 && <span className="nr-value">{a.risks.length}</span>}
            <Icon name="chevron" size={18} />
          </button>
        </section>
      </div>

      {/* Sticky trade dock */}
      <div className="dock">
        {!q.available ? (
          <div className="stack-8">
            <Banner tone="warn"><strong>{t.unavailable}</strong><br /><span className="muted">{t.unavailableWhy}</span></Banner>
          </div>
        ) : a.session === "closed" ? (
          <Banner tone="info" icon="clock">{t.session.closed}</Banner>
        ) : s.lab.offline ? (
          <button className="btn btn-primary btn-block" disabled>{t.offlineCta}</button>
        ) : h ? (
          <div className="dock-row">
            <button className="btn btn-primary" disabled={!canTrade} onClick={() => startTrade("buy")}>{t.buy}</button>
            <button className="btn btn-secondary" disabled={!canTrade} onClick={() => startTrade("sell")}>{t.sell}</button>
          </div>
        ) : (
          <button className="btn btn-primary btn-block" disabled={!canTrade} onClick={() => startTrade("buy")}>{t.buy} {a.symbol}</button>
        )}
      </div>

      {/* Sheets */}
      <Sheet open={sheet === "about"} onClose={() => setSheet(null)} title={`${t.about} ${a.name}`}>
        <p className="muted">{a.description}</p>
        {a.underlying && <p className="small" style={{ marginTop: 12 }}>{t.underlying}: {a.underlying}</p>}
      </Sheet>

      <Sheet open={sheet === "risks"} onClose={() => setSheet(null)} title={t.risks}>
        <p className="muted">{a.risks.length ? t.riskIntro : t.noRisks}</p>
        <ul className="stack-12" style={{ marginTop: 14 }}>
          {a.risks.map((r: RiskFlag) => (
            <li key={r} className="hstack" style={{ alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: "var(--warn)", marginTop: 2 }}><Icon name="alert" size={18} /></span>
              <span><strong>{RISK_LABEL[r]}</strong><br /><span className="muted small">{RISK_DETAIL[r]}</span></span>
            </li>
          ))}
          {a.type === "stock" && (
            <li className="hstack" style={{ alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: "var(--warn)", marginTop: 2 }}><Icon name="shield" size={18} /></span>
              <span><strong>Issuer risk</strong><br /><span className="muted small">If the issuer runs into trouble, your token could lose value even if the company&apos;s shares don&apos;t.</span></span>
            </li>
          )}
        </ul>
      </Sheet>

      {a.ownership && (
        <Sheet open={sheet === "own"} onClose={() => setSheet(null)} title={t.whatYouOwn}>
          <p>{a.ownership.summary}</p>
          <dl style={{ marginTop: 12 }}>
            <div className="kv"><dt>{t.issuer}</dt><dd style={{ fontWeight: 500, maxWidth: "60%" }}>{a.ownership.issuer}</dd></div>
            <div className="kv"><dt>{t.voting}</dt><dd style={{ fontWeight: 500, maxWidth: "60%" }}>{a.ownership.voting ? t.votingYes : t.votingNo}</dd></div>
            <div className="kv"><dt>{t.dividends}</dt><dd style={{ fontWeight: 500, maxWidth: "60%" }}>{a.ownership.dividends}</dd></div>
            <div className="kv"><dt>{t.redemption}</dt><dd style={{ fontWeight: 500, maxWidth: "60%" }}>{a.ownership.redemption}</dd></div>
            <div className="kv"><dt>{t.priceRef}</dt><dd style={{ fontWeight: 500, maxWidth: "60%" }}>{a.ownership.priceReference}</dd></div>
          </dl>
          <p className="small faint" style={{ marginTop: 12 }}>Illustrative terms. Final wording to be confirmed by legal.</p>
        </Sheet>
      )}

      <Sheet
        open={sheet === "intro"} onClose={() => setSheet(null)}
        title={a.type === "meme" ? tc.firstMemeTitle : tc.firstStockTitle}
        footer={<button className="btn btn-primary btn-block" onClick={() => { s.markIntroSeen(a.type); setSheet(null); setTimeout(() => startTradeAfterIntro(), 0); }}>{tc.understand}</button>}
      >
        <ul className="stack-12">
          {(a.type === "meme" ? tc.firstMemeBody : tc.firstStockBody).map((line) => (
            <li key={line} className="hstack" style={{ alignItems: "flex-start", gap: 10 }}>
              <span className={`reg-${a.type}`} style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: "var(--chip-fg)", flex: "none" }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Sheet>
    </main>
  );

  function startTradeAfterIntro() {
    track("buy_started", { asset_id: a!.id, type: a!.type });
    s.setDraft({ assetId: a!.id, side: "buy", amount: "", unit: "usd" });
    router.push(`/trade/${a!.id}/buy`);
  }
}
