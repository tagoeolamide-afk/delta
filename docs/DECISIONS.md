# Product decisions (placeholder defaults)

The PRD (§25) leaves these open. The build uses the defaults below so the flows are real.
**Every one needs product/legal sign-off before launch.** Numeric rules live in `src/lib/config.ts`;
copy lives in `src/content/copy.ts`.

| # | Question | Default used in the build | Where |
|---|---|---|---|
| 1 | What is a "tokenized stock"? | A token issued by a third party, backed 1:1 by a share held with a custodian. Illustrative only. | `data.ts` `ownership` per asset |
| 2 | Ownership/rights to show | "What you own" module: what the token is, who issues it, voting (no), dividends (cash equivalent), redemption. | Asset Detail → What you own |
| 3 | Trading outside market hours | Per-asset `session`: `open`, `extended` (tradable, with a price note) or `closed` (trading unavailable). | `data.ts`, Asset Detail, Review |
| 4 | Token vs underlying price | One-line note: "Tracks the price of 1 [company] share. Prices can differ slightly." | What you own |
| 5 | Order types | Market-style Buy/Sell only. | — |
| 6 | Move that needs re-review | ≥ 2% since Review opened → persistent banner + "Review updated total" step. Under 2% → quiet "Price updated." | `config.materialMovePct` |
| 7 | Fees before confirm | Flat 1% (min $0.25), **included** in "You pay". Review shows Amount invested, Delta fee, Total. | `config.feeRate` |
| 8 | Can a trade stay pending? | Yes. Pending is its own state and never reads as success or failure. | Trade result |
| 9 | What "Max" means for sells | Sells the full quantity held. Proceeds are estimated, and the screen says so. | Sell Amount |
| 10 | How "Trending" is explained | "Ranked by trading activity in the last 24 hours. Not a recommendation." (ⓘ sheet) | Discover |
| 11 | "New" | Listed on Delta in the last 30 days. | Discover |
| 12 | Mixed ranked lists | Allowed under "All". Every row carries its type label. | Discover |
| 13 | Sponsored assets | None in MVP. If added, they need a visible "Sponsored" label. | — |
| 14 | Portfolio return | Current value − amount paid (all fees included), all time. The period change uses the chart range. | Portfolio |
| 15 | Time ranges | 1D, 1W, 1M, 3M, 1Y, ALL | Portfolio, Asset |
| 16 | Holdings with no price | Left out of the total, with the note "Total leaves out 1 asset without a current price." | Portfolio |
| 17–19 | Risk tiers | Persistent: type label. Contextual: volatility / new / limited history chips. Detailed: Risks sheet. | Asset Detail |
| 18 | Trade-time acknowledgement | First meme-token buy shows a one-time risk sheet before amount entry. | Buy flow |
| 20 | Similar-name identity | Always show logo + full name + symbol + type label. Symbols are never merged. | Everywhere |
| 21 | Browse before account | Yes. Auth is out of scope for this build. | — |
| 22–24 | Risk education timing | One-time sheet before the first meme-token and the first tokenized-stock buy. | Buy flow |

Everything runs on mock data (`src/lib/data.ts`). The **State lab** (Profile → State lab) forces each PRD state: offline, stale, asset unavailable, chart failure, trade outcome and price movement during review.
