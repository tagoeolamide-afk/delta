/**
 * Frontend UX events (PRD §24). Behaviour only — no amounts or balances are
 * sent, just ids and categorical props. Swap `sink` for a real client later.
 */
export type EventName =
  | "home_viewed" | "discover_viewed" | "category_selected" | "asset_card_selected"
  | "search_started" | "search_result_selected" | "search_zero_results"
  | "asset_viewed" | "chart_range_changed" | "watchlist_added" | "watchlist_removed"
  | "asset_info_opened" | "risk_info_opened" | "ownership_info_opened"
  | "buy_started" | "sell_started" | "trade_amount_entered" | "trade_review_viewed"
  | "price_change_warning_seen" | "trade_confirm_pressed" | "trade_success_seen"
  | "trade_pending_seen" | "trade_failure_seen" | "trade_abandoned"
  | "portfolio_viewed" | "holding_selected" | "activity_viewed" | "transaction_detail_viewed";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window { __deltaEvents?: { name: EventName; props: Props; ts: number }[] }
}

export function track(name: EventName, props: Props = {}) {
  if (typeof window === "undefined") return;
  (window.__deltaEvents ??= []).push({ name, props, ts: Date.now() });
  if (process.env.NODE_ENV !== "production") console.debug("[track]", name, props);
}
