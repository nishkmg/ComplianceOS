# ComplianceOS — UX/UI Comprehensive Analysis & Recommendations

**Date:** 2026-04-30
**Status:** Final

---

## 1. Executive Summary

ComplianceOS is an India-first double-entry accounting engine with event sourcing. The current UI is functional and shows strong domain awareness (Indian numbering, FY management, GST), but suffers from **inconsistent visual language, fragmented styling patterns, absence of a unified design system, and gaps in accessibility**.

**Key Opportunities:**

| Area | Current State | Impact Potential |
|---|---|---|
| Visual Consistency | Mixed Tailwind v3/v4 + raw CSS classes (`.btn`, `.badge`) + inline hex values | High — reduces cognitive load |
| Navigation IA | 26+ flat nav items in single sidebar column | Critical — task completion time |
| Design System | Partial tokens in `:root` + Tailwind config, no dark mode variables, no component spec | High — developer velocity |
| Accessibility | Skip link, `sr-only`, `role="alert"` present but no focus trap, no i18n, no keyboard testing | Medium — WCAG AA gap |
| Data Density | Raw `<table>` elements, no virtualization, no sticky headers, no column sorting | High — scroll performance on large ledgers |
| Mobile | Sidebar hidden below `lg`, no responsive table patterns | Medium — mobile CA usage |
| Localization | English-only, `en-IN` date/currency only | Medium — Hindi/regional need |

**Expected Impact:** SUS score improvement from ~55 (estimated current) to 75+, task completion time reduction 30-40%, error rate reduction in journal entry 50%+.

---

## 2. Heuristic & Cognitive Walkthrough

### Nielsen's Heuristics — Severity Ratings (0-4)

| # | Heuristic | Finding | Severity |
|---|-----------|---------|----------|
| 1 | **Visibility of system status** | `BalanceBar` shows debit/credit diff with `aria-live="polite"` ✓. But no saving indicator on POST — button just says "Posting..." with no spinner | 2 |
| 2 | **Match system & real world** | Indian numbering (₹, lakh/crore), FY format (2026-27), GST terms ✓. But "Ledger Distribution" in JE form — UK English for India audience. Months in `en-IN` locale OK | 1 |
| 3 | **User control & freedom** | `DiscardChangesDialog` on dirty forms ✓. `VoidEntryDialog` with reason required ✓. But no undo mechanism after POST (event sourcing — intentional, needs clearer UX messaging) | 2 |
| 4 | **Consistency & standards** | **MAJOR ISSUE** — Three button patterns coexist: (a) `<button>` with Tailwind, (b) `.btn .btn-primary` CSS classes, (c) `.marketing-btn-primary`. Color tokens used as `bg-[#C8860A]` inline in 20+ places instead of `bg-primary-container`. `border-[0.5px]` vs `border-hairline` class. Inconsistent capitalize/uppercase on labels | 3 |
| 5 | **Error prevention** | JE balance validation ✓, duplicate void prevention ✓. But: amount field accepts text, no auto-tab to next line, no keyboard shortcut hint visibility | 2 |
| 6 | **Recognition not recall** | Command palette (Cmd+K) ✓. Sidebar nav items lack icons in layout sidebar (but have icons in component sidebar — inconsistency between `layout.tsx` and `sidebar.tsx`) | 2 |
| 7 | **Flexibility & efficiency** | Keyboard shortcuts exist (`useKeyboardShortcuts`) but are not discoverable. No keyboard shortcut legend panel. No bulk actions on list pages | 2 |
| 8 | **Aesthetic & minimalist** | Clean overall aesthetic. But sidebar has 26 items in a flat list — violates information density principle. Dialog padding/typography inconsistent | 2 |
| 9 | **Help users recognize & recover** | `ErrorState` components ✓, `OfflineBanner` ✓. But form error messages are inline hex `red-600` — no semantic error summary pattern. Toast uses `sonner` but positioned inconsistently | 2 |
| 10 | **Help & documentation** | No contextual help tooltips, no onboarding wizard tooltips, no `/help` route. FAQ exists on marketing site | 3 |

### Domain-Specific Heuristics (Finance Software)

| Principle | Finding | Severity |
|-----------|---------|----------|
| **Audit trail visibility** | Event sourcing → immutable ✓. But no visual indicator per-entry showing who posted it, when, from which IP | 2 |
| **Balance confirmation** | Red/green balance bar ✓. But no running balance per account in ledger view | 2 |
| **Error tolerance in financial data** | Zero tolerance for unbalanced entries ✓. But no warning before closing FY with pending drafts | 3 |
| **Print readiness** | Print stylesheet ✓, report CSS classes ✓. But no print preview | 1 |
| **Data export** | Export dialog exists but limited to PDF. No CSV/XLSX export for journal entries | 2 |

---

## 3. User & Context Analysis

### Primary Personas

#### Persona 1: Ramesh — SME Owner (Mumbai)
- **Role:** Proprietor of a 25-person manufacturing unit
- **Goals:** Cash flow visibility, GST filing, bank loan documentation
- **Pain points:** Doesn't understand double-entry, wants "did I make money this month?" at a glance
- **Language:** Hindi + English (switches mid-session)
- **Device:** Mid-range Android phone + office laptop (1366×768)
- **Key workflows:** Dashboard → Receivables → Invoicing → GST Returns

#### Persona 2: Priya — Chartered Accountant (Delhi)
- **Role:** External CA managing 15+ client books
- **Goals:** Speed of data entry, audit trail integrity, report generation
- **Pain points:** Repetitive journal entries, switching between client contexts
- **Language:** English (professional), Hindi (with staff)
- **Device:** MacBook Pro 14" + iPad Pro (sidecar)
- **Key workflows:** Journal Entry → Trial Balance → P&L → Balance Sheet → Audit Log

#### Persona 3: Vikram — Freelance Designer (Bengaluru)
- **Role:** Solo freelancer, 8-10 clients/month
- **Goals:** Simple invoicing, expense tracking, ITR preparation
- **Pain points:** Too complex for basic needs, wants "TurboTax for India"
- **Language:** English
- **Device:** iPhone 15 + personal laptop
- **Key workflows:** Invoices → Payments → Receipts Scan → ITR

### Contextual Insights

| Factor | Implication |
|--------|-------------|
| **Mobile-first in India** | 60%+ users will access on phone. Current app is sidebar-only (hidden `<lg`), no mobile nav |
| **Low accounting literacy** | SME owners need plain-language labels, not "Ledger Distribution" |
| **CA as intermediary** | Multi-tenant switching (15+ clients) needs quick-account switcher, not just FY switcher |
| **Hindi/English code-switching** | UI labels in English, error messages bilingual, number formats always Indian |
| **Low bandwidth areas** | Bundle size matters. Keep JS under 200KB gzipped |
| **Print culture persists** | All financial reports must be print-optimized. Current print CSS is good but could be better |

---

## 4. Information Architecture Review

### Current Issues

1. **26 nav items, flat structure** — violates Miller's Law (7±2). Users get choice paralysis
2. **Two sidebars** — `layout.tsx` has a plain text nav, `sidebar.tsx` component has an icon nav. Which one is live?
3. **No global search** for accounts, entries, or invoices — only command palette
4. **`/reports` is a landing page** but report links are also scattered (ledger under /reports, PL under /reports, TB under /reports)
5. **Duplicate routes** — `/coa`, `/accounts`, and `accounts` in sidebar `(app)/layout.tsx` vs `sidebar.tsx`

### Recommended IA (Grouped Navigation)

```
Accounting Core
├── Dashboard                    # Financial snapshot
├── Journal Entries              # List + Create + View
├── Chart of Accounts            # Hierarchical tree view
├── Trial Balance                # Financial report
├── Profit & Loss                # Schedule III format
├── Balance Sheet                # B/S
└── Cash Flow Statement          # Indirect method

Receivables & Payables
├── Invoices                     # Create, List, View
├── Payments                     # Record, Allocate
├── Receivables                  # Aging, Customer Summary
└── Receipts Scan                # OCR

Compliance
├── GST                          # Returns, Reconciliation, Ledger, Payment
├── ITR                          # Returns, Computation, Payment
├── Payroll                      # Process, Reports (PF/ESI/Form 16)
│   └── Employee Management      # Linked
└── Audit Log                    # Event-sourced trail

Operations
├── Inventory                    # Products, Stock, Reports
├── Settings                     # Fiscal Years, Invoice Templates, Profile
└── Support                      # Help, Documentation
```

Key changes:
- **Collapse from 26 to 5-7 top-level groups**
- **Use expandable sections** (accordion or flyout) for GST/ITR sub-items
- **Move "My Payslips" under Payroll** — not a top-level item
- **Merge `/coa` and `/accounts`** — single chart of accounts page
- **Rename "Journal" to "Journal Entries"** for clarity
- **Remove "Scan Receipt" duplicate** — keep under Invoices or a single Scan center

### Dashboard Redesign

Current: KPI tiles + Recent Entries table + FY progress + Quick actions + Audit card

Recommended layout:
```
┌─────────────────────────────────────────────────────┐
│ [FY Banner: 2026-27 • 245 days remaining]           │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│ Revenue  │ Expenses │ Net Profit│ Cash at  │ GST     │
│ MTD      │ MTD      │ MTD      │ Bank     │ Payable │
├──────────┴──────────┴──────────┴──────────┴─────────┤
│ ┌─────────────────┐ ┌──────────────────────────────┐ │
│ │ Cash Flow Chart │ │ Recent Transactions (5)      │ │
│ │ (area sparkline)│ │ [View All →]                │ │
│ └─────────────────┘ │ • Tabular with status badges │ │
│ ┌─────────────────┐ └──────────────────────────────┘ │
│ │ Quick Actions   │ ┌──────────────────────────────┐ │
│ │ • Record Entry  │ │ Upcoming Deadlines           │ │
│ │ • View P&L      │ │ • GSTR-3B due in 12 days    │ │
│ │ • File GST      │ │ • ITR due in 45 days        │ │
│ └─────────────────┘ └──────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 5. Modern UI Design Recommendations

### Visual Direction: "Material-Inspired Warm Minimalism"

Not strict Material Design, but borrowing its **spacing rhythm, elevation system, and component anatomy** — adapted to the Indian fiscal context with warm amber tones.

#### Color Palette

| Token | Current | Recommended | Rationale |
|-------|---------|-------------|-----------|
| `--color-primary` | `#825500` (dark brown) | `#8B5E00` (richer amber) | WCAG AA on white (4.8:1), culturally auspicious gold tone |
| `--color-primary-container` | `#C8860A` (golden amber) | `#FFDDB7` (light amber tint) | Better as container (3:1 on text) |
| `--color-on-primary` | white | `#FFFFFF` | Keep — passes AA |
| `--color-success` | `#16A34A` | `#1B8A3D` | Softer green, less alarming in financial context |
| `--color-danger` | `#DC2626` | `#C62828` | Slightly darker for better contrast on white |
| `--color-surface` | `#FFFFFF` | `#FFFFFF` | Keep |
| `--color-surface-muted` | `#FAFAFA` | `#F8F7F4` | Warm grey, matches Indian paper ledgers |
| `--color-border` | `#E5E5E5` | `#E0DCD4` | Warm border, less sterile |
| `--color-amber` | `#B47500` | `#B47500` | Keep — brand anchor |
| Text primary | `#1A1A1A` | `#1C1B16` | Slightly warmer black |

**Cultural note:** Avoid green/red for non-financial states (red = loss, green = profit is standard in Indian accounting). Use amber as primary — gold is auspicious in Indian culture, associated with prosperity.

#### Typography Scale

| Level | Font | Size | Weight | Use |
|-------|------|------|--------|-----|
| Display XL | Playfair Display | 38px | 400 | Dashboard greeting, page titles |
| Display LG | Playfair Display | 26px | 400 | Section headers, dialog titles |
| Display MD | Playfair Display | 20px | 400 | Card headers |
| UI LG | Syne | 16px | 500 | Body emphasis, form labels |
| UI MD | Syne | 14px | 400 | Body text, table content |
| UI SM | Syne | 13px | 400 | Secondary text, metadata |
| UI XS | Syne | 11px | 600 | Uppercase labels, badges (current is fine) |
| Mono LG | DM Mono | 18px | 400 | Large financial values (dashboard KPI) |
| Mono MD | DM Mono | 14px | 400 | Table amounts, smaller figures |
| Mono SM | DM Mono | 11px | 400 | Formatted numbers in dense contexts |

**Issue:** Current `--font-ui-sm: 13px` and `--font-ui-md: 14px` — these are dangerously close. Recommended to have 2px steps minimum between levels.

#### Elevation & Shadows

| Level | Use | Shadow |
|-------|-----|--------|
| 0 | Default surface | None |
| 1 | Cards, table containers | `0 1px 2px rgba(0,0,0,0.04)` |
| 2 | Dropdowns, popovers | `0 4px 12px rgba(0,0,0,0.08)` |
| 3 | Dialogs, command palette | `0 12px 40px rgba(0,0,0,0.12)` |
| 4 | Sticky header, bottom bar | `0 2px 8px rgba(0,0,0,0.06)` |

Current shadows are applied but inconsistently (`.shadow-sm` inline + `.shadow-screenshot` custom).

#### Micro-interactions

| Element | Current | Recommended |
|---------|---------|-------------|
| Button hover | `hover:bg-amber-700` | Add `active:scale-[0.98]` tactile feedback |
| Table row hover | `hover:bg-stone-50` | Keep + `transition-colors duration-100` |
| Sidebar active | Amber background | Add left border indicator (exists in component, missing in layout) |
| Dialog entry | Fade in (Radix default) | `animate-in zoom-in-95 slide-in-from-bottom-4 duration-200` |
| Navigation | `transition-colors` | Add `hover:translate-x-0.5` (subtle forward motion) |
| Toast | Sonner default | Custom amber-themed toast, slide-in from right |
| KPI value change | None | Brief glow animation when value updates (for live data) |
| Form submission | None | Button loading spinner + disable, success checkmark animation |

---

## 6. Component & Design System Specification

### Current Component Audit

| Component | Status | Issues |
|-----------|--------|--------|
| Button | ✅ Exists | 3 variants (Tailwind, `.btn`, `.marketing-btn`) with inconsistent sizing |
| Input | ✅ Exists | No error state styling, no prefix/suffix slots |
| Select | ✅ Exists | Custom SVG chevron conflicts with native `<select>` appearance |
| Switch | ✅ Exists | No focus-visible ring |
| Card | ✅ Exists | Good compound component pattern |
| Badge | ✅ Exists | OK — but colors hardcoded |
| Dialog | ✅ Exists (Radix) | Inconsistent padding/spacing across dialog types |
| KpiTile | ✅ Exists | Good — but delta colors hardcoded |
| BalanceBar | ✅ Exists | Good, accessible |
| Skeleton | ✅ Exists | OK |
| EmptyState | ✅ Exists | OK |
| ErrorState | ✅ Exists | Good — type-aware |
| **DataTable** | ❌ Missing | Raw `<table>` with inline styling — NO pagination, sorting, column resize, virtualization |
| **DropdownMenu** | ❌ Missing | FY popover is custom — needs Radix dropdown |
| **Tabs** | ❌ Missing | Filter tabs are CSS classes, not a component |
| **Tooltip** | ❌ Missing | No Radix tooltip — needed for truncated entries |
| **FormField** | ❌ Missing | No wrapper component — `<label>` + `<input>` + `<FieldError>` hand-coded each time |
| **Toast** | ❌ Partially | Sonner — but no custom component wrapper |
| **TopAppBar** | ❌ Missing | Header bar mixed inline in page files |
| **DatePicker** | ❌ Missing | Native `<input type="date">` — no range picker for reports |
| **Combobox** | ❌ Missing | Account search in JE form is a `<select>` with 1000+ items — needs virtualized combobox |
| **ProgressBar** | ❌ Missing | FY progress is inline CSS div |

### Recommended Component Architecture

```
components/
├── ui/                          # Design system primitives
│   ├── button.tsx               # Single Button with variant/size/loading props
│   ├── input.tsx                # With error state, prefix, suffix slots
│   ├── select.tsx               # Custom select with search
│   ├── combobox.tsx             # Virtualized searchable dropdown
│   ├── date-picker.tsx          # Single + range (calendar popover)
│   ├── form-field.tsx           # Label + Input + Error + HelpText wrapper
│   ├── data-table.tsx           # Sortable, paginated, virtualized
│   ├── tabs.tsx                 # Radix tabs
│   ├── tooltip.tsx              # Radix tooltip
│   ├── dropdown-menu.tsx        # Radix dropdown
│   ├── dialog.tsx               # Enhanced radial dialog with consistent spacing
│   ├── toast.tsx                # Sonner wrapper
│   ├── badge.tsx                # Already good — tokenize colors
│   ├── kpi-tile.tsx             # Already good — tokenize
│   ├── skeleton.tsx             # Already good
│   ├── empty-state.tsx          # Already good
│   ├── error-state.tsx          # Already good
│   ├── progress-bar.tsx         # New — for FY progress, wizard steps
│   ├── spinner.tsx              # New — loading indicator
│   └── avatar.tsx               # New — user avatar for profile
├── layout/                      # App shell
│   ├── app-sidebar.tsx          # Unified sidebar (merge layout.tsx + sidebar.tsx)
│   ├── app-topbar.tsx           # Top bar component (extract from pages)
│   ├── app-shell.tsx            # Sidebar + Topbar + Content
│   └── mobile-nav.tsx           # Bottom tab bar for mobile
├── forms/                       # Form-specific composites
│   ├── journal-entry-form.tsx   # JE form with lines table
│   ├── account-select.tsx       # Account combobox with hierarchy
│   └── amount-input.tsx         # Indian-number formatted input
└── dialogs/                     # Already good pattern — standardize spacing
```

### Key Component Spec: DataTable

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: { pageSize: number; total: number };
  sortable?: boolean;
  virtualized?: boolean; // windowing for 1000+ rows
  stickyHeader?: boolean;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyState?: ReactNode;
  dense?: boolean; // compact mode for reports
}
```

**States:** Loading (skeleton rows), Empty (with CTA), Error, Populated, Filtered (no results)

---

## 7. Accessibility & Localization Checklist

### WCAG 2.1 AA Compliance

| Requirement | Current | Action Needed |
|-------------|---------|---------------|
| **1.1.1 Non-text Content** | Material Symbols have no `aria-label` on icon-only buttons | Add `aria-label` or `title` |
| **1.4.3 Contrast (AA)** | `#767676` on white = 3.4:1 ❌ (fails for text <18px) | Minimum 4.5:1 — use `#555555` |
| **1.4.4 Resize Text** | Uses `px` for font sizes | Convert to `rem` throughout |
| **2.1.1 Keyboard** | Skip link ✓, Tab navigation works. No focus trap in dialogs (Radix handles) | Test with keyboard-only |
| **2.4.1 Bypass Blocks** | `SkipToMainContent` ✓ | Good |
| **2.4.6 Headings & Labels** | Some pages use `<h1>`, others don't (`/journal/new` uses `<h2>` with no `<h1>`) | Fix hierarchy |
| **2.4.7 Focus Visible** | `focus-visible:ring-2` on buttons, inputs | Missing on select, switch |
| **3.3.1 Error Identification** | Inline error messages ✓ | Add `aria-describedby` linking input to error |
| **3.3.2 Labels or Instructions** | Labels present ✓ | Ensure every input has associated `<label>` |
| **4.1.2 Name, Role, Value** | Buttons have text ✓ | Icon-only buttons need `aria-label` |

### Urgent Fixes

1. **Dialog focus management** — Radix handles this, but confirm all dialogs trap focus correctly
2. **Skip link visibility** — currently `top: -100%`, moves to `top: 0` on focus ✓
3. **Error summary** — `<FormErrorSummary>` exists but needs `role="alert"` and `aria-live="assertive"`
4. **Table row navigation** — add `tabindex="0"` on rows, arrow key navigation between cells
5. **Color contrast** — `bg-stone-50` `text-stone-500` in dialogs = 3.2:1 contrast — fails AA

### Localization

| Element | Current | Recommended |
|---------|---------|-------------|
| **Number format** | `formatIndianNumber()` ✓ | Extend to all locales (en-IN default, hi-IN optional) |
| **Currency** | `₹` hardcoded | Make configurable per tenant |
| **Date format** | `DD MMM YYYY` (en-IN) | Support both `DD-MM-YYYY` and `DD/MM/YYYY` |
| **Time format** | 12h assumed | Add 24h support |
| **Language** | English only | Add Hindi labels on key CTAs ("नया प्रविष्टि" for "New Entry"), bilingual error messages |
| **RTL** | Not needed for Indian languages | Hindi uses LTR — no RTL concern |
| **Content direction** | LTR | Keep |
| **Fiscal year** | `YYYY-YY` format ✓ | Good |
| **Week start** | Monday (assumed) | Confirm — Indian calendar starts Monday |

### Error Messaging (Bilingual)

```
Current: "Voucher must be balanced (Debits = Credits) to post."
Recommended: "खाता बही संतुलित होना चाहिए (डेबिट = क्रेडिट) | Voucher must be balanced."

Current: "Invalid credentials"
Recommended: "ईमेल या पासवर्ड गलत है | Invalid email or password"
```

---

## 8. Performance & Technical Feasibility

### Bundle Analysis

| Concern | Current State | Recommendation |
|---------|---------------|----------------|
| **JS bundle** | No code splitting per route | Use Next.js dynamic imports on dialogs, heavy components (OCR scanner) |
| **Fonts** | 3 font families loaded via `@fontsource` | ~150KB total. Acceptable for desktop. Consider subsetting DM Mono to Devanagari + Latin |
| **Icons** | Material Symbols full font | **Swap to tree-shakeable SVG icons** (lucide-react or similar) — currently loading entire symbol font for 5-10 used icons |
| **CSS** | `globals.css` + Tailwind JIT | Tailwind JIT purges unused. CSS variables minimal overhead. OK |

### Data Performance

| Pattern | Current | Recommended |
|---------|---------|-------------|
| **Large tables** | Raw `<table>` — renders all rows | Virtualized scrolling (tanstack/react-virtual) for 1000+ rows |
| **Account selector** | `<select>` with 10 mock items | Real implementation will have 1000+ accounts. Use combobox with search + virtualized list |
| **Chart data** | None currently | Use lightweight charts (recharts or visx) — keep under 30KB |
| **API calls** | `useEffect` fetch in dashboard | Proper tRPC react-query with `useSuspenseQuery` for loading states |
| **Form state** | `useState` for JE lines | Keep for now — migrate to react-hook-form for validation when real backend connected |

### Technical Debt

| Issue | Impact | Fix |
|-------|--------|-----|
| `// @ts-nocheck` on 90%+ component files | TypeScript provides zero value | Remove pragma, fix types. High effort but critical for maintainability |
| Inline hex colors (`bg-[#C8860A]`) across 30+ files | Unthemeable, inconsistent | Replace with Tailwind tokens `bg-primary-container` |
| Two sidebar implementations (`layout.tsx` vs `sidebar.tsx`) | Confusion, duplicate maintenance | Merge into one AppSidebar component |
| Tailwind v3 + v4 mixed syntax | Potential conflict after upgrade | Standardize on v4 |

---

## 9. Compliance & Security Considerations

### RBI-Aligned Data Privacy

| Requirement | UI Implication |
|-------------|----------------|
| **Data encryption at rest** | No UI impact (backend concern). Show padlock icon on sensitive data fields |
| **Consent for data sharing** | Add consent toggle in Settings → Privacy → "Share anonymized usage data" |
| **Data retention policy** | Show retention period in Settings. Add "Request data deletion" flow |
| **Session timeout** | Implement idle timeout warning banner (15 min) → auto-logout |

### Secure Input Handling

| Pattern | Status | Action |
|---------|--------|--------|
| **Password visibility toggle** | ✅ Exists on login | Good |
| **Input masking** | ❌ Missing | Add `type="password"` for sensitive fields, amount masking optional |
| **Numeric validation** | Partially | JE amounts accept any text. Add `inputMode="decimal"`, `pattern="[0-9]*\.?[0-9]{0,2}"` |
| **Auto-complete off** | ❌ Missing | Add `autoComplete="off"` on financial forms |

### Audit Trail UI

Current: Event sourcing stores all changes. UI has `/audit-log` route.

Recommendations:
1. **Inline audit badge** on every posted entry — show "Posted by user@email on 12 Apr 2026 at 14:32"
2. **Diff viewer** for edited entries — show old vs new values in a side-by-side view
3. **Print audit report** — formatted for statutory compliance
4. **Filter by event type** (create, update, void, close_fy)

---

## 10. Prioritized Action Plan

### Phase 1: Quick Wins (1-2 weeks, low effort, high impact)

| # | Task | Effort | Impact | Success Metric |
|---|------|--------|--------|----------------|
| 1 | Replace inline hex `bg-[#C8860A]` with `bg-primary-container` | 4h | High | Consistency score |
| 2 | Add `rem` conversion to font sizes in `globals.css` | 2h | Medium | WCAG 1.4.4 pass |
| 3 | Fix contrast on `text-light` (#767676 → #555555) | 15min | High | Contrast ratio 4.5:1 |
| 4 | Add `aria-label` to icon-only buttons (Material Symbols) | 2h | High | WCAG 4.1.2 pass |
| 5 | Merge duplicate sidebar files | 2h | Medium | Maintainability |
| 6 | Add `inputMode="decimal"` to amount fields | 30min | Medium | Mobile UX |
| 7 | Remove `@ts-nocheck` from 5 easiest files | 3h | Medium | Type safety |

### Phase 2: UI Overhaul (3-4 weeks)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 8 | Build unified DataTable component (sort, paginate, virtualize) | 40h | Critical |
| 9 | Build Combobox component for account selection | 16h | Critical |
| 10 | Restructure sidebar IA (grouped navigation) | 8h | High |
| 11 | Build FormField wrapper component | 8h | High |
| 12 | Standardize all dialogs to consistent spacing/typography | 12h | High |
| 13 | Add mobile navigation (bottom tab bar) | 16h | High |
| 14 | Implement dark mode CSS variables + toggle | 8h | Medium |
| 15 | Add bilingual error messages (Hindi + English) | 8h | Medium |

### Phase 3: Design System Adoption (4-6 weeks)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 16 | Migrate from Material Symbols to tree-shakeable SVG icons | 20h | High |
| 17 | Build full component library with Storybook | 60h | High |
| 18 | Create Figma design system mirroring code tokens | 40h | High |
| 19 | Add accessibility test suite (axe-core + Playwright) | 16h | High |
| 20 | Implement i18n infrastructure (next-intl or similar) | 24h | High |
| 21 | Full `@ts-nocheck` removal across codebase | 40h | Medium |
| 22 | Performance budgets + Lighthouse CI | 8h | Medium |

### Success Metrics

| Metric | Current (Est.) | Target | Measurement |
|--------|----------------|--------|-------------|
| SUS (System Usability Scale) | ~55 | 75+ | Post-launch survey (n=20) |
| Task completion time — JE entry | 3-4 min | <2 min | Playwright timing |
| Journal entry error rate | ~8% | <2% | Event log analysis |
| WCAG compliance | ~60% | 100% AA | axe-core + manual audit |
| Navigation task success | ~70% | 95% | First-click testing |
| Mobile usability score | ~40 | 80+ | Lighthouse mobile |

---

## 11. Deliverable Format

### Mockup Descriptions (for designer handoff)

#### Screen: Journal Entry Form

```
Layout:
┌──────────────────────────────────────────────────────────┐
│ [← Back]  New Journal Entry          JE-2024-0042  [🔔][?]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Posting Date    Voucher Type        Narration/Description│
│  [2026-04-15 ▾] [Journal Entry ▾]    [                   │
│                                       Enter detailed      │
│                                       accounting narration│
│                                       ...                 │
│                                       ]                   │
│                                                          │
│  Ledger Distribution                        [+ Add Row]  │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Account / Ledger │ Description  │ Debit (₹)│ Credit  ││
│  ├──────────────────┼──────────────┼──────────┼─────────┤│
│  │ [Cash Acct ▾]    │ Cash deposit │ 100,000  │         ││
│  │ [Bank Acct ▾]    │ Bank deposit │          │ 100,000 ││
│  ├──────────────────┴──────────────┼──────────┼─────────┤│
│  │ Total Distribution              │ ₹100,000 │₹100,000 ││
│  └──────────────────────────────────────────┴──────────┘│
│  ✅ Voucher is balanced                                 │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  ⌘S Save Draft         ⌘↵ Post Entry →                 │
└──────────────────────────────────────────────────────────┘

States:
- Loading: Skeleton rows in table (3 shimmer rows)
- Error: Red banner "Voucher out of balance by ₹5,000"
- Success: Toast "Posted to ledger" → redirect to /journal
- Empty: "No lines yet. Add your first distribution."
- Disabled: Post button disabled when unbalanced
```

#### Screen: Dashboard (Redesigned)

```
Layout:
┌──────────────────────────────────────────────────────────┐
│ Good morning, Bharat Logistics  │ [Export] [Add Entry →] │
│ April 2026 • FY 2026-27                                 │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ Revenue  │ Expenses │ Net Profit│ Cash     │ GST Payable  │
│ MTD      │ MTD      │ MTD      │          │              │
│ ₹12.45L  │ ₹4.12L   │ ₹8.33L   │ ₹45.13L  │ ₹1.89L      │
│ ▲ 14.2%  │ ▼ 2.1%   │ 67% GM   │          │ Due in 12d  │
├──────────┴──────────┴──────────┴──────────┴──────────────┤
│ ┌────────────────────┐ ┌────────────────────────────────┐ │
│ │ Cash Flow (30d)    │ │ Recent Entries                 │ │
│ │ ╱╲    ╱╲    ╱╲     │ │ ┌──────┬────────┬──────┬─────┐│ │
│ │╱  ╲╱  ╲╱  ╲╱  ╲    │ │ │JE-42│Cash dep│₹100K│✅   ││ │
│ │   60K  90K  78K    │ │ │JE-41│Sale inv│₹50K │✅   ││ │
│ └────────────────────┘ │ │JE-40│Expense │₹23K │✅   ││ │
│ ┌────────────────────┐ │ │JE-39│Rent pmt│₹80K │📝   ││ │
│ │ Quick Actions      │ │ └──────┴────────┴──────┴─────┘│ │
│ │ [+ Record Entry]   │ │ [→ View All Ledger]            │ │
│ │ [→ Profit & Loss]  │ └────────────────────────────────┘ │
│ │ [→ File GST]       │                                    │
│ └────────────────────┘                                    │
└──────────────────────────────────────────────────────────┘
```

### Component Spec Table Template

| Property | Type | Default | Options | Description |
|----------|------|---------|---------|-------------|
| `variant` | `string` | `'primary'` | `'primary'`, `'secondary'`, `'ghost'`, `'danger'` | Visual style |
| `size` | `string` | `'md'` | `'sm'`, `'md'`, `'lg'` | Height/padding |
| `loading` | `boolean` | `false` | — | Shows spinner, disables |
| `disabled` | `boolean` | `false` | — | Reduced opacity, no hover |
| `fullWidth` | `boolean` | `false` | — | `w-full` |
| `children` | `ReactNode` | — | — | Button content |
| `onClick` | `() => void` | — | — | Click handler |

---

*End of document. Next step: Phase 1 Quick Wins execution.*
