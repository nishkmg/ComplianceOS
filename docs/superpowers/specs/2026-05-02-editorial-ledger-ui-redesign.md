# ComplianceOS Editorial Ledger UI/UX Redesign — Design Spec

> **Date:** 2026-05-02
> **Scope:** All 96 user-facing pages + 25 shared components
> **Status:** Approved, pending implementation

---

## 1. Executive Summary

This document defines the complete design system and visual direction for the ComplianceOS platform. The aesthetic is **"Editorial Ledger"** — a hybrid of Indian financial newspapers (Economic Times, Business Standard) and hand-ruled ledger books. Dense, precise, warm, and authoritative.

**Key decisions locked:**
- **Brand color:** Amber (`#D97706`) — warm, fiscal, ledger-like
- **Typography:** Playfair Display (headings) + Syne (UI) + DM Mono (numbers)
- **Grid:** Unified 12-column responsive system across all pages
- **Scope:** App (66 pages) + Auth (2 pages) + Marketing (15 pages) + Onboarding (6 steps) — no exceptions

---

## 2. Application Purpose & Audience

**ComplianceOS** is an Indian business compliance platform providing double-entry accounting, GST returns, ITR generation, payroll, inventory, and OCR document scanning.

**Primary users:**
- Business owners (small-to-medium Indian enterprises)
- Chartered Accountants (CAs) and accountants
- Payroll administrators
- Compliance officers

**UX goals by role:**
- **Owner:** Assess business health in <5 seconds (dashboard), drill into any number
- **Accountant:** Dense, scannable tables; keyboard-first navigation; print-ready reports
- **Administrator:** Consistent workflows, clear status indicators, actionable empty states

---

## 3. Screen Inventory

### 3.1 App Pages (66 pages)

| Category | Pages | UX Intent |
|----------|-------|-----------|
| **Core** | Dashboard, Journal (list/detail/new), CoA, Accounts (list/detail/new) | Command center + dense data entry |
| **Transactions** | Invoices (list/detail/new/edit/pdf/scan), Receivables (list/detail), Payments (list/new) | List → Detail → Action workflow |
| **Compliance** | GST (returns/ledger/reconciliation/payment), ITR (returns/computation/payment) | Form-heavy, status-driven, deadline-aware |
| **Operations** | Inventory (products/stock/reports), Payroll (process/reports), Employees (list/detail/new/salary) | CRUD + batch operations |
| **Reports** | Trial Balance, P&L, Balance Sheet, Cash Flow, Ledger | Print-ready, formal, strictly aligned |
| **System** | Onboarding (6 steps), Settings (fiscal-years/invoices), Audit Log (list/detail), Access Denied | Wizard, configuration, audit trail |

### 3.2 Auth Pages (2 pages)

| Page | UX Intent |
|------|-----------|
| Login | Trust-building, minimal friction, focused |
| Signup | Conversion, progressive disclosure |

### 3.3 Marketing Pages (15 pages)

| Page | UX Intent |
|------|-----------|
| Homepage | Trust, social proof, conversion |
| Features (5) | Deep-dive per module |
| Pricing | Clear tiers, no hidden costs |
| About, Blog, Contact | Brand credibility |
| Legal (4) | Compliance, transparency |

---

## 4. Design System

### 4.1 Color Palette

| Token | Hex | Usage | Never Used For |
|-------|-----|-------|---------------|
| `--color-amber` | `#D97706` | Primary CTAs, active nav, draft badges, accent borders | Body text, backgrounds, success states |
| `--color-amber-hover` | `#B45309` | Hover states | — |
| `--color-success` | `#10B981` | Posted, confirmed, balanced, positive deltas | Errors, warnings |
| `--color-success-bg` | `#D1FAE5` | Success backgrounds | — |
| `--color-danger` | `#DC2626` | Errors, voided, overdue, negative deltas | Success states |
| `--color-danger-bg` | `#FFE4E6` | Danger backgrounds | — |
| `--color-dark` | `#18181B` | Primary text, headings, sidebar bg | Backgrounds |
| `--color-mid` | `#52525B` | Secondary text, labels, inactive nav | Primary text |
| `--color-light` | `#71717A` | Tertiary text, placeholders, captions | Primary text |
| `--color-lighter` | `#D4D4D8` | Borders, dividers, disabled states | Text |
| `--color-lightest` | `#FAFAFA` | Page background | Text |
| `--color-surface` | `#FFFFFF` | Cards, inputs, table rows | Page background |
| `--color-surface-muted` | `#FAFAFA` | Subtle backgrounds, alternating rows | — |
| `--color-border` | `#E4E4E7` | Default borders | Text |
| `--color-sidebar` | `#18181B` | Dark sidebar background | — |

**Color rules:**
- Amber appears ONLY for: primary buttons, active navigation, draft status badges, accent borders, hover arrows
- Green appears ONLY for: posted/confirmed/success states, positive deltas, balanced indicators
- Red appears ONLY for: errors, voided/overdue states, negative deltas, destructive actions
- No gradients anywhere. No shadows on data tables.

### 4.2 Typography Scale

| Role | Font | Size | Weight | Line-Height | Letter-Spacing | Usage |
|------|------|------|--------|-------------|----------------|-------|
| Display XL | Playfair Display | 36px | 600 | 1.2 | -0.01em | Page titles (Dashboard, Reports) |
| Display LG | Playfair Display | 24px | 600 | 1.3 | 0 | Section headers, report titles |
| Display MD | Playfair Display | 20px | 600 | 1.3 | 0 | Card titles, sub-sections |
| Display SM | Playfair Display | 16px | 600 | 1.4 | 0 | Small headers, group labels |
| UI LG | Syne | 16px | 500 | 1.5 | 0 | Body text, form labels |
| UI MD | Syne | 14px | 400 | 1.5 | 0 | Default UI text, descriptions |
| UI SM | Syne | 13px | 400 | 1.5 | 0 | Table cells, secondary descriptions |
| UI XS | Syne | 12px | 500 | 1.5 | 0.02em | Badges, captions, overlines, labels |
| Mono LG | DM Mono | 16px | 400 | 1.4 | 0 | Large amounts, totals |
| Mono MD | DM Mono | 14px | 400 | 1.5 | 0 | Default amounts, entry numbers |
| Mono SM | DM Mono | 12px | 400 | 1.5 | 0 | Small amounts, codes, dates |

**Typography rules:**
- All monetary values: DM Mono, right-aligned, `font-variant-numeric: tabular-nums`, Indian format
- All page headings: Playfair Display
- All UI text (buttons, labels, nav): Syne
- Overlines/labels: 10–12px, uppercase, `tracking-widest`, `font-weight: 500`

### 4.3 Spacing Scale

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--space-1` | 4px | `1` | Tight gaps, icon padding |
| `--space-2` | 8px | `2` | Icon gaps, inline spacing, dense cell padding |
| `--space-3` | 12px | `3` | Compact padding, mobile gutters |
| `--space-4` | 16px | `4` | Default padding, mobile section gaps |
| `--space-5` | 24px | `6` | Section gaps, desktop gutters |
| `--space-6` | 32px | `8` | Large section spacing |
| `--space-8` | 48px | `12` | Major section breaks |
| `--space-10` | 64px | `16` | Page section padding |

**Density principle:** 10+ table rows visible without scrolling. Hairline borders (0.5px or 1px). Minimal whitespace in data-dense screens.

### 4.4 Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Badges, small buttons, filter tabs |
| `--radius-md` | 8px | Buttons, inputs, table cells |
| `--radius-lg` | 12px | Cards, modals, containers |
| `--radius-xl` | 16px | Large modals, command palette |
| `--radius-full` | 9999px | Avatars, pills |

### 4.5 Shadow Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgba(0,0,0,0.05)` | Cards, buttons |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` | Hover on cards, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` | Modals, command palette |

**Shadow rule:** No shadows on data tables. Flat surfaces only for ledger aesthetic.

---

## 5. Grid Layout System

### 5.1 App Shell Geometry

```
┌────────────────────────────────────────────────────────────┐
│  Topbar (56px)  │  fixed, full-width, z-50                │
├────────┬───────────────────────────────────────────────────┤
│        │                                                   │
│ Sidebar│  Main Content Area                                │
│ (256px)│  Desktop: width = calc(100vw - 256px)             │
│ fixed  │  Padding: 24px (p-6)                              │
│ z-40   │  Mobile: 100vw, pt-14, pb-16                      │
│        │                                                   │
└────────┴───────────────────────────────────────────────────┘
```

### 5.2 Responsive Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| **Mobile** | < 768px | Single column. Sidebar hidden. Mobile bottom nav active. Tables horizontally scroll (`overflow-x-auto`). Padding: 16px. |
| **Tablet** | 768–1024px | 2-column grids (`md:grid-cols-2`). Sidebar hidden. Padding: 24px. |
| **Desktop** | 1024–1440px | Full 12-column grid (`lg:grid-cols-12`). Sidebar visible. Content fills remaining width. Padding: 24px. |
| **Wide** | > 1440px | Same 12-column grid. Marketing container expands to 1400px. App padding remains 24px. |

### 5.3 Page-Type Grid Patterns

#### App — Dashboard
```
KPI Row:      grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6
Receivables:  grid-cols-1 md:grid-cols-3 gap-6
Main body:    grid-cols-1 lg:grid-cols-12 gap-8
  lg:col-span-8   /* Recent entries / main table */
  lg:col-span-4   /* Sidebar widgets (FY progress, quick actions, audit) */
```

#### App — List Pages (Journal, Invoices, etc.)
```
Container:    flex flex-col gap-6
If side panel:
  grid-cols-1 lg:grid-cols-12 gap-6
    lg:col-span-9  /* Table */
    lg:col-span-3  /* Summary / filters */
```

#### App — Report Pages
```
Container:    max-w-[1100px] mx-auto
Balance Sheet:
  grid-cols-1 md:grid-cols-2 gap-8
Other reports:
  Single column, centered
```

#### App — Detail Pages
```
Header:       flex flex-col sm:flex-row sm:items-end justify-between gap-4
Content:      space-y-6 (single column)
```

#### App — Form Pages
```
Layout:       grid-cols-1 lg:grid-cols-2 gap-6
Full-width:   col-span-1 lg:col-span-2
```

#### Marketing — All Pages
```
Container:    max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12
Hero:         grid-cols-1 md:grid-cols-2 gap-8 md:gap-16
Benefits:     grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6
Features:     grid-cols-1 md:grid-cols-2 gap-8 md:gap-16
Testimonials: grid-cols-1 md:grid-cols-2 gap-8
Pricing:      grid-cols-1 md:grid-cols-3 gap-8
```

#### Auth
```
Container:    max-w-[440px] mx-auto px-6
```

#### Onboarding
```
Container:    max-w-4xl mx-auto px-6 md:px-8
```

### 5.4 Grid Audit & Fixes

| Page | Current Issue | Fix |
|------|--------------|-----|
| Marketing homepage | `max-w-[1320px]`, `px-8` | `max-w-[1400px]`, `px-6 md:px-8 lg:px-12` |
| Marketing features | `max-w-[1200px]` | `max-w-[1400px]` |
| App reports | `max-w-[1000px]` | `max-w-[1100px]` |
| App onboarding | Padding inconsistent | `px-6 md:px-8` |

---

## 6. Component Primitives

### 6.1 Buttons

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-ui);
  font-size: var(--font-ui-sm);
  font-weight: 500;
  border-radius: var(--radius-md);
  border: var(--border-default) solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-amber-hover);
}

.btn-primary {
  background-color: var(--color-amber);
  color: white;
  border-color: var(--color-amber);
  box-shadow: var(--shadow-sm);
}
.btn-primary:hover {
  background-color: var(--color-amber-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

.btn-secondary {
  background-color: var(--color-surface);
  color: var(--color-mid);
  border-color: var(--color-border);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}
.btn-secondary:hover {
  border-color: var(--color-amber);
  color: var(--color-amber);
  background-color: var(--color-surface-muted);
}

.btn-ghost {
  background-color: transparent;
  color: var(--color-mid);
  border-color: transparent;
  font-weight: 500;
}
.btn-ghost:hover {
  background-color: var(--color-surface-muted);
  color: var(--color-dark);
}
```

### 6.2 Inputs

```css
.input-field {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-ui);
  font-size: var(--font-ui-sm);
  border: var(--border-default) solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}
.input-field:focus {
  outline: none;
  border-color: var(--color-amber);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
}

.input-mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
```

### 6.3 Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  letter-spacing: 0.02em;
}

.badge-amber   { background-color: rgba(217, 119, 6, 0.1); color: var(--color-amber); }
.badge-success { background-color: var(--color-success-bg); color: var(--color-success); }
.badge-danger  { background-color: var(--color-danger-bg); color: var(--color-danger); }
.badge-gray    { background-color: var(--color-lighter); color: var(--color-mid); }
```

### 6.4 Cards

```css
.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}
.card:hover { box-shadow: var(--shadow-md); }
```

**Card rule:** Data tables wrapped in cards should NOT have hover shadow. Only summary/action cards.

### 6.5 Tables

```css
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: var(--font-ui-md);
}
.table th {
  text-align: left;
  font-weight: 600;
  font-size: var(--font-ui-xs);
  color: var(--color-light);
  padding: var(--space-3);
  border-bottom: 2px solid var(--color-border);
  background-color: var(--color-surface);
}
.table td {
  padding: var(--space-3);
  border-bottom: var(--border-default) solid var(--color-border);
  transition: background-color 0.15s ease;
}
.table tbody tr:hover td { background-color: var(--color-surface-muted); }
.table tr:last-child td { border-bottom: none; }

.table-dense th, .table-dense td { padding: var(--space-2) var(--space-3); font-size: 13px; }
```

### 6.6 Filter Tabs

```css
.filter-tabs {
  display: flex;
  gap: var(--space-2);
  background-color: var(--color-surface-muted);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}
.filter-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-ui);
  font-size: var(--font-ui-sm);
  font-weight: 500;
  border-radius: var(--radius-sm);
  color: var(--color-mid);
  cursor: pointer;
  transition: all 0.2s ease;
}
.filter-tab:hover { color: var(--color-dark); }
.filter-tab.active {
  background-color: var(--color-surface);
  color: var(--color-dark);
  box-shadow: var(--shadow-sm);
}
```

### 6.7 KPI Tiles

```css
.kpi-tile {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}
.kpi-tile:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.kpi-tile::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background-color: var(--color-border);
  transition: background-color 0.2s ease;
}
.kpi-tile.amber::before   { background-color: var(--color-amber); }
.kpi-tile.success::before { background-color: var(--color-success); }
.kpi-tile.danger::before  { background-color: var(--color-danger); }
.kpi-tile.neutral::before { background-color: var(--color-light); }
```

---

## 7. State Patterns

### 7.1 Loading States

**Rule:** No generic spinners. Use skeleton screens with hairline borders and muted backgrounds.

```
Skeleton: pulse animation, bg-lighter rounded
TableSkeleton: header row + 8 data rows, hairline borders between rows
CardSkeleton: card shape with header + 3 lines
KPISkeleton: 4 tiles with value + label placeholders
```

### 7.2 Empty States

```
Container: .card with centered content
Icon:      muted color, 48px
Title:     Playfair Display 20px, text-dark
Desc:      Syne 13px, text-mid
CTA:       .btn-primary (amber) — e.g. "Create your first journal entry"
```

### 7.3 Error States

```
Container: danger-bg background, danger text
Title:     Syne 14px, font-weight 600, danger color
Message:   Syne 13px, text-mid
Action:    Retry button (.btn-secondary) or Contact Support link
```

### 7.4 Print Styles (Reports)

```css
@media print {
  nav, header, footer, .btn, button, .filter-tab { display: none !important; }
  .card, .report-section { page-break-inside: avoid; }
  body { background: white; font-size: 11pt; line-height: 1.4; }
  .report-container { padding: 0; box-shadow: none; border: none; }
}
```

---

## 8. Accessibility Requirements

1. **Focus management:** All interactive elements have `focus-visible` styles (amber ring)
2. **Heading hierarchy:** Single `<h1>` per page, logical `<h2>` → `<h3>` order
3. **ARIA labels:** All icon buttons, navigation groups, status badges
4. **Tables:** Proper `<thead>`, `<th scope="col">`, `<caption>` where applicable
5. **Color + icon:** Status never indicated by color alone — always paired with text/icon
6. **Keyboard shortcuts:** ⌘K (command palette), N (new entry), / (focus search), Esc (close)
7. **Command palette:** Focus trap, keyboard navigation, announced to screen readers
8. **Modals:** Focus trap, close on Esc, return focus to trigger on close

---

## 9. Files to Create / Modify

### New Dependencies
- `@fontsource/playfair-display` (400, 600, 700)
- `@fontsource/syne` (400, 500, 600, 700)
- Remove: `@fontsource/outfit`, `@fontsource/inter`

### Foundation Files
- `apps/web/package.json`
- `apps/web/app/globals.css`
- `apps/web/tailwind.config.ts`
- `apps/web/app/layout.tsx`

### Component Files (all in `apps/web/components/ui/`)
- `index.ts`, `balance-bar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `data-table.tsx`, `dialog.tsx`, `empty-state.tsx`, `error-state.tsx`, `form-field.tsx`, `icon.tsx`, `input.tsx`, `kpi-tile.tsx`, `label.tsx`, `skeleton.tsx`, `skip-link.tsx`

### App Shell Files
- `apps/web/app/(app)/layout.tsx`
- `apps/web/components/app/sidebar.tsx`
- `apps/web/components/app/topbar.tsx`
- `apps/web/components/app/mobile-nav.tsx`
- `apps/web/components/command-palette.tsx`

### Page Files (96 pages — see full inventory in §3)
All `page.tsx`, `layout.tsx`, and `error.tsx` files across `(app)`, `(auth)`, and `(marketing)`.

### Marketing Component Files
- `apps/web/components/marketing/nav.tsx`
- `apps/web/components/marketing/footer.tsx`
- `apps/web/components/marketing/button.tsx`
- `apps/web/components/marketing/feature-card.tsx`
- `apps/web/components/marketing/pricing-card.tsx`
- `apps/web/components/marketing/testimonial-card.tsx`
- `apps/web/components/marketing/faq-item.tsx`
- `apps/web/components/marketing/section-label.tsx`
- `apps/web/components/marketing/team-card.tsx`
- `apps/web/components/marketing/mobile-nav.tsx`

---

## 10. Verification Checklist

- [ ] **Typography:** Playfair Display headings, Syne UI, DM Mono numbers on every page
- [ ] **Color:** Amber only for CTAs/active/draft, Green for posted, Red for errors
- [ ] **Numbers:** Indian format (₹ 1,00,000.00), right-aligned, DM Mono, tabular-nums
- [ ] **Grid:** Responsive 12-column system, consistent padding, no broken layouts at any breakpoint
- [ ] **Density:** Tables show 10+ rows without scroll, hairline borders, no excessive whitespace
- [ ] **Shadows:** No shadows on data tables, minimal shadows on cards only
- [ ] **Loading:** Skeleton screens on all data-dependent pages, no generic spinners
- [ ] **Empty:** Centered card with Playfair title, Syne description, amber CTA button
- [ ] **Error:** Danger color, actionable message, retry button or support link
- [ ] **Print:** Reports hide nav/actions, page breaks respected, colors preserved
- [ ] **Mobile:** Sidebar collapses to hamburger, tables horizontally scroll, grids stack vertically
- [ ] **Accessibility:** Focus-visible on all interactives, ARIA labels, heading hierarchy, keyboard shortcuts
- [ ] **No placeholders:** No "TODO", "TBD", or unfinished comments left in code

---

## 11. Change Summary

| Change | From | To | Reason |
|--------|------|-----|--------|
| Brand color | Indigo `#4F46E5` mixed with Amber | Pure Amber `#D97706` | Eliminate collision, establish warm fiscal identity |
| Heading font | Outfit | Playfair Display | Editorial newspaper aesthetic |
| UI font | Inter | Syne | Distinctive, modern, geometric |
| Number font | DM Mono | DM Mono | Preserved — already correct |
| Grid container (marketing) | `max-w-[1320px]` | `max-w-[1400px]` | Consistent wide-screen experience |
| Grid padding (marketing) | `px-8` | `px-6 md:px-8 lg:px-12` | Responsive breathing room |
| Report container | `max-w-[1000px]` | `max-w-[1100px]` | Better readability on wide screens |
| Table borders | Inconsistent | Hairline `0.5px–1px`, consistent `border-border` | Ledger aesthetic |
| Shadows on tables | Present on some | Removed entirely | Flat ledger surfaces |
| Loading spinners | Generic CSS spinners | Skeleton screens | Editorial aesthetic, no decoration |

---

*End of Design Spec*
