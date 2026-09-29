# Delta

A mobile-first prototype for trading meme tokens and tokenized stocks. Next.js 16, all data mocked.

```bash
npm install
npm run dev     # http://localhost:3000, best viewed at phone width
```

## Where things are

| Path | What |
|---|---|
| `docs/design-audit.md` | Current design direction: Crypto.com components + system, Trust Wallet branding, Inter, Lucide |
| `docs/design-language.md` | Earlier "Two Registers" brief (superseded) |
| `docs/DECISIONS.md` | Placeholder answers to the PRD's open questions (§25). Needs product/legal sign-off |
| `src/lib/config.ts` | Product rules: fee, material-move threshold, minimum order, presets |
| `src/content/copy.ts` | Every UI string and the glossary |
| `src/lib/store.tsx` | App state, mock quotes, orders, State lab |
| `src/lib/data.ts` | Mock assets, including a duplicate `COIN` symbol |
| `src/lib/analytics.ts` | PRD §24 UX events (`window.__deltaEvents`) |
| `src/components/` | Shared component system (PRD §17) |

## State lab

**Profile → State lab** forces each PRD state: offline, stale prices, slow load, chart/search/trending failure, paused asset, missing price, the next order's outcome (completed / pending / failed), and a price move during Review (+0.4% is quiet, +3.8% forces re-review).
