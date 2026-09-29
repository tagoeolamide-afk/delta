"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { computeTrade, useStore } from "@/lib/store";
import { PRODUCT } from "@/lib/config";
import { money, pct, price as fmtPrice, qty } from "@/lib/format";
import { track } from "@/lib/analytics";
import { review as r, common } from "@/content/copy";
import type { Asset, TradeSide } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { AssetLogo, TypeLabel } from "@/components/identity";
import { Banner, Sheet } from "@/components/feedback";
import { TopBar } from "@/components/chrome";

export default function ReviewPage() {
  const { id, side } = useParams<{ id: string; side: string }>();
  const s = useStore();
  const a = s.asset(id);
  if (!a) return null;
  return <Review asset={a} side={side === "sell" ? "sell" : "buy"} />;
}

function Review({ asset: a, side }: { asset: Asset; side: TradeSide }) {
  const s = useStore();
  const router = useRouter();
  const [feeInfo, setFeeInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  /** State lab: a simulated live price that replaces the feed once it "moves". */
  const [labPrice, setLabPrice] = useState<number | null>(null);
  const warned = useRef(false);
  const draft = s.draft && s.draft.assetId === a.id && s.draft.side === side ? s.draft : null;
  const q = s.quote(a.id);

  // arrived without a draft (refresh / deep link) → back to amount entry
  useEffect(() => { if (!draft && !submitting) router.replace(`/trade/${a.id}/${side}`); }, [draft, submitting, a.id, side, router]);
  useEffect(() => { track("trade_review_viewed", { asset_id: a.id, side }); }, [a.id, side]);
  useEffect(() => {
    if (!s.lab.reviewMove || !draft) return;
    const base = draft.reviewPrice ?? q.price;
    const move = s.lab.reviewMove;
    const tm = setTimeout(() => setLabPrice(base * (1 + move / 100)), 1500);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.lab.reviewMove]);

  const reviewPrice = draft?.reviewPrice ?? q.price;
  const live = labPrice ?? q.price;
  const movePct = ((live - reviewPrice) / reviewPrice) * 100;
  const material = Math.abs(movePct) >= PRODUCT.materialMovePct;
  const quiet = !material && Math.abs(movePct) >= PRODUCT.quietMovePct;

  useEffect(() => {
    if (material && !warned.current) { warned.current = true; track("price_change_warning_seen", { asset_id: a.id, move: Math.round(movePct * 10) / 10 }); }
    if (!material) warned.current = false;
  }, [material, movePct, a.id]);

  if (!draft) return null;

  // Totals always use the live price; a material change must be acknowledged first.
  const calc = computeTrade(draft, live);
  const insufficient = side === "buy" && calc.usd > s.cash + 1e-9;
  const held = s.holding(a.id)?.quantity ?? 0;
  const oversell = side === "sell" && calc.quantity > held + 1e-12;
  const blocked = s.lab.offline || !q.available || insufficient || oversell;

  const acknowledge = () => {
    s.setDraft({ ...draft, reviewPrice: live }); // user has now seen the updated totals
    s.setLab({ reviewMove: 0 }); // one-shot in the lab; labPrice stays as the live price
  };

  const confirm = () => {
    if (submitting || blocked || material) return;
    setSubmitting(true); // prevents duplicate taps
    track("trade_confirm_pressed", { asset_id: a.id, side });
    const order = s.placeOrder(draft, live);
    // The draft is cleared by the result screen. Clearing it here would trip the
    // "no draft → back to amount" guard and strand the user mid-submit.
    router.replace(`/order/${order.id}`); // replace: Back can never land on Review again
  };

  const sentence = r.sentence(side, calc.usd, a.symbol, calc.quantity);

  return (
    <main id="content" className={`reg-${a.type}`}>
      <TopBar back title={r.title(side)} heading={false} onBack={() => router.back()} />
      <div className="screen no-tabs" style={{ paddingBottom: 170 }}>
        <div className="hstack" style={{ gap: 10 }}>
          <AssetLogo asset={a} size={32} />
          <div>
            <p className="small" style={{ fontWeight: 600 }}>{a.name} <span className="num muted" style={{ fontWeight: 500 }}>{a.symbol}</span></p>
            <TypeLabel type={a.type} />
          </div>
        </div>

        <h1 className="sentence num" style={{ marginTop: 20 }} aria-label={sentence}>
          {side === "buy" ? <>Buy <b>{money(calc.usd)}</b> of <b>{a.symbol}</b></> : <>Sell <b>{qty(calc.quantity)}</b> <b>{a.symbol}</b> for about <b>{money(calc.usd)}</b></>}
        </h1>

        {/* Price movement — never silent when material */}
        <div style={{ marginTop: 16 }} aria-live="polite">
          {material ? (
            <Banner tone="warn" role="alert">
              <strong>{r.moved(a.symbol, pct(movePct, 1))}</strong><br />
              <span className="muted">{r.movedBody}</span>
            </Banner>
          ) : quiet ? (
            <p className="small muted hstack"><Icon name="refresh" size={14} />{r.priceUpdated}</p>
          ) : null}
        </div>

        {/* Primary summary */}
        <div className="stats" style={{ marginTop: 16 }}>
          <div>
            <p className="label">{side === "buy" ? r.youPay : "You sell"}</p>
            <p className="h-section num wrap-anywhere" style={{ marginTop: 4, fontSize: "1.125rem" }}>{side === "buy" ? money(calc.usd) : qty(calc.quantity, a.symbol)}</p>
          </div>
          <div>
            <p className="label">{r.youReceive}</p>
            <p className="h-section num wrap-anywhere" style={{ marginTop: 4, fontSize: "1.125rem" }}>≈ {side === "buy" ? qty(calc.quantity, a.symbol) : money(calc.usd)}</p>
          </div>
        </div>

        {/* Details */}
        <dl style={{ marginTop: 12 }}>
          <div className="kv"><dt>{r.price}</dt><dd className="num" title={fmtPrice(live).full}>{fmtPrice(live).text}</dd></div>
          <div className="kv"><dt>{r.estQty}</dt><dd className="num">{qty(calc.quantity, a.symbol)}<span className="cap">Approximate amount</span></dd></div>
          <div className="kv"><dt>{side === "buy" ? r.invested : "Sale value"}</dt><dd className="num">{money(calc.invested)}</dd></div>
          <div className="kv">
            <dt>{r.fee}<button className="icon-btn" style={{ width: 28, height: 28 }} aria-label="About the Delta fee" onClick={() => setFeeInfo(true)}><Icon name="info" size={16} /></button></dt>
            <dd className="num">{side === "buy" ? "" : "−"}{money(calc.fee)}</dd>
          </div>
          <div className="kv" style={{ borderTop: "1px solid var(--line-2)" }}>
            <dt style={{ color: "var(--text)", fontWeight: 600 }}>{side === "buy" ? r.total : "You receive"}</dt>
            <dd className="num" style={{ fontSize: "1.1rem" }}>{money(calc.usd)}</dd>
          </div>
        </dl>

        {/* Context */}
        <div className="stack-8" style={{ marginTop: 16 }}>
          {a.session === "extended" && <Banner tone="info" icon="clock">{r.extended}</Banner>}
          {a.type === "meme" && a.risks.includes("volatile") && <Banner tone="warn">High price volatility. The price can move a lot in minutes.</Banner>}
          {insufficient && <Banner tone="error">You need {money(calc.usd - s.cash)} more at the updated price. Go back to edit the amount.</Banner>}
          {s.lab.offline && <Banner tone="warn" icon="wifiOff">{common.offline} Reconnect to confirm.</Banner>}
          <p className="small muted">{r.estimate}</p>
        </div>
      </div>

      <div className="dock">
        {material ? (
          <button className="btn btn-primary btn-block" onClick={acknowledge}>{r.acknowledge}</button>
        ) : (
          <button className="btn btn-primary btn-block" onClick={confirm} disabled={blocked || submitting} aria-busy={submitting}>
            {submitting ? "Submitting…" : r.confirm(side)}
          </button>
        )}
      </div>

      <Sheet open={feeInfo} onClose={() => setFeeInfo(false)} title={r.fee}>
        <p className="muted">{r.feeInfo}</p>
      </Sheet>
    </main>
  );
}
