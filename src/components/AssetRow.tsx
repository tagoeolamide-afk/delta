"use client";

import Link from "next/link";
import type { Asset } from "@/lib/types";
import { useStore } from "@/lib/store";
import { AssetLogo, IdentityStack } from "./identity";
import { PriceChange, PriceText, MiniChart } from "./market";
import { series } from "@/lib/data";
import { track } from "@/lib/analytics";

/**
 * The Asset Card Standard (PRD §16): logo · name · symbol · type · price · movement.
 * `end` lets holdings show value/return instead of price.
 */
export function AssetRow({ asset, rank, source, spark = false, end, href, onSelect }: {
  asset: Asset; rank?: number; source: string; spark?: boolean; end?: React.ReactNode; href?: string; onSelect?: () => void;
}) {
  const { quote } = useStore();
  const q = quote(asset.id);
  return (
    <Link
      href={href ?? `/asset/${asset.id}`}
      className="row row-link"
      style={rank ? { gridTemplateColumns: "auto auto 1fr auto" } : undefined}
      onClick={() => { track("asset_card_selected", { asset_id: asset.id, source }); onSelect?.(); }}
    >
      {rank !== undefined && <span className="rank" aria-label={`Rank ${rank}`}>{rank}</span>}
      <AssetLogo asset={asset} />
      <IdentityStack asset={asset} />
      <span className={`row-end${spark ? " has-spark" : ""}`}>
        {/* Decorative: hidden on narrow screens so identity never truncates first (PRD §20) */}
        {spark && isFinite(q.price) && <MiniChart values={series(asset.seed, asset.volatility, q.price, q.change24h, "1D").filter((_, i) => i % 4 === 0)} up={q.change24h >= 0} />}
        <span style={{ display: "grid", justifyItems: "end", gap: 2 }}>
          {end ?? (isFinite(q.price) ? (
            <>
              <PriceText value={q.price} className="v" />
              <PriceChange pctValue={q.change24h} className="small" />
            </>
          ) : <span className="small muted">Price unavailable</span>)}
        </span>
      </span>
    </Link>
  );
}
