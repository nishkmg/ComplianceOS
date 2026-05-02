# ComplianceOS Element-Level Layout Audit

> **Date:** 2026-05-02
> **Scope:** All 96 pages + shared components
> **Method:** Automated pattern analysis + manual sampling

---

## Summary

**Critical Issues Found:** 11 categories of layout inconsistency
**Files Affected:** 47+ files
**Total Violations:** 220+ instances

The codebase suffers from **accumulated drift** — multiple developers wrote pages over time without a unified layout specification. The result is a patchwork of similar-but-different patterns that undermine the "Editorial Ledger" aesthetic.

---

## 1. Page Header Inconsistencies

### Problem
Page headers (the top section of every list/detail page) use **5 different patterns** for the same structural element.

### Patterns Found

| Pattern | Files | Overline | Title Size | Subtitle | Action Buttons |
|---------|-------|----------|------------|----------|----------------|
| **A** | Journal, Invoices, Accounts, Payments | Syne 10px amber uppercase | Playfair 24px (`text-display-lg`) | Syne 13px text-mid | .btn-secondary + .btn-primary |
| **B** | Dashboard | — | Playfair 36px (`text-display-xl`) | Syne 14px text-mid | Icon button + .btn-primary |
| **C** | Payroll | — | Playfair 26px hardcoded | Syne 12px text-light | `.filter-tab.active` (wrong component) |
| **D** | GST Returns | Syne 11px amber uppercase | Playfair 36px (`text-display-xl`) | Syne 13px text-mid, `max-w-2xl` | Select + .btn-primary |
| **E** | Inventory | Syne 11px amber uppercase, `tracking-[0.15em]` | Playfair 36px (`text-display-xl`), `leading-none` | Syne 13px text-mid, `max-w-lg` | .btn-secondary + .btn-primary |
| **F** | Employees | — | Playfair 24px hardcoded (`text-lg`) | Syne 13px text-mid | Icon button + .btn-primary |
| **G** | GST Mismatches | — | Tailwind `text-2xl font-bold text-gray-900` | Tailwind `text-sm text-gray-500` | Gray button |

### Specific Violations
- `apps/web/app/(app)/payroll/page.tsx:30` — No overline, uses `text-[26px]` instead of `text-display-lg`
- `apps/web/app/(app)/employees/page.tsx:26` — No overline, uses `text-lg` instead of `text-display-lg`
- `apps/web/app/(app)/gst/reconciliation/mismatches/page.tsx:89` — Uses `text-gray-900` instead of design system
- `apps/web/app/(app)/inventory/page.tsx:27` — Overline uses `tracking-[0.15em]` instead of standard `tracking-[0.2em]`
- `apps/web/app/(app)/gst/returns/page.tsx:29` — Overline is `text-[11px]` while others use `text-[10px]`

### Fix
Standardize to **Pattern A** for all list pages:
```tsx
<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
  <div>
    <span className="text-amber-text font-ui text-[10px] uppercase tracking-[0.2em] mb-1 block">
      {overline}
    </span>
    <h1 className="font-display text-display-lg text-dark leading-tight">{title}</h1>
    <p className="font-ui text-[13px] text-mid mt-1">{subtitle}</p>
  </div>
  <div className="flex gap-3">
    {/* .btn-secondary + .btn-primary */}
  </div>
</div>
```

---

## 2. Action Button Inconsistencies

### Problem
Primary action buttons (amber CTAs) have **8 different class combinations** across the codebase.

### Patterns Found

| # | Pattern | Files |
|---|---------|-------|
| 1 | `bg-amber text-white px-5 py-2 text-[10px] font-ui text-[11px] uppercase tracking-widest hover:bg-amber-hover` | Journal list, Journal detail |
| 2 | `bg-amber text-white px-5 py-2 flex items-center gap-2 hover:bg-amber-hover active:scale-95` | Dashboard |
| 3 | `bg-amber text-white px-6 py-2.5 rounded font-ui text-[13px] text-sm hover:bg-amber-700` | GST returns hub |
| 4 | `bg-amber text-white px-8 py-3 font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-amber-700` | GSTR filing |
| 5 | `bg-amber text-white px-5 py-2.5 font-ui text-[13px] text-[11px] font-bold uppercase tracking-widest hover:bg-amber-hover` | New journal entry |
| 6 | `bg-amber text-white px-5 py-2 text-[12px] font-bold uppercase tracking-wider hover:bg-amber-hover` | Dashboard empty state |
| 7 | `bg-amber text-white font-ui text-[13px] text-sm px-6 py-3 rounded-md hover:bg-primary` | Inventory |
| 8 | `px-5 py-2.5 bg-amber text-white font-ui text-[13px] text-xs rounded-md hover:bg-primary` | Employees |

### Secondary Button Patterns
Secondary/outline buttons also vary:
- `border border-border px-4 py-2 text-[10px] font-ui text-[11px] uppercase tracking-widest text-mid hover:bg-surface-muted`
- `px-4 py-2 border border-border text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-surface-muted`
- `px-5 py-2.5 border border-border text-dark font-ui text-[13px] text-xs hover:bg-surface-muted`
- Some use `.btn-secondary` CSS class, some inline Tailwind

### Specific Violations
- Inconsistent `hover:bg-amber-hover` vs `hover:bg-amber-700` vs `hover:bg-primary`
- Inconsistent border-radius: `rounded-md` (most), `rounded` (GST returns), none (some)
- Inconsistent padding: px-4/px-5/px-6, py-2/py-2.5/py-3
- Inconsistent font size: text-[10px]/text-[11px]/text-[12px]/text-[13px]
- Inconsistent letter-spacing: `tracking-widest` vs `tracking-wider`

### Fix
Standardize all buttons to use the `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` CSS classes defined in `globals.css`. Remove all inline Tailwind button styling from pages.

---

## 3. Old Gray/Stone/Zinc Classes

### Problem
48+ instances of old Tailwind gray classes that bypass the design system.

### Breakdown

| Class | Count | Files |
|-------|-------|-------|
| `bg-zinc-50` | 4 | Journal new, Journal detail, Dashboard |
| `bg-zinc-800` | 3 | Dashboard (quick actions) |
| `text-zinc-400` | 1 | Dashboard |
| `text-zinc-500` | 1 | Dashboard |
| `text-zinc-100` | 1 | Dashboard |
| `bg-stone-100` | 2 | GST reconciliation |
| `hover:bg-stone-100` | 2 | GST reconciliation |
| `text-gray-900` | 1 | GST mismatches |
| `text-gray-500` | 6 | GST mismatches |
| `bg-gray-50` | 3 | GST mismatches |
| `bg-gray-600` | 1 | GST mismatches |
| `hover:bg-gray-50` | 2 | GST mismatches |
| `border-zinc-700` | 2 | Dashboard |
| `border-slate-600` | 1 | Dashboard |
| `text-slate-600` | 1 | Employees filters |

### Specific Violations
- `apps/web/app/(app)/journal/new/page.tsx:153` — `bg-zinc-50` table header
- `apps/web/app/(app)/journal/new/page.tsx:163` — `hover:bg-zinc-50/50` table row
- `apps/web/app/(app)/journal/new/page.tsx:217` — `bg-zinc-50` table footer
- `apps/web/app/(app)/gst/reconciliation/mismatches/page.tsx:89` — `text-gray-900` heading
- `apps/web/app/(app)/gst/reconciliation/mismatches/page.tsx:120` — `bg-gray-600` button
- `apps/web/app/(app)/gst/reconciliation/mismatches/page.tsx:129` — `bg-gray-50` table header
- `apps/web/app/(app)/gst/reconciliation/page.tsx:57` — `hover:bg-stone-100` filter button

### Fix
Replace all with design system equivalents:
- `bg-zinc-50` / `bg-gray-50` / `bg-stone-100` → `bg-surface-muted`
- `bg-zinc-800` → `bg-dark`
- `text-zinc-400` / `text-gray-500` → `text-light`
- `text-gray-900` → `text-dark`
- `bg-gray-600` → `bg-mid`
- `hover:bg-gray-50` / `hover:bg-zinc-50/50` / `hover:bg-stone-100` → `hover:bg-surface-muted`

---

## 4. Table Header Background Inconsistencies

### Problem
Table headers use **4 different background colors**.

| Background | Files |
|------------|-------|
| `bg-surface-muted` | DataTable component (correct) |
| `bg-zinc-50` | Journal new, Journal detail |
| `bg-gray-50` | GST mismatches |
| `bg-sidebar` | GST returns history (incorrect — dark bg in light table) |
| `bg-surface-muted/50` | Inventory low stock |
| `bg-surface-muted/80` | Employees |

### Specific Violations
- `apps/web/app/(app)/gst/returns/page.tsx:64` — `bg-sidebar` used for table section header (creates dark bar in light table)
- `apps/web/app/(app)/journal/new/page.tsx:153` — `bg-zinc-50` table header
- `apps/web/app/(app)/employees/page.tsx:77` — `bg-surface-muted/80` (unnecessary opacity)

### Fix
All table headers: `bg-surface-muted` solid, no opacity variants.

---

## 5. Table Row Hover Inconsistencies

### Problem
Table rows use **4 different hover states**.

| Hover Class | Files |
|-------------|-------|
| `hover:bg-surface-muted/30` | GST returns, GST ledger, GST reconciliation, GST payment history |
| `hover:bg-surface-muted/50` | Journal detail |
| `hover:bg-zinc-50/50` | Journal new |
| `hover:bg-gray-50` | GST mismatches |
| `hover:bg-surface-muted` | DataTable component |
| `hover:bg-surface-muted/50` | Employees |

### Fix
Standardize to `hover:bg-surface-muted/50` for all table rows.

---

## 6. Focus Ring Color Inconsistencies

### Problem
50 instances of `focus:ring-primary-container` and `focus:border-primary-container` — these reference **indigo**, not amber.

### Files Affected
- `apps/web/app/(app)/journal/new/page.tsx` — 6 instances
- `apps/web/app/(app)/invoices/new/page.tsx` — 8+ instances
- `apps/web/app/(app)/gst/returns/[period]/gstr1/page.tsx` — 4 instances
- `apps/web/app/(app)/onboarding/step-*.tsx` — multiple instances
- Many other form pages

### Fix
Replace all with:
- `focus:border-amber`
- `focus:ring-1 focus:ring-amber`
- Or use the `.input-field:focus` CSS class from globals.css

---

## 7. Filter Tab Implementation Inconsistencies

### Problem
Filter tabs are implemented **3 different ways** across list pages.

### Pattern A: Inline Custom (most common)
Used by: Journal, Invoices, Accounts, CoA, Payments
```tsx
<div className="flex gap-1 bg-surface-muted rounded-md p-0.5 border border-border">
  <button className={`px-3 py-1.5 text-[11px] font-ui text-[13px] font-medium rounded-md ${active ? 'bg-surface text-dark shadow-sm' : 'text-mid hover:text-dark bg-transparent'}`}>
```

### Pattern B: CSS Class `.filter-tab`
Used by: GST period page, ITR returns, Payroll process, Employee salary
```tsx
<button className="filter-tab active">Process Payroll</button>
```

### Pattern C: Plain Buttons
Used by: GST reconciliation
```tsx
<button className="px-4 py-1.5 hover:bg-stone-100 transition-colors rounded-md text-[11px] uppercase tracking-widest font-bold text-mid">
```

### Issues
- Pattern A uses `text-[11px] text-[13px]` (duplicate/conflicting font sizes)
- Pattern B doesn't show counts
- Pattern C uses old `bg-stone-100` hover
- Active states differ: some use `shadow-sm`, some don't

### Fix
Standardize all to **Pattern A** (the most complete) with these fixes:
- Remove duplicate font sizes
- Add count badges consistently
- Use `.filter-tab.active` background = `bg-surface`, text = `text-dark`
- Inactive hover = `hover:text-dark hover:bg-surface-muted/50`

---

## 8. Font Size Duplications

### Problem
Multiple pages have **duplicate/conflicting font-size classes** on the same element.

### Instances Found

| Pattern | Count | Example |
|---------|-------|---------|
| `text-[11px] text-[10px]` | 12 | `font-ui text-[11px] text-[10px] text-light uppercase` |
| `text-[13px] text-[13px]` | 8 | `font-ui text-[13px] text-[13px] text-dark` |
| `text-[13px] text-xs` | 6 | `font-ui text-[13px] text-xs text-mid` |
| `text-[13px] text-sm` | 4 | `font-ui text-[13px] text-sm text-mid` |

### Files Affected
- `apps/web/app/(app)/journal/new/page.tsx` — 6 instances
- `apps/web/app/(app)/invoices/new/page.tsx` — 4 instances
- `apps/web/app/(app)/gst/returns/[period]/gstr1/page.tsx` — 3 instances
- `apps/web/app/(app)/gst/returns/[period]/gstr2b/page.tsx` — 2 instances
- `apps/web/app/(app)/gst/returns/[period]/gstr3b/page.tsx` — 2 instances

### Fix
Remove the duplicate. Use the larger size (the one that renders). Update to design system tokens where possible.

---

## 9. Card Padding Inconsistencies

### Problem
Cards (`.bg-surface.border.border-border`) use inconsistent padding.

| Padding | Usage |
|---------|-------|
| `p-6` | Most cards (correct) |
| `p-8` | Signup card, some report cards |
| `p-10` | Invoice preview card |
| `px-6 py-4` | GST returns table header |
| `p-5` | Employees filter bar |

### Specific Violations
- `apps/web/app/(app)/invoices/new/page.tsx:200` — Invoice preview uses `p-10` (excessive for app context)
- `apps/web/app/(app)/employees/page.tsx:43` — Filter bar uses `p-5` while most use `p-6`
- `apps/web/app/(auth)/signup/page.tsx:38` — Uses `p-8` (acceptable for auth)

### Fix
App cards: `p-6` standard. Auth cards: `p-8` acceptable. Invoice preview: reduce to `p-8`.

---

## 10. Inline Styles for Spacing

### Problem
8 files use inline `style={{}}` for spacing/width instead of Tailwind utilities.

| File | Inline Style | Issue |
|------|-------------|-------|
| `dashboard/page.tsx:304` | `style={{ width: "62%" }}` | Progress bar — acceptable (dynamic) |
| `coa/page.tsx:208` | `style={{ paddingLeft: \`${20 + acct.level * 24}px\` }}` | Tree indentation — acceptable (dynamic) |
| `onboarding/components/account-tree.tsx:70` | `style={{ paddingLeft: \`${depth * 16}px\` }}` | Tree indentation — acceptable (dynamic) |
| `onboarding/step-coa-review.tsx:58` | `style={{ paddingLeft: \`${node.level * 24}px\` }}` | Tree indentation — acceptable (dynamic) |
| `receivables/page.tsx:87` | `style={{ width: \`${bucket.percentage}%\` }}` | Bar chart — acceptable (dynamic) |
| `inventory/products/new/page.tsx:58` | `style={{ width: 'calc(100% + 64px)' }}` | **Negative margin hack** — brittle |
| `employees/page.tsx:23` | `style={{ width: 'calc(100% + 64px)' }}` | **Negative margin hack** — brittle |
| `marketing/page.tsx:59` | `style={{ paddingTop: '128px', paddingBottom: '96px' }}` | Should use Tailwind `py-32 pb-24` or CSS vars |
| `marketing/page.tsx:225` | `style={{ paddingTop: '128px', paddingBottom: '128px' }}` | Should use Tailwind `py-32` |
| `marketing/legal-layout.tsx:18` | `style={{ paddingTop: '64px' }}` | Should use Tailwind `pt-16` |

### Critical Issues
The negative margin hacks in `inventory/products/new` and `employees` are brittle — they break if parent padding changes.

### Fix
- Marketing pages: Replace with Tailwind padding utilities or CSS custom properties
- Employees/Inventory: Use `w-screen` with `relative -mx-6` (matching parent padding) instead of `calc(100% + 64px)`

---

## 11. Container Width Inconsistencies

### Problem
Max-width constraints vary widely.

| Width | Files |
|-------|-------|
| `max-w-[1200px]` | Journal new, Marketing features |
| `max-w-[1320px]` | Marketing homepage |
| `max-w-[1400px]` | Employees header |
| `max-w-[1100px]` | Reports (proposed in plan) |
| `max-w-[1000px]` | Trial balance (current) |
| No max-width | Most app list pages (correct — fill content area) |

### Fix
- Marketing: unify to `max-w-[1400px]`
- App list pages: no max-width (fill sidebar-offset viewport)
- App detail/form pages: `max-w-[1200px]` max
- Reports: `max-w-[1100px]`

---

## 12. Form Input Inconsistencies

### Problem
Form inputs across pages use different styling patterns.

| Pattern | Padding | Border Focus | Files |
|---------|---------|--------------|-------|
| A | `px-4 py-2.5` | `focus:border-primary-container focus:ring-1` | Journal new, Invoice new |
| B | `px-3 py-2.5` | `focus:border-primary-container focus:ring-1` | Invoice new (some) |
| C | `px-3 py-2` | `focus:ring-1 focus:ring-amber-600/20` | Employees |
| D | `px-8 py-1.5` | `focus:ring-1 focus:ring-primary-container` | Journal list search |

### Issues
- Inconsistent padding: px-3 vs px-4, py-2 vs py-2.5
- Inconsistent focus color: `primary-container` (indigo) vs `amber`
- Inconsistent border-radius: `rounded-md` (most) vs `rounded` (employees)

### Fix
Standardize to `.input-field` CSS class everywhere.

---

## 13. Badge/Status Inline Styles

### Problem
Status badges are often inline-styled instead of using the Badge component.

### Instances
- `apps/web/app/(app)/gst/returns/page.tsx:85` — Inline span with conditional bg/text classes
- `apps/web/app/(app)/gst/reconciliation/mismatches/page.tsx` — Inline spans
- `apps/web/app/(app)/employees/page.tsx:101` — Inline span with conditional classes
- `apps/web/app/(app)/inventory/page.tsx:109` — Inline span with conditional classes

### Fix
Replace all with `<Badge variant="...">` component.

---

## 14. KPI Tile Inconsistencies

### Problem
KPI tiles are implemented differently on Dashboard vs Inventory.

### Dashboard
Uses `KpiTile` component with:
- `variant` prop (amber/success/danger/neutral)
- Border-top via prop
- Icon via prop

### Inventory
Inline custom tiles with:
- `border-t-2` color via conditional class
- Icon color via conditional class
- Value color conditional
- No component reuse

### Fix
Standardize all KPI tiles to use the `KpiTile` component.

---

## Fix Priority Matrix

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| **P0** | Old gray/stone/zinc classes (48 instances) | Low | High — visible color mismatch |
| **P0** | Focus ring color (50 instances of indigo) | Low | High — interactive feel broken |
| **P0** | Page header standardization | Medium | High — every page affected |
| **P1** | Button standardization (220 patterns) | Medium | High — CTAs look different everywhere |
| **P1** | Table header/row hover standardization | Low | Medium — visual cohesion |
| **P1** | Filter tab standardization | Medium | Medium — 3 different implementations |
| **P2** | Font size duplications | Low | Low — mostly harmless |
| **P2** | Inline style replacements | Medium | Medium — maintainability |
| **P2** | Card padding standardization | Low | Low — minor visual drift |
| **P3** | Container width unification | Low | Low — mostly marketing pages |
| **P3** | Badge component adoption | Medium | Low — code quality |
| **P3** | KPI tile component adoption | Low | Low — only 2 pages affected |

---

## Implementation Order

1. **Foundation first** — Fix globals.css, tailwind.config, UI primitives (fixes P0 automatically)
2. **Mass replace** — Old gray classes, focus rings, font duplications (scriptable)
3. **App shell** — Sidebar, topbar, layout (fixes navigation consistency)
4. **Page headers** — Standardize every page header to Pattern A
5. **Buttons** — Replace all inline button Tailwind with `.btn-*` classes
6. **Tables** — Standardize header bg, row hover, footer styling
7. **Forms** — Standardize inputs to `.input-field`
8. **Filter tabs** — Unify to single implementation
9. **Marketing** — Fix inline styles, container widths
10. **Components** — Adopt Badge, KpiTile everywhere

---

*End of Element-Level Layout Audit*
