/**
 * Product rules that the PRD leaves open (§25). Every value here is a
 * placeholder default — see docs/DECISIONS.md. Change them here, not in screens.
 */
export const PRODUCT = {
  name: "Delta", // working name

  /** Q7 — flat fee, included in what the user pays. */
  feeRate: 0.01,
  minFee: 0.25,

  /** Smallest order the product accepts, in USD. */
  minOrderUsd: 1,

  /** Q6 — move (absolute %) while on Review that forces a re-review. */
  materialMovePct: 2,
  /** Below this we don't even mention the update. */
  quietMovePct: 0.05,

  /** Prices older than this are shown as stale ("Price last updated …"). */
  staleAfterMs: 60_000,

  /** How long "Submitting" waits before we fall back to "Checking order status". */
  submitTimeoutMs: 2_500,

  buyPresets: [10, 25, 50] as const,
  sellPresets: [0.25, 0.5, 0.75] as const,
} as const;
