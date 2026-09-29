const SUBSCRIPT = "₀₁₂₃₄₅₆₇₈₉";

const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Money the user spends/holds — always 2dp. */
export function money(n: number): string {
  return usd2.format(n);
}

export function signedMoney(n: number): string {
  const s = money(Math.abs(n));
  return n > 0 ? `+${s}` : n < 0 ? `−${s}` : s;
}

/**
 * Asset prices. Never shows a misleading $0.00 (PRD §20).
 * - ≥ $1: 2dp with separators
 * - ≥ $0.01: 4 significant decimals
 * - smaller: subscript-zero compact form, e.g. $0.0₅8758
 * Returns `text` for display and `full` for screen readers / title.
 */
export function price(n: number): { text: string; full: string } {
  if (!isFinite(n)) return { text: "—", full: "Price unavailable" };
  if (n >= 1) {
    const text = usd2.format(n);
    return { text, full: text };
  }
  if (n >= 0.01) {
    const text = "$" + n.toFixed(4);
    return { text, full: text };
  }
  const fixed = n.toFixed(12); // 0.000001284000
  const decimals = fixed.split(".")[1];
  const zeros = decimals.match(/^0*/)?.[0].length ?? 0;
  const sig = decimals.slice(zeros, zeros + 4).replace(/0+$/, "") || "0";
  const full = "$0." + "0".repeat(zeros) + sig;
  // Write it out in full ($0.00000953) — the PRD's example format and the only one
  // non-crypto users can read. Compress to subscript-zero only for extreme cases
  // where the full string would stop fitting (8+ zeros).
  if (zeros < 8) return { text: full, full };
  const sub = String(zeros).split("").map((d) => SUBSCRIPT[+d]).join("");
  return { text: `$0.0${sub}${sig}`, full };
}

export function pct(n: number, digits = 2): string {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-US", { minimumFractionDigits: digits > 1 && abs >= 1000 ? 1 : digits, maximumFractionDigits: abs >= 1000 ? 1 : digits });
  return (n > 0 ? "+" : n < 0 ? "−" : "") + s + "%";
}

/** Token/share quantities: up to 6 significant decimals, trimmed. */
export function qty(n: number, symbol?: string): string {
  let digits = 2;
  if (n < 1) digits = 6;
  else if (n < 100) digits = 4;
  const s = n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits });
  return symbol ? `${s} ${symbol}` : s;
}

export function compact(n: number): string {
  return "$" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}

export function compactNum(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}

export function ago(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function dateTime(ts: number): string {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function direction(n: number): "up" | "down" | "flat" {
  return n > 0 ? "up" : n < 0 ? "down" : "flat";
}

/** Spoken change, e.g. "up 8.24%". */
export function spokenChange(n: number): string {
  if (n === 0) return "unchanged";
  return `${n > 0 ? "up" : "down"} ${Math.abs(n).toFixed(2)}%`;
}
