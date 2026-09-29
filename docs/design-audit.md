# Design audit: Phantom · Crypto.com · Trust Wallet

> **Approved 29 Sep 2026, with one override.** Component structure goes to **Crypto.com**, replacing Phantom. Final: components + design system = Crypto.com; branding = Trust Wallet.
> Decisions: **Inter** · accent **violet-blue #5B5BF7** · **neutral charcoal-navy** field · Lucide icons · dark-first.
> The Crypto.com component kit actually built is listed in §1b. §1 is kept as the record of the original analysis.

**Purpose.** Choose one winning app for each category (component structure, design system, branding) and use the winners to restyle Delta.
**Source.** About 60 Mobbin iOS screens, 29 Sep 2026. Hex values and font names are *estimates read from screenshots*, not published specs.
**Constraints you set.** Lucide icons. Typography comes from the design-system winner. Dark-first, with light supported. Report first, then build.

---

## Scorecard

| | Phantom | Crypto.com | Trust Wallet |
|---|---|---|---|
| **Component structure** | ★ **Winner.** One kit, used consistently everywhere | Clean parts, but promo cards interrupt lists, and one leftover white confirm screen | Strong single ideas (context tile, tabs), thinner kit overall |
| **Design system** | Good dark neutrals; typography is plain | ★ **Winner.** Deepest token system: layered surfaces, one accent, typeset numbers | Clean light system, little dark-mode craft |
| **Branding** | Most distinctive (mascot, stickers), but the playful tone risks "casino" for meme tokens | Premium 3D and tiers, but heavily promotional | ★ **Winner.** One ownable color, honest voice, illustration kept to a few moments |

Each category goes to a different app. That's the balance you asked for, and each pick is also on merit (reasons below).

---

## 1. Component structure: Phantom

**Why it wins.** Phantom builds every screen from a small set of parts: grouped cards, square action tiles, sheets made of option cards, and one sticky primary button. The same parts appear on Home, Detail, Swap and every sheet. That consistency is what makes an app feel designed rather than assembled.

| Component | What Phantom does | Delta use | Ref |
|---|---|---|---|
| **Grouped card** | Related rows share one rounded surface with thin dividers (Info, Position, Swap details) | Key stats, Review details, Position, "What you own" | [Detail](https://mobbin.com/screens/fc840afe-719f-4a5d-96a8-07e5946ea5b4), [Swap](https://mobbin.com/screens/65eff589-ab7c-4289-a456-68a161f019c2) |
| **Action tile row** | 4 square tiles, icon above label (Send, Swap, Receive, Buy) | Home actions; Asset secondary actions (Watch, About, Risks) | [Home](https://mobbin.com/screens/c8f09680-22fc-48f4-9788-925b8b22cee5) |
| **Row-as-card lists** | Each token row sits on its own rounded surface | Holdings and Watchlist (lists you own) | [Home](https://mobbin.com/screens/c8f09680-22fc-48f4-9788-925b8b22cee5) |
| **Horizontal asset cards** | Large logo, symbol, price and change in a scrolling strip | Home Watchlist strip | [Home](https://mobbin.com/screens/56ce0e29-049e-4549-9cb0-ea23e0baca73) |
| **Section header + chevron** | Bold title with a trailing "›" that is the link | All Home and Portfolio sections, replacing "See all" links | [Home](https://mobbin.com/screens/d7869387-3fc4-4bf0-8823-e212637b1ccd) |
| **Change pill** | Value plus a filled, tinted % pill | Price-change display (keeps ▲/▼ + sign, per PRD) | [Detail](https://mobbin.com/screens/76e93b20-0652-4758-8e2d-4925312a1fba) |
| **Stacked pay/receive cards** | Two cards with a round swap button between them | Review summary: You pay → You receive | [Swap](https://mobbin.com/screens/1eedeab5-7e9b-47ca-abf6-854ea1cf527d) |
| **Option-card sheets** | Bottom sheet: title left, ✕ right, cards with an icon-in-circle, title and one-line description | Risk intro, "Add funds", trending info, leave-trade | [Sheet](https://mobbin.com/screens/3a0db80e-66d9-488d-a930-6858ed8e2594) |
| **Sticky primary** | Full-width button just above the nav | Buy/Sell dock, Review, Result | [Detail](https://mobbin.com/screens/2f8a4b54-f4de-4e28-985b-2dde614ed0c6) |
| **Link chips** | Small filled chips (Website, X) | About section links | [Detail](https://mobbin.com/screens/2f8a4b54-f4de-4e28-985b-2dde614ed0c6) |

**One runner-up idea to approve separately.** Trust Wallet's *context-aware primary tile*: in a row of grey tiles, one is filled with the accent, and which one depends on the situation (Fund when the wallet is empty, Buy on a token) ([Trust home](https://mobbin.com/screens/e78b612e-5689-4694-a1e8-677fb8e903e9), [Trust detail](https://mobbin.com/screens/192bed51-ebe0-4456-be4b-017f068d05f6)). It fits Phantom's tile row with no extra parts. I'd adopt it, but it's your call because it borrows from outside the winner.

**Not taken:** Phantom's icon-only tab bar (the PRD needs labelled tabs), and its social/chat widgets.

---

## 1b. Component kit as built: Crypto.com (your override)

| Component | What Crypto.com does | Delta use | Ref |
|---|---|---|---|
| **Text tabs** | Large bold section tabs with an accent underline | Discover type filter (All / Meme Tokens / Tokenized Stocks) | [Home](https://mobbin.com/screens/06870ee0-f5b1-45c8-8be0-ded0eaf89ef6) |
| **Round action buttons** | Filled accent circles, icon inside, label below | Home: Buy · Sell · Add funds · Activity | [Home](https://mobbin.com/screens/97d0bbf4-632f-4f6f-859a-6979e06ca972) |
| **Flat divided list rows** | Logo · name/ticker stack · sparkline · price/change, divider lines | All asset lists | [Markets](https://mobbin.com/screens/dbec64a5-c98d-45ab-b651-1252c7249056) |
| **Section header + "See All"** | Bold title, accent "See All" on the right | Home and Portfolio sections | [Home](https://mobbin.com/screens/06870ee0-f5b1-45c8-8be0-ded0eaf89ef6) |
| **Outlined filter chips** | Outline pills; active = accent-tinted fill + accent border | Discover categories | [Markets](https://mobbin.com/screens/3b3b09e6-5391-4e78-839c-81699edef95e) |
| **Stat strip** | 4 columns, divided, in one surface | Asset key stats, Portfolio summary | [Markets](https://mobbin.com/screens/3b3b09e6-5391-4e78-839c-81699edef95e) |
| **LIVE + range pills** | Dot + "LIVE", outlined range pills, active filled | Asset and Portfolio charts | [Detail](https://mobbin.com/screens/9b82449f-2e7c-449e-845e-64b53b89891b) |
| **Data block label** | Uppercase small label over a big value ("YOUR BALANCE") | Position, balance, totals | [Detail](https://mobbin.com/screens/9b82449f-2e7c-449e-845e-64b53b89891b) |
| **Nav row in a surface** | Icon · label · value · chevron | "What you own", About, Risks, wallet rows | [Buy](https://mobbin.com/screens/77305747-4dec-42c7-975c-0e79a8321a82) |
| **Review sentence + divided rows** | Muted sentence with bold values, flat rows, sub-captions ("Approximate amount"), ⓘ disclosure link | Review, Result | [Review](https://mobbin.com/screens/68cde2d0-aa07-4896-b671-9dee57884ce0) |
| **Amount entry** | Asset pill "Buy [ETH ▾]", accent amount, ≈ conversion, % chips above a full-width grid keypad | Buy/Sell amount | [Amount](https://mobbin.com/screens/40a6129c-5203-4898-bb06-8436ec89622b) |
| **Full-width accent CTA** | "Buy BTC", "Confirm" | All primary actions | [Detail](https://mobbin.com/screens/fbdebe42-6cac-40cc-9cff-9697f730d0f9) |

Not taken: the centre floating Trade button (the PRD fixes four tab destinations), promo carousels, and campaign rows.

---

## 2. Design system: Crypto.com (typography comes from here)

**Why it wins.** It's the only one of the three built dark-first with real depth, and it treats *numbers* as typography: dimmed decimals, small currency units, uppercase data labels. For a trading app, the number system *is* the design system.

### Surfaces (dark-first, layered, one hue family)
| Token | Observed (est.) | Role |
|---|---|---|
| Field | ~#0B1426 deep navy | Page |
| Surface 1 | ~#121E33 | Cards, list groups |
| Surface 2 | ~#1A2942 | Raised: chips, inputs, sheets |
| Line | ~#22314D | Dividers, 1px |
| Text | ~#FFFFFF / ~#8A99B4 muted | Two-tier text |
| Accent | ~#1199FA electric blue | **Every** action: buttons, active chips, links, LIVE dot |
| Gain / Loss | ~#1BB08D teal-green / ~#E6546A coral | Tuned to the navy |

Refs: [Home](https://mobbin.com/screens/06870ee0-f5b1-45c8-8be0-ded0eaf89ef6), [Detail](https://mobbin.com/screens/9b82449f-2e7c-449e-845e-64b53b89891b), [Markets](https://mobbin.com/screens/3b3b09e6-5391-4e78-839c-81699edef95e)

### Typography: the number system (the part we adopt)
| Rule | Example | Ref |
|---|---|---|
| Balance: large medium-weight numerals; **decimals dimmed**; currency unit small | $22.**12** USD | [Home](https://mobbin.com/screens/06870ee0-f5b1-45c8-8be0-ded0eaf89ef6) |
| Price: small leading currency sign, big figure, small trailing unit | $ **94,368.48** USD | [Detail](https://mobbin.com/screens/9b82449f-2e7c-449e-845e-64b53b89891b) |
| **Sentence with emphasised values:** muted prose, bright bold values | Buy **7 USD** of Ethereum over the next **5 minutes** | [Review](https://mobbin.com/screens/68cde2d0-aa07-4896-b671-9dee57884ce0) |
| Uppercase tracked data labels on every data block | TOTAL VALUE · YOUR BALANCE · ALL COINS | [Wallet](https://mobbin.com/screens/7e797bcf-0016-485b-a5cc-247b6dc975d4) |
| Tabular figures, right-aligned in every list | Market rows | [Markets](https://mobbin.com/screens/3b3b09e6-5391-4e78-839c-81699edef95e) |
| Big text tabs for top-level sections | **Home** Leverage Earn | [Home](https://mobbin.com/screens/06870ee0-f5b1-45c8-8be0-ded0eaf89ef6) |

**Typeface.** Crypto.com's UI face is a neutral grotesk with tabular figures. I can't identify it for certain from screenshots (it may be proprietary or SF Pro). The closest freely available match I'd use is **Inter** (UI) with its tabular and dimmed-decimal treatment, in weights 400/500/600 only. *One family, no serif, no mono.* The character comes from the number system above, not the font. Please confirm, or name a different face.

### Structure patterns from the system
- **Stat strip:** a 4-column divided card (Market Cap / 24h Volume / Dominance / sentiment) → Delta's asset Key stats and Portfolio header ([Markets](https://mobbin.com/screens/3b3b09e6-5391-4e78-839c-81699edef95e)).
- **LIVE dot + range pills** (outlined; the active one filled with the accent) ([Detail](https://mobbin.com/screens/9b82449f-2e7c-449e-845e-64b53b89891b)). This directly serves PRD §19, which says never to present stale prices as live.
- **Gradient-filled chart** with right-hand axis labels ([Detail](https://mobbin.com/screens/fbdebe42-6cac-40cc-9cff-9697f730d0f9)).

**Not taken:** the promo carousels, campaign rows in lists, and the leftover light confirm screen.

---

## 3. Branding: Trust Wallet

**Why it wins.** Trust's brand is built on *transparency*, which is exactly what the PRD asks for (§23: "Trust should come primarily from clarity"). Three principles carry it:

1. **One ownable color, used with discipline.** A single saturated ultramarine marks the primary action and nothing else. The rest is neutral ([Home](https://mobbin.com/screens/4c8338c3-0d7b-4ae5-b7be-fb646f9642dc)).
2. **An honest, plain voice**, including admitting when the company doesn't benefit: *"BTC fees may increase… Trust Wallet gains no benefit."* ([Detail](https://mobbin.com/screens/192bed51-ebe0-4456-be4b-017f068d05f6)). Onboarding makes one plain promise rather than hype ([Onboarding](https://mobbin.com/screens/e931942c-08da-4384-9475-81f537a5dc9f)).
3. **Illustration kept for a few moments:** iridescent 3D objects appear only on onboarding, empty states and feature intros, never in data screens ([Empty history](https://mobbin.com/screens/18c8b086-bcbe-4e2b-b15e-37341312c783), [Price alert](https://mobbin.com/screens/3bb20a14-7fab-4838-b931-5b52d17e2721)).

Plus one structural brand device that solves *our* core PRD problem:
- **The type chip beside the symbol:** "ETH [Ethereum]", "BTC · COIN | Bitcoin" ([Home](https://mobbin.com/screens/4c8338c3-0d7b-4ae5-b7be-fb646f9642dc), [Detail header](https://mobbin.com/screens/192bed51-ebe0-4456-be4b-017f068d05f6)). This becomes Delta's `DOGE [Meme Token]` / `AAPL [Tokenized Stock]` chip, replacing the stripe-and-mono label that looked "AI-designed".

**Not taken:** Trust's actual ultramarine and shield (we use the *principle*, not their assets), and the confetti success screen ([here](https://mobbin.com/screens/79a8869d-1766-41f1-9777-ec5d515cfb49)), which the PRD bans.

---

## How the three combine into Delta (proposal to approve)

| Layer | Source | Delta decision |
|---|---|---|
| Field and surfaces | Crypto.com | Layered dark field, surface 1 and surface 2. **I propose a near-neutral charcoal-navy** rather than Crypto.com's saturated navy, so Delta doesn't read as a Crypto.com clone. |
| Accent | Trust (principle) | **One** saturated, ownable accent, used only for primary actions, active selection and focus. Candidate: electric **violet-blue ~#5B5BF7**, distinct from Trust's #0500FF, Crypto.com's #1199FA and Phantom's lavender. |
| Gain / loss | Crypto.com | Teal-green / coral, tuned to the dark field, always with ▲/▼ + sign |
| Type | Crypto.com | Inter only; number system (dimmed decimals, small units, uppercase data labels, value-emphasis sentences) |
| Components | Phantom | Grouped cards, tile row, row-cards, chevron headers, option-card sheets, stacked pay/receive, sticky primary |
| Asset type | Trust | `Meme Token` / `Tokenized Stock` chips beside the symbol. Two quiet chip tints; the text always carries the meaning. |
| Voice | Trust | Plain and honest; say who benefits (e.g. "Delta earns the 1% fee shown here.") |
| Illustration | Trust (principle) | Only on empty states, risk intros and onboarding. Our own simple object art (to be drawn); none in data screens. |
| Icons | Your call | **Lucide**, 1.75px stroke, 20/24px. Matches the line weight of Phantom's icons. |
| Light theme | Derived | Re-derived from the dark tokens, not inverted |

### What changes from the current build
- **Removed:** Instrument Serif, Geist Mono, warm paper field, register stripes, hand-drawn icon set.
- **Added:** dark-first surfaces, Inter number system, Phantom component kit, type chips, Lucide.
- **Unchanged:** all flows, states, copy rules, State lab, analytics, accessibility behaviour.

### Decisions I need from you
1. **Typeface:** Inter (closest match), or a face you name?
2. **Accent:** approve the violet-blue direction, or pick a hue?
3. **Field:** neutral charcoal-navy (proposed), or true Crypto.com-style saturated navy?
4. **Trust's context-aware primary tile:** adopt or skip?
