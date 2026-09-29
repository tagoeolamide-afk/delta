export type AssetType = "meme" | "stock";

export type RiskFlag = "volatile" | "new" | "limited-history" | "low-liquidity" | "concentrated";

export type Session = "open" | "extended" | "closed";

export interface Ownership {
  /** One plain sentence: what the user actually holds. */
  summary: string;
  issuer: string;
  structure: "direct" | "backed" | "exposure";
  voting: boolean;
  dividends: string;
  redemption: string;
  priceReference: string;
}

export interface Asset {
  id: string; // unique — never the symbol
  symbol: string;
  name: string;
  type: AssetType;
  /** Hex background for the deterministic logo placeholder when no logo exists. */
  logoHue: number;
  price: number;
  change24h: number; // percent
  marketCap?: number;
  volume24h?: number;
  supply?: number;
  listedDaysAgo: number;
  description: string;
  risks: RiskFlag[];
  /** Why this token exists / what it references (disambiguation line). */
  identityNote?: string;
  // stock-only
  underlying?: string;
  session?: Session;
  ownership?: Ownership;
  /** Seed for deterministic chart generation. */
  seed: number;
  volatility: number;
  trendingRank?: number;
}

export interface Holding {
  assetId: string;
  quantity: number;
  costBasis: number; // total USD paid incl. fees
  todayOpenValue?: number;
}

export type TradeSide = "buy" | "sell";

export type OrderStatus = "completed" | "pending" | "failed" | "unknown";

export interface Order {
  id: string;
  assetId: string;
  side: TradeSide;
  usd: number; // buy: what you pay (incl fee). sell: what you receive (after fee)
  quantity: number;
  price: number;
  fee: number;
  status: OrderStatus;
  createdAt: number;
}

export type Range = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";
