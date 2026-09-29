/**
 * Delta copy deck — single source of UI strings. Rationale & alternatives:
 * docs/copy-deck.md. Glossary (never vary these):
 *   Meme Token · Tokenized Stock · Buy · Sell · Review · Watchlist · Activity ·
 *   "Available to trade" (cash) · "Available to sell" (holding) · Delta fee
 */
import { money, qty } from "@/lib/format";

export const TYPE_LABEL = { meme: "Meme Token", stock: "Tokenized Stock" } as const;
export const TYPE_PLURAL = { meme: "Meme Tokens", stock: "Tokenized Stocks" } as const;

export const RISK_LABEL = {
  volatile: "Highly volatile",
  new: "New asset",
  "limited-history": "Limited trading history",
  "low-liquidity": "Low trading activity",
  concentrated: "Few holders own most of it",
} as const;

export const RISK_DETAIL = {
  volatile: "The price can rise or fall sharply within minutes. You could lose most of what you put in.",
  new: "Listed on Delta in the last 30 days. There's less information to judge it by.",
  "limited-history": "It hasn't traded for long, so past prices tell you very little.",
  "low-liquidity": "Few people trade it. Selling quickly may mean accepting a lower price.",
  concentrated: "A small number of wallets hold most of the supply. If they sell, the price can drop fast.",
} as const;

export const nav = { home: "Home", discover: "Discover", portfolio: "Portfolio", profile: "Profile" };

export const common = {
  back: "Back",
  close: "Close",
  retry: "Try again",
  learnMore: "Learn more",
  done: "Done",
  addWatch: (s: string) => `Add ${s} to Watchlist`,
  removeWatch: (s: string) => `Remove ${s} from Watchlist`,
  addedWatch: "Added to Watchlist",
  removedWatch: "Removed from Watchlist",
  undo: "Undo",
  updated: (when: string) => `Updated ${when}`,
  stale: (when: string) => `Price last updated ${when}`,
  offline: "You're offline. Prices may be out of date.",
  backOnline: "You're back online",
  notifications: "Notifications",
  searchPlaceholder: "Search memes & tokenized stocks",
};

export const home = {
  title: "Home",
  portfolioLabel: "Your portfolio",
  emptyTitle: "Your portfolio starts here.",
  emptyBody: "Buy a meme token or tokenized stock and it will show up here.",
  emptyCta: "Explore assets",
  watchlist: "Watchlist",
  seeAll: "See all",
  trending: "Trending",
  trendingInfo: "Ranked by trading activity in the last 24 hours. Not a recommendation.",
  movers: "Market movers",
  gainers: "Gainers",
  losers: "Losers",
  explore: "Explore by type",
  memeBlurb: "Community tokens. Prices move fast.",
  stockBlurb: "Tokens that track real company shares.",
  watchEmptyTitle: "Keep an eye on assets you're interested in.",
  watchEmptyCta: "Discover assets",
};

export const discover = {
  title: "Discover",
  all: "All",
  categories: { trending: "Trending", gainers: "Gainers", losers: "Losers", new: "New", traded: "Most traded" },
  newInfo: "Listed on Delta in the last 30 days.",
  failed: (cat: string) => `${cat} isn't available right now.`,
  empty: "Nothing here yet. Try another category.",
};

export const search = {
  label: "Search assets",
  recent: "Recent searches",
  clearRecent: "Clear",
  trending: "Trending searches",
  none: (q: string) => `No assets found for “${q}”.`,
  noneHelp: "Check the spelling, or search by the full name or symbol.",
  browseMeme: "Browse Meme Tokens",
  browseStock: "Browse Tokenized Stocks",
  failed: "We couldn't load search results.",
  sameSymbol: (s: string) => `${s} matches more than one asset. Check the name and type.`,
  results: (n: number) => `${n} ${n === 1 ? "result" : "results"}`,
};

export const asset = {
  youOwn: "You own",
  notOwned: "You don't own any yet",
  ownedValue: "Value",
  totalReturn: "Total return",
  chartLoading: "Loading chart…",
  chartUnavailable: "Chart unavailable.",
  priceUnavailable: "Price unavailable right now.",
  stats: "Key stats",
  marketValue: "Market value",
  volume: "Traded (24h)",
  supply: "Supply",
  listed: "On Delta since",
  about: "About",
  risks: "Risks",
  whatYouOwn: "What you own",
  rights: "Rights & structure",
  issuer: "Issued by",
  voting: "Voting rights",
  votingNo: "No. The issuer holds the share and its votes.",
  votingYes: "Yes",
  dividends: "Dividends",
  redemption: "Exchange for the share",
  priceRef: "How the price works",
  underlying: "Tracks",
  session: {
    open: "Trading open",
    extended: "Extended hours. The price may differ from the main market.",
    closed: "Market closed. Trading reopens at the next session.",
  },
  riskIntro: "All investing involves risk. These apply to this asset in particular:",
  noRisks: "No asset-specific warnings. Prices can still go down as well as up.",
  unavailable: "Trading temporarily unavailable",
  unavailableWhy: "Trading for this asset is paused. You can still view it and keep it on your Watchlist.",
  buy: "Buy",
  sell: "Sell",
  sellNone: "You don't own this asset yet, so there's nothing to sell.",
  offlineCta: "Reconnect to trade",
  chartSummary: (sym: string, dir: string, period: string) => `${sym} is ${dir} over the ${period}.`,
};

export const trade = {
  title: (side: "buy" | "sell", s: string) => `${side === "buy" ? "Buy" : "Sell"} ${s}`,
  availableCash: (v: number) => `Available to trade: ${money(v)}`,
  availableQty: (q: number, s: string) => `Available to sell: ${qty(q, s)}`,
  max: "Max",
  toggle: (to: string) => `Enter amount in ${to}`,
  reviewBuy: "Review Buy",
  reviewSell: "Review Sell",
  minOrder: (v: number) => `Minimum ${money(v)}`,
  enterAmount: "Enter an amount",
  insufficient: (short: number) => `You need ${money(short)} more to place this trade.`,
  addFunds: "Add funds",
  editAmount: "Edit amount",
  oversell: (q: number, s: string) => `You have ${qty(q, s)} available to sell.`,
  maxSellNote: "Max sells your whole position. What you receive is an estimate until the order completes.",
  offlineReview: "Reconnect to review this trade. We kept your amount.",
  leaveTitle: "Leave trade?",
  leaveBody: "The amount you entered won't be saved.",
  keepEditing: "Keep editing",
  leave: "Leave",
  firstMemeTitle: "Before your first meme token",
  firstMemeBody: [
    "Meme tokens have no company or earnings behind them. Their price depends on attention.",
    "Prices can move a lot in minutes, in either direction.",
    "Only put in money you could afford to lose.",
  ],
  firstStockTitle: "Before your first tokenized stock",
  firstStockBody: [
    "A tokenized stock tracks a company's share price, but it isn't the share itself.",
    "It's issued by a third party, not the company. You don't get voting rights.",
    "Check “What you own” on each asset for details.",
  ],
  understand: "I understand",
};

export const review = {
  title: (side: "buy" | "sell") => (side === "buy" ? "Review Buy" : "Review Sell"),
  sentence: (side: "buy" | "sell", usd: number, sym: string, q: number) =>
    side === "buy" ? `Buy ${money(usd)} of ${sym}` : `Sell ${qty(q)} ${sym}`,
  youPay: "You pay",
  youReceive: "You receive",
  price: "Asset price",
  estQty: "Estimated quantity",
  invested: "Amount invested",
  fee: "Delta fee",
  feeInfo: "1% of the order, minimum $0.25. It's included in the total.",
  total: "Total",
  estimate: "The final quantity may differ slightly if the price moves before the order completes.",
  confirm: (side: "buy" | "sell") => `Confirm ${side === "buy" ? "Buy" : "Sell"}`,
  priceUpdated: "Price updated.",
  moved: (sym: string, p: string) => `${sym} moved ${p} while you were reviewing.`,
  movedBody: "Your totals below have changed. Check them before you confirm.",
  acknowledge: "Use updated totals",
  extended: "Extended-hours trade. The price may differ from the main market.",
};

export const result = {
  submitting: "Submitting your order…",
  submittingHelp: "Please stay on this screen.",
  checking: "Checking order status…",
  completedBuy: "Purchase complete",
  completedSell: "Sale complete",
  pending: "Order submitted",
  pendingBody: "We're waiting for final confirmation. Don't place the same order again.",
  unknown: "Status not confirmed yet",
  unknownBody: "We couldn't confirm the final status yet. Check Activity before trying again.",
  failed: "Order wasn't completed.",
  failedBody: "No money left your balance for this order.",
  viewPosition: "View position",
  viewActivity: "View activity",
  tryAgain: "Try again",
  done: "Done",
  statusChip: { completed: "Completed", pending: "Pending", failed: "Not completed", unknown: "Checking" },
};

export const portfolio = {
  title: "Portfolio",
  allocation: "Allocation",
  holdings: "Holdings",
  activity: "Recent activity",
  seeAll: "See all activity",
  excluded: (n: number) => `Total leaves out ${n} ${n === 1 ? "asset" : "assets"} without a current price.`,
  cash: "Cash",
  emptyTitle: "Your portfolio starts here.",
  emptyBody: "Your holdings, returns and activity will show up here after your first trade.",
  emptyCta: "Explore assets",
};

export const position = {
  value: "Current value",
  quantity: "Quantity",
  avg: "Average price paid",
  total: "Total return",
  today: "Today's return",
  viewAsset: "View asset details",
};

export const activity = {
  title: "Activity",
  empty: "No activity yet",
  emptyBody: "Your buys and sells will show up here.",
  bought: (s: string) => `Bought ${s}`,
  sold: (s: string) => `Sold ${s}`,
  detail: "Transaction",
  id: "Order ID",
  date: "Date",
  status: "Status",
};

export const profile = {
  title: "Profile",
  rows: ["Account", "Security", "Notifications", "Display", "Trading preferences", "Help & legal"],
  lab: "State lab",
  labBody: "Force PRD states to test the UI. Prototype only.",
  reset: "Reset demo data",
};
