# Design System: Arthvahi (ComplianceOS)

> This file is the enforceable canon. The system ships as **`apps/web/styles/tokens.css`** (single source),
> primitives in **`apps/web/components/ui/`**, and a verification gate in **`scripts/design-audit.mjs`**
> (run it before claiming UI work done — it fails on contrast/token/focus regressions).

## 1. Identity

**"The Ledger Instrument."** Precision-first financial software for Indian SMBs and their CAs.
Trust comes from alignment, legible numerals, and zero ambiguity — not decoration.
Financial surfaces are dense by design (`VISUAL_DENSITY 7-8`); marketing surfaces get editorial room.

## 2. Type

| Role | Family | Notes |
|---|---|---|
| UI | IBM Plex Sans | `--font-ui` — set by `next/font` in `app/layout.tsx` |
| Figures | IBM Plex Mono | `--font-mono` — all financial figures, tabular numerals |
| Display | IBM Plex Serif | `--font-display` — marketing hero + statutory report letterheads ONLY |
| Devanagari | IBM Plex Sans Devanagari | `hi` locale |

Rules: serif never in UI chrome. Figures always mono + `tabular-nums`. No `Inter`, no Playfair/Syne.

## 3. Color (semantic tokens, both themes)

Light theme in `@theme`; dark via `[data-theme="dark"]` overrides. Utilities AND hand-written CSS read the same vars.

- **Action ink**: `amber` `#B45309` (5.02:1 on white) — text, links, active states; hover `amber-hover` `#92400E`
- **Decorative accent**: `amber-bright` `#D97706` — fills, chart strokes, focus tints — never text on light
- **Sidebar (always dark)**: active nav `amber-bright` (5.56:1 on `#18181B`), body `sidebar-muted`, danger `sidebar-danger`
- **States**: `success` `#047857` / `success-deep` `#065F46` (on `success-bg`); `danger` `#DC2626` / `danger-deep` `#B91C1C` (on `danger-bg`) — the *deep* tokens are for tinted backgrounds
- **Borders**: `border` decorative hairlines; `border-strong` `#8B8B93` interactive boundaries (inputs) — 3:1 minimum
- **Focus**: `focus` `#B45309` — every focus-visible ring uses it

Dark theme swaps: ink `#F59E0B` (with ink text on CTA), success `#34D399`, danger `#F87171`, borders `#2A2A30`/`#75757F`.

Rules:
- **Amber restraint** — accent ≤10% of any screen. When in doubt, neutral.
- **No raw palette utilities** — `zinc/slate/gray/stone/neutral` classes are banned (audit-enforced); use tokens.
- **Contrast**: every text pair ≥4.5:1, UI boundaries ≥3:1, in BOTH themes (audit-enforced matrix).
- **New text-size tokens must be added to `lib/utils.ts` tailwind-merge `font-size` group** — otherwise `text-white` gets dropped next to `text-ui-*` (buttons render dark-on-amber).

## 4. Shape, elevation, motion

- Radius scale: controls `4px` (`rounded-sm` / `--radius-sm`), cards `12px` (`rounded-lg`), pills full.
- **Flat by default** — surfaces flat at rest; shadows only on hover/elevation (tokens: `shadow-sm/md/lg`).
- Motion: 150ms, `ease-smooth` (`cubic-bezier(0.16,1,0.3,1)`), transform/opacity only, all gated by `prefers-reduced-motion`. Charts: animation off under reduced motion.

## 5. Components

- **PageHeader** (`components/ui/page-header.tsx`) — the only page-title block: eyebrow (≤1 per 3 sections), title, description, actions.
- **Button** — cva variants; loading state spins inline; destructive uses `danger`+white.
- **Badge** — success/danger on *deep* tokens; amber on `amber-hover` text.
- **KpiTile** — flat card, mono tabular figure, no colored top-rules.
- **DataTable** — sortable headers keyboard-accessible (tabIndex/Enter/Space), row focus ring, `stickyFirstCol` for wide ledgers.
- **Dialog** — Radix (`@radix-ui/react-dialog`), token-styled. No hand-rolled modals.
- **Charts** (`components/charts/`) — Recharts wrappers: CSS-var colors (theme-native), sr-only table fallback, Indian ₹ tooltips.
- **Announcer** (`aria-live`) — async state changes announce; no silent loading/errors.

## 6. Anti-patterns (banned)

- Fake data and fake-precise numbers (₹2.4L "dead stock", invented entry counts) — every number comes from the DB or is an honest empty state
- Toast-stub actions ("X form opened.") — buttons navigate to real screens or don't exist
- Hardcoded mock arrays in pages (`agingByFy`, `debtorsByFy`, `customers[...]`) — tRPC/API only
- `outline-none` without a `focus-visible` ring (audit-enforced)
- Eyebrows on every section; split-header layouts; 3-column identical card rows (marketing)
- Serif in UI; raw palette; `h-screen` (use `min-h-[100dvh]`); `window.addEventListener('scroll')` for effects

## 7. Verification (run before claiming UI work)

```bash
node scripts/design-audit.mjs        # contrast both themes, tokens, focus, loading — fails on ❌
pnpm --filter @complianceos/web lint && pnpm --filter @complianceos/web typecheck
BASE_URL=http://localhost:3100 pnpm --filter @complianceos/web exec playwright test e2e/a11y.spec.ts --project=chromium   # axe sweep, 0 critical/serious
node apps/web/e2e/baseline-capture.mjs --desktop-only   # visual baseline (review screenshots)
```

CI runs the audit gate and the axe sweep on every push to `main`/`prod-hardening`.

## 8. History

Supersedes the pre-2026-08 design system (Playfair/Syne/DM Mono, `#D97706` as action ink, hand-rolled modals).
The previous audit (`IMPECCABLE-AUDIT.md`) is superseded by the scripted gate above.
