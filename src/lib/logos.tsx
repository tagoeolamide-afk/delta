import { siApple, siCoinbase, siDogecoin, siNvidia, siTesla } from "simple-icons";
import type { ReactNode } from "react";

/**
 * Real logos for listed assets. Official marks come from simple-icons (CC0),
 * except Microsoft, whose four-square mark isn't in that set and is drawn here.
 * Assets without an entry fall back to the deterministic lettered avatar
 * (PRD §20 "Missing logo").
 */
export interface Logo { bg: string; fg: string; glyph: ReactNode; scale?: number }

const si = (icon: { path: string }) => <path d={icon.path} />;

export const LOGOS: Record<string, Logo> = {
  doge: { bg: `#${siDogecoin.hex}`, fg: "#ffffff", glyph: si(siDogecoin), scale: 0.62 },
  aapl: { bg: "#ffffff", fg: "#000000", glyph: si(siApple), scale: 0.5 },
  nvda: { bg: "#000000", fg: `#${siNvidia.hex}`, glyph: si(siNvidia), scale: 0.58 },
  tsla: { bg: `#${siTesla.hex}`, fg: "#ffffff", glyph: si(siTesla), scale: 0.52 },
  "coin-stock": { bg: `#${siCoinbase.hex}`, fg: "#ffffff", glyph: si(siCoinbase), scale: 0.56 },
  msft: {
    bg: "#ffffff", fg: "none", scale: 0.5,
    glyph: (
      <>
        <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
        <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
        <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
        <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
      </>
    ),
  },
};
