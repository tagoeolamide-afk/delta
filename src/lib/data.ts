import type { Asset, Ownership, Range } from "./types";

/**
 * MOCK DATA — illustrative only. Prices, issuers and ownership terms are
 * placeholders; see docs/DECISIONS.md.
 */

function ownership(company: string): Ownership {
  return {
    summary: `A token that tracks one ${company} share. You don't own the share directly.`,
    issuer: "Example Issuer Ltd. (third party, not the company)",
    structure: "backed",
    voting: false,
    dividends: "Paid to you in cash, after the issuer receives them.",
    redemption: "You can't exchange the token for the actual share in this app.",
    priceReference: `Tracks the price of 1 ${company} share. Prices can differ slightly, especially outside market hours.`,
  };
}

export const ASSETS: Asset[] = [
  {
    id: "doge", symbol: "DOGE", name: "Dogecoin", type: "meme", logoHue: 42,
    price: 0.1775, change24h: 8.24, marketCap: 26.1e9, volume24h: 1.24e9, supply: 146.8e9,
    listedDaysAgo: 900, seed: 11, volatility: 0.035, trendingRank: 2,
    description: "Dogecoin started in 2013 as a joke based on the Shiba Inu “doge” meme. It has no issuer and no underlying business.",
    risks: ["volatile"],
  },
  {
    id: "pepe", symbol: "PEPE", name: "Pepe", type: "meme", logoHue: 118,
    price: 0.00000958, change24h: -7.22, marketCap: 4.03e9, volume24h: 612e6, supply: 420.69e12,
    listedDaysAgo: 540, seed: 23, volatility: 0.05, trendingRank: 4,
    description: "A meme token based on the Pepe the Frog character. Its price is driven by market attention rather than any product.",
    risks: ["volatile", "concentrated"],
  },
  {
    id: "wif", symbol: "WIF", name: "dogwifhat", type: "meme", logoHue: 20,
    price: 0.5454, change24h: -8.9, marketCap: 545e6, volume24h: 188e6, supply: 998.9e6,
    listedDaysAgo: 300, seed: 37, volatility: 0.055,
    description: "A meme token featuring a dog wearing a knitted hat. It trades mostly on community interest.",
    risks: ["volatile"],
  },
  {
    id: "bonk", symbol: "BONK", name: "Bonk", type: "meme", logoHue: 30,
    price: 0.00001487, change24h: 12.61, marketCap: 1.16e9, volume24h: 301e6, supply: 88e12,
    listedDaysAgo: 420, seed: 41, volatility: 0.05, trendingRank: 3,
    description: "A community meme token with a dog mascot, first given away to early community members.",
    risks: ["volatile"],
  },
  {
    id: "glub", symbol: "GLUB", name: "Glub the Extremely Determined Pufferfish", type: "meme", logoHue: 190,
    price: 0.0000412, change24h: 1284.5, marketCap: 4.1e6, volume24h: 2.9e6,
    listedDaysAgo: 6, seed: 53, volatility: 0.12, trendingRank: 1,
    description: "A new meme token listed this week. Very little trading history exists, and a few wallets hold most of the supply.",
    risks: ["volatile", "new", "limited-history", "low-liquidity", "concentrated"],
  },
  {
    id: "coin-dog", symbol: "COIN", name: "Coin Dog", type: "meme", logoHue: 330,
    price: 0.0031, change24h: 3.1, marketCap: 3.1e6, volume24h: 410e3,
    listedDaysAgo: 22, seed: 61, volatility: 0.08,
    identityNote: "Meme token. Not related to Coinbase.",
    description: "A small meme token that shares its symbol with the Coinbase tokenized stock. Check the name and type before you trade.",
    risks: ["volatile", "new", "low-liquidity"],
  },
  {
    id: "aapl", symbol: "AAPL", name: "Apple", type: "stock", logoHue: 220,
    price: 246.39, change24h: 1.12, marketCap: 3.7e12, volume24h: 48e6,
    listedDaysAgo: 400, seed: 71, volatility: 0.012, session: "open",
    underlying: "Apple Inc. (NASDAQ: AAPL)", ownership: ownership("Apple Inc."),
    description: "Apple designs and sells iPhone, Mac and other devices, plus services such as the App Store.",
    risks: [],
  },
  {
    id: "nvda", symbol: "NVDA", name: "NVIDIA", type: "stock", logoHue: 95,
    price: 181.07, change24h: -2.35, marketCap: 4.4e12, volume24h: 210e6,
    listedDaysAgo: 400, seed: 83, volatility: 0.022, session: "extended", trendingRank: 5,
    underlying: "NVIDIA Corp. (NASDAQ: NVDA)", ownership: ownership("NVIDIA Corp."),
    description: "NVIDIA makes graphics processors and chips used for gaming, data centers and AI.",
    risks: [],
  },
  {
    id: "tsla", symbol: "TSLA", name: "Tesla", type: "stock", logoHue: 0,
    price: 412.3, change24h: 4.07, marketCap: 1.33e12, volume24h: 96e6,
    listedDaysAgo: 400, seed: 97, volatility: 0.03, session: "open", trendingRank: 6,
    underlying: "Tesla, Inc. (NASDAQ: TSLA)", ownership: ownership("Tesla, Inc."),
    description: "Tesla makes electric vehicles, batteries and energy storage products.",
    risks: ["volatile"],
  },
  {
    id: "msft", symbol: "MSFT", name: "Microsoft", type: "stock", logoHue: 200,
    price: 508.12, change24h: -0.41, marketCap: 3.78e12, volume24h: 21e6,
    listedDaysAgo: 400, seed: 101, volatility: 0.01, session: "open",
    underlying: "Microsoft Corp. (NASDAQ: MSFT)", ownership: ownership("Microsoft Corp."),
    description: "Microsoft makes software, cloud services and devices, including Windows, Office and Azure.",
    risks: [],
  },
  {
    id: "coin-stock", symbol: "COIN", name: "Coinbase Global", type: "stock", logoHue: 225,
    price: 318.4, change24h: 2.66, marketCap: 81e9, volume24h: 9e6,
    listedDaysAgo: 18, seed: 113, volatility: 0.028, session: "open",
    underlying: "Coinbase Global, Inc. (NASDAQ: COIN)", ownership: ownership("Coinbase Global, Inc."),
    identityNote: "Tokenized stock. Tracks Coinbase Global, Inc.",
    description: "Coinbase runs a cryptocurrency exchange and related financial services.",
    risks: ["new"],
  },
];

export const byId = (id: string) => ASSETS.find((a) => a.id === id);

// ---------- deterministic chart series ----------

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RANGE_POINTS: Record<Range, number> = { "1D": 96, "1W": 84, "1M": 90, "3M": 90, "1Y": 104, ALL: 120 };
const RANGE_SCALE: Record<Range, number> = { "1D": 1, "1W": 2.2, "1M": 4, "3M": 6.5, "1Y": 11, ALL: 16 };
export const RANGE_LABEL: Record<Range, string> = {
  "1D": "today", "1W": "past week", "1M": "past month", "3M": "past 3 months", "1Y": "past year", ALL: "all time",
};

/** Series ending exactly at `last`; 1D change matches the 24h change. */
export function series(seed: number, volatility: number, last: number, change24h: number, range: Range): number[] {
  const n = RANGE_POINTS[range];
  const rand = mulberry32(seed * 31 + range.length * 7 + n);
  const target = range === "1D" ? change24h / 100 : (change24h / 100) * (RANGE_SCALE[range] * 0.35) + (rand() - 0.4) * volatility * RANGE_SCALE[range];
  const startLog = -Math.log(Math.max(0.05, 1 + target));
  const walk: number[] = [0];
  for (let i = 1; i < n; i++) walk.push(walk[i - 1] + (rand() - 0.5) * volatility * Math.sqrt(RANGE_SCALE[range]) * 0.6);
  const end = walk[n - 1];
  // bridge: force the walk to go from startLog to 0
  return walk.map((w, i) => {
    const t = i / (n - 1);
    const bridged = w - end * t + startLog * (1 - t);
    return last * Math.exp(bridged);
  });
}

export const RANGES: Range[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];
