"use client";

import { useStore, type Lab } from "@/lib/store";
import { ASSETS } from "@/lib/data";
import { profile as t } from "@/content/copy";
import { Icon } from "@/components/Icon";
import type { OrderStatus } from "@/lib/types";

function Toggle({ label, help, on, onChange }: { label: string; help?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="between" style={{ minHeight: 56, padding: "8px 0", cursor: "pointer" }}>
      <span><span style={{ fontWeight: 500 }}>{label}</span>{help && <><br /><span className="small muted">{help}</span></>}</span>
      <input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked)}
        style={{ width: 44, height: 26, accentColor: "var(--accent)", flex: "none" }} />
    </label>
  );
}

export default function ProfilePage() {
  const s = useStore();
  const lab = s.lab;
  const set = (patch: Partial<Lab>) => s.setLab(patch);
  const toggleIn = (key: "unavailable" | "noPrice", id: string) =>
    set({ [key]: lab[key].includes(id) ? lab[key].filter((x) => x !== id) : [...lab[key], id] } as Partial<Lab>);

  return (
    <main id="content">
      <header className="topbar" style={{ paddingLeft: "var(--gutter)" }}><h1 className="title grow">{t.title}</h1></header>
      <div className="screen">
        <ul>
          {t.rows.map((r) => (
            <li key={r}>
              <button className="row row-link" style={{ gridTemplateColumns: "1fr auto", minHeight: 56 }} onClick={() => s.toast(`${r} isn't part of this prototype`)}>
                <span style={{ fontWeight: 500 }}>{r}</span><Icon name="chevron" size={18} />
              </button>
            </li>
          ))}
        </ul>

        <section className="section card" aria-labelledby="lab">
          <h2 id="lab" className="h-section">{t.lab}</h2>
          <p className="small muted" style={{ marginTop: 4 }}>{t.labBody}</p>

          <p className="label" style={{ marginTop: 16 }}>Connection & data</p>
          <Toggle label="Offline" help="Shows the offline banner and pauses trading" on={lab.offline} onChange={(v) => set({ offline: v })} />
          <Toggle label="Stale prices" help="Prices stop updating 2 minutes ago" on={lab.stale} onChange={(v) => set({ stale: v })} />
          <Toggle label="Slow first load" help="Longer skeletons on next reload" on={lab.slowLoad} onChange={(v) => set({ slowLoad: v })} />
          <Toggle label="Charts fail" on={lab.chartFail} onChange={(v) => set({ chartFail: v })} />
          <Toggle label="Search fails" on={lab.searchFail} onChange={(v) => set({ searchFail: v })} />
          <Toggle label="Trending fails" help="Partial failure on Home and Discover" on={lab.trendingFail} onChange={(v) => set({ trendingFail: v })} />

          <p className="label" style={{ marginTop: 16 }}>Next order result</p>
          <div className="seg" role="group" aria-label="Next order result" style={{ marginTop: 8 }}>
            {(["completed", "pending", "failed"] as OrderStatus[]).map((o) => (
              <button key={o} aria-pressed={lab.outcome === o} onClick={() => set({ outcome: o })} style={{ textTransform: "capitalize" }}>{o}</button>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 6 }}>Turn on Offline while submitting to see “Checking order status…”.</p>

          <p className="label" style={{ marginTop: 16 }}>Price move on Review</p>
          <div className="seg" role="group" aria-label="Price move on Review" style={{ marginTop: 8 }}>
            {[0, 0.4, 3.8, -4.5].map((m) => (
              <button key={m} aria-pressed={lab.reviewMove === m} onClick={() => set({ reviewMove: m })}>{m === 0 ? "None" : `${m > 0 ? "+" : ""}${m}%`}</button>
            ))}
          </div>

          <p className="label" style={{ marginTop: 16 }}>Per asset</p>
          <ul>
            {ASSETS.map((a) => (
              <li key={a.id} className="between" style={{ minHeight: 48 }}>
                <span className="small"><strong>{a.symbol}</strong> <span className="muted">{a.name}</span></span>
                <span className="hstack" style={{ gap: 6 }}>
                  <button className="chip" style={{ minHeight: 34, fontSize: 12 }} aria-pressed={lab.unavailable.includes(a.id)} onClick={() => toggleIn("unavailable", a.id)}>Paused</button>
                  <button className="chip" style={{ minHeight: 34, fontSize: 12 }} aria-pressed={lab.noPrice.includes(a.id)} onClick={() => toggleIn("noPrice", a.id)}>No price</button>
                </span>
              </li>
            ))}
          </ul>

          <div className="dock-row" style={{ marginTop: 16 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => s.resetDemo("seed")}>{t.reset}</button>
            <button className="btn btn-secondary btn-sm" onClick={() => s.resetDemo("empty")}>Empty account</button>
          </div>
        </section>
      </div>
    </main>
  );
}
