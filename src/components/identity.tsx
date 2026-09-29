import type { Asset, AssetType } from "@/lib/types";
import { TYPE_LABEL } from "@/content/copy";

/** Deterministic placeholder from symbol + hue (PRD §20 "Missing logo"). */
export function AssetLogo({ asset, size = 40 }: { asset: Asset; size?: number }) {
  const h = asset.logoHue;
  const initials = asset.symbol.slice(0, 2);
  return (
    <span
      className="logo"
      aria-hidden
      style={{
        width: size, height: size, fontSize: size * 0.4,
        background: `linear-gradient(145deg, hsl(${h} 42% 46%), hsl(${(h + 24) % 360} 38% 34%))`,
      }}
    >
      {initials}
    </span>
  );
}

export function TypeLabel({ type, className = "" }: { type: AssetType; className?: string }) {
  return <span className={`type-label reg-${type} ${className}`}>{TYPE_LABEL[type]}</span>;
}

/** Name + symbol + type — the PRD minimum identity. Never truncates symbol or type. */
export function IdentityStack({ asset, nameAs = "span" }: { asset: Asset; nameAs?: "span" | "h1" }) {
  const Name = nameAs;
  return (
    <div className="row-main">
      <Name className="row-name" style={nameAs === "h1" ? { fontSize: "1.125rem" } : undefined}>{asset.name}</Name>
      <span className="row-sub">
        <span className="num" style={{ fontWeight: 600, color: "var(--ink)" }}>{asset.symbol}</span>
        <TypeLabel type={asset.type} />
      </span>
    </div>
  );
}
