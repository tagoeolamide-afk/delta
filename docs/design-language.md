# Design Language Brief — "Two Registers"

Source: Mobbin iOS screens observed 2026-09-29. Values are **estimates read from screenshots**, not specs.
Primary references: Base ([asset](https://mobbin.com/screens/c96e5b50-847a-42c3-95c8-524ada6a2fa6), [home](https://mobbin.com/screens/550a046b-3147-4681-8b58-f0a25ddd970b), [empty](https://mobbin.com/screens/263fbe6d-a0c5-406b-83ee-49be3ec4a5c1), [settings](https://mobbin.com/screens/769feb4c-d36c-4681-9145-14cd3f03e2b0), [sheet](https://mobbin.com/screens/b92e3cf0-21d7-4c55-9d0c-be78903aacbb), [search](https://mobbin.com/screens/cb5aafd9-eb67-4684-b2bf-aefc15276260)), Fidelity ([review](https://mobbin.com/screens/c7a99019-d255-45f6-a396-30f9180dcecd), [positions](https://mobbin.com/screens/ceb6a911-7014-43dc-a3a7-33d7044c0644)), Origin ([allocation](https://mobbin.com/screens/7edb40e1-bbbe-4c1a-9916-f10f943d7685)).

# Design Language Summary
A calm, white-shell consumer finance UI: big confident numbers, near-black type, generous whitespace, and a single saturated action color reserved for the primary action. Structure comes from spacing and type weight rather than boxes; cards appear only for grouped data (allocation, review rows). Fidelity contributes timestamped honesty ("As of…") and sentence-style trade statements; Origin contributes the small-caps section label and the segmented allocation bar.

# Visual Style
- Overall: flat, iOS-native-feeling consumer fintech; no gradients, no glass (Base home shows a light tint only on themed action tiles).
- Personality: friendly-competent; crypto energy expressed through content (logos, tickers), not chrome.
- Tone: calm, high-contrast black on white; color is rare and meaningful.
- Density: medium-low on home/detail; medium on lists (≈56–64px rows).
- Consumer, not enterprise. Fidelity is the most enterprise-leaning reference; take only its data honesty, not its density.
- Polish: high — consistent radii, aligned numerals, restrained icons.

# Layout System
- Single column, ~16px side gutters (Base), ~20px in Origin cards.
- Header: left-aligned large title with avatar ("Home", ~22px semibold) + 1–2 icon buttons right. Detail screens: back chevron left, star/overflow right, no title.
- Footer: 5-icon tab bar without labels (Base) — **we use 4 labelled tabs per PRD**; sticky action pair sits directly above the tab bar / safe area.
- Spacing rhythm: ~4px base; common steps 8 / 12 / 16 / 24 / 32.
- Hierarchy: Balance/price (largest) → change line → chart → segmented controls → lists.
- Cards: white on warm off-white (Origin) with ~24px radius, or light-grey filled tiles (~16px radius) on white (Base action tiles). No shadows observed on either.
- Responsive: only phone screens observed; desktop behavior is **inferred** — center a ~440px column.

# Color Palette
Estimates:
- Primary (Base action blue): ~#0000FF — solid Buy / Apply buttons. *We will not reuse Base's brand blue; see Design Rules.*
- Secondary button fill: ~#EEF0F3 with near-black text (Sell, Reset All).
- Background: ~#FFFFFF (Base); warm off-white ~#F4F2EE (Origin page behind cards).
- Surface / tiles: ~#F3F4F6.
- Text: ~#0A0B0D.
- Muted text: ~#8A919E (subtitles, tickers, inactive tabs).
- Border / divider: ~#E7E9EC, 1px, used sparingly.
- Success: ~#1E9E4A (▲ +6.37%).
- Warning: not observed in Base; Fidelity uses amber sparingly — **unverified**.
- Error / negative: ~#D93A2B (Crypto.com/Public negatives, similar across refs).
- Toggle-on: ~#1A7CFF (Base settings) — distinct from the brand blue.

# Typography
- Family: a neo-grotesque sans, possibly Coinbase Sans (Base) — **guess**. Origin uses a monospaced/technical face for small-caps labels ("ASSET ALLOCATION").
- Headings: screen title ~22–24px/600; section title ~18px/600 ("Lists", "Appearance").
- Display numbers: balance ~40px/700 (Base), price ~32px/700 on detail.
- Body: 15–16px/500 for row titles; 13–14px/400 muted for subtitles.
- Labels: Origin's ~11px uppercase, wide tracking (~0.12em) section labels.
- Line height: tight on numbers (~1.1), ~1.35 on body.
- Numerals appear tabular in value columns (alignment is consistent) — **inferred**.

# Component Language
- Buttons: full-width or half-width pills (~52px tall, fully rounded). Primary = solid accent + white text. Secondary = grey fill + black text. Tertiary = outline pill (Origin "SEE ALL ASSETS", uppercase).
- Forms: settings rows with title + muted helper line + trailing value/chevron/toggle; search = grey filled pill with leading magnifier.
- Cards: grouped data only; ~24px radius, no shadow.
- Navigation: text tabs (active black 600, inactive grey), chips row (pill, light fill, leading icon), segmented control (grey track, white thumb).
- Lists: 40px circular logo + (optional tiny network badge bottom-right) + name/sub stack left; value/change stack right-aligned.
- Modals: bottom sheet, ~24px top radius, title left + ✕ right, chip options, full-width primary CTA.
- Badges: chips with grey fill for metadata ("24h Vol: $22.13M", "MCap: $15.81M").
- Toasts: small white pill at top with green check + short past-tense text ("Theme applied").
- Empty states: grey circular icon, bold title, 2-line muted body, grey pill CTA.

# Interaction Patterns
Inferred (static screens):
- Hover: n/a on iOS; for web use subtle surface darkening.
- Active/pressed: likely opacity/scale dip on pills and tiles.
- Disabled: grey fill with light-grey label (Blackbird/Public "Review order").
- Focus: not observed — must be designed (see accessibility).
- Loading: Base toast "Sending" with a small dot spinner inside the pill; no skeletons observed.
- Transitions: sheets slide from bottom with a dimmed scrim.
- Animations: none celebratory observed in Base (good).

# Iconography & Imagery
- Icons: 1.5–2px outlined line icons, rounded caps, ~22–24px.
- Illustration: minimal; Base empty state uses a single glyph in a grey circle.
- Avatars: gradient/generated circles for users.
- Product imagery: token logos are the imagery — circular, full-bleed.
- Empty-state visuals: icon-in-circle, never large illustrations.

# Copy Tone
- Buttons: short verbs — "Buy", "Sell", "Apply", "Reset All"; Fidelity names the object ("Buy SPYG").
- Labels: plain, sentence case in Base ("Local currency"); uppercase small labels in Origin.
- Errors: none observed in these refs.
- Help text: one-line, second person ("Coins you hide will appear here. You can unhide them at any time.").
- Formality: casual-professional. Base's "Looking a Little Empty in Here…" is too cute for this product.

# Design Rules
## Do
- Use a white page with near-black (~#0A0B0D) type; let large numbers carry hierarchy.
- Use exactly one saturated action color, only on the primary CTA in a view.
- Use pill buttons ~52px tall; pair primary (solid) with secondary (grey fill) side-by-side for Buy/Sell.
- Right-align values in rows with tabular numerals; left stack = identity.
- Put "As of / Updated Ns ago" under any price or balance (Fidelity).
- State trades as sentences on Review and Result ("Buy $100.00 of DOGE").
- Use a single segmented allocation bar with a legend (Origin).
- Use small uppercase tracked labels for section headers inside cards (Origin).
- Use bottom sheets with ✕ close for lightweight choices; full screens for amount/review.

**Two Registers adaptation (our product):**
- Asset type is a visible text label everywhere: `MEME TOKEN` / `TOKENIZED STOCK`, small-caps, prefixed by a 3px vertical stripe in the register color.
- Each register owns one muted hue used *only* for that stripe, the allocation segment, and the type-specific info module background tint. Never for price movement, never for CTAs.
- Same template for both types; the register swaps the info module (Meme: risk chips + token facts; Stock: "What you own" + trading hours).
- Choose our own action color (not Base blue) during color-craft.

## Do not
- Do not use drop shadows; separate with space, then 1px borders, then fills.
- Do not signal movement with color alone — always ▲/▼ + sign + % + period.
- Do not show `$0.00` for sub-cent prices — use subscript-zero notation with full precision in the accessible label.
- Do not use promo cards on Home/Portfolio (Base's "Earn cash while you zzz" is exactly the clutter to skip).
- Do not use confetti, neon, countdown timers, or cute empty-state headlines.
- Do not rely on tiny network glyphs to disambiguate assets (Base/Coinbase Wallet failure) — use the type label and full name.
- Do not use unlabelled icon-only tab bars.
