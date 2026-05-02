# ComplianceOS UI/UX Redesign — Implementation Plan

> **Date:** 2026-05-02
> **Goal:** Apply the Editorial Ledger design system to all 96 pages and 25 shared components
> **Spec Reference:** `docs/superpowers/specs/2026-05-02-editorial-ledger-ui-redesign.md`

---

## Phase 1: Foundation

**Goal:** Fix root design system tokens before touching any page.

### Task 1.1: Update Dependencies
**Files:**
- Modify: `apps/web/package.json`

**Steps:**
- [ ] Add `@fontsource/playfair-display` (weights: 400, 600, 700)
- [ ] Add `@fontsource/syne` (weights: 400, 500, 600, 700)
- [ ] Remove `@fontsource/outfit`
- [ ] Remove `@fontsource/inter`
- [ ] Run `pnpm install` in `apps/web`

---

### Task 1.2: Update globals.css
**Files:**
- Modify: `apps/web/app/globals.css`

**Steps:**
- [ ] Update `@import` statements: replace Outfit/Inter with Playfair Display/Syne
- [ ] Update CSS variables:
  - `--color-amber`: `#D97706`
  - `--color-amber-hover`: `#B45309`
  - `--font-display`: `'Playfair Display', serif`
  - `--font-ui`: `'Syne', sans-serif`
  - `--font-mono`: `'DM Mono', monospace`
- [ ] Update all `.font-display`, `.font-ui` utility classes
- [ ] Update button `.btn-primary` focus ring to use amber rgba
- [ ] Update `.input-field:focus` box-shadow to use amber rgba
- [ ] Update `.badge-amber` background to use amber rgba
- [ ] Update `.onboarding-step-number.current` background to use amber rgba
- [ ] Update `.command-palette-item:hover` background to amber
- [ ] Ensure all color references use CSS variables, no hardcoded hex

---

### Task 1.3: Update tailwind.config.ts
**Files:**
- Modify: `apps/web/tailwind.config.ts`

**Steps:**
- [ ] Fix `colors.amber.DEFAULT` to `#D97706`
- [ ] Fix `colors.amber.hover` to `#B45309`
- [ ] Fix `colors.primary` to `#D97706`
- [ ] Fix `colors.primary-container` to `#B45309`
- [ ] Fix `colors.amber-text` to `#D97706`
- [ ] Update `fontFamily`:
  - `display`: `['Playfair Display', 'serif']`
  - `ui`: `['Syne', 'sans-serif']`
  - `mono`: `['DM Mono', 'monospace']`
  - Remove all `ui-md`, `ui-sm`, `ui-xs`, `ui-lg`, `mono-md`, `mono-lg`, `marketing-*`, `display-*` fontFamily entries (use fontSize utilities instead)
- [ ] Add grid container utilities if needed ( Tailwind v4 uses CSS-first, may not need config changes)
- [ ] Verify all color tokens reference amber correctly
- [ ] Ensure `borderRadius` and `boxShadow` tokens match design spec

---

### Task 1.4: Update Root Layout
**Files:**
- Modify: `apps/web/app/layout.tsx`

**Steps:**
- [ ] Ensure `<html>` has `font-ui` class or correct font-family fallback
- [ ] Verify `scroll-smooth` is present
- [ ] No other changes needed

---

### Task 1.5: Update UI Primitives

**Files:**
- Modify: `apps/web/components/ui/badge.tsx`
- Modify: `apps/web/components/ui/button.tsx`
- Modify: `apps/web/components/ui/card.tsx`
- Modify: `apps/web/components/ui/data-table.tsx`
- Modify: `apps/web/components/ui/kpi-tile.tsx`
- Modify: `apps/web/components/ui/skeleton.tsx`
- Modify: `apps/web/components/ui/empty-state.tsx`
- Modify: `apps/web/components/ui/error-state.tsx`

**Steps:**
- [ ] `badge.tsx`: Update variants — amber uses `rgba(217,119,6,0.1)` bg, success/danger/gray per spec
- [ ] `button.tsx`: Update to match `.btn` primitive styles, amber primary, focus ring amber
- [ ] `card.tsx`: Update border-radius to `rounded-xl`, shadow to `shadow-sm`, font-display for CardTitle
- [ ] `data-table.tsx`: Update sticky header bg to `bg-surface-muted`, pagination active bg to amber, remove `hover:bg-stone-200` use `hover:bg-surface-muted`
- [ ] `kpi-tile.tsx`: Update border-top logic, ensure font-mono for value, Syne for label
- [ ] `skeleton.tsx`: Update bg to `bg-lighter`, ensure pulse animation
- [ ] `empty-state.tsx`: Update title to Playfair Display 20px, description to Syne 13px, CTA to `.btn-primary`
- [ ] `error-state.tsx`: Update danger color to `#DC2626`, bg to `bg-danger-bg`, button to `.btn-secondary`

---

## Phase 2: App Shell

### Task 2.1: Update App Layout
**Files:**
- Modify: `apps/web/app/(app)/layout.tsx`

**Steps:**
- [ ] Verify main content padding `p-6` (24px)
- [ ] Verify `lg:ml-64` sidebar offset
- [ ] Verify `pt-14 pb-16 lg:pb-0` topbar/mobile nav clearance
- [ ] Ensure `<main>` has `id="main-content"` and `tabIndex={-1}`

---

### Task 2.2: Update Sidebar
**Files:**
- Modify: `apps/web/components/app/sidebar.tsx`

**Steps:**
- [ ] Update nav link active state: border color to amber, text color to dark, font-semibold
- [ ] Update nav link inactive state: text-mid, hover:text-dark
- [ ] Update section header: Syne 10px, uppercase, tracking-widest, text-light
- [ ] Update collapsible group active icon color to amber
- [ ] Update FY footer: Syne 10px label, DM Mono 12px value
- [ ] Update FY popover: amber border for selected, amber bg for active
- [ ] Update Support/Sign Out buttons: match design system
- [ ] Ensure `aria-label`, `aria-expanded` on all interactive elements

---

### Task 2.3: Update Topbar
**Files:**
- Modify: `apps/web/components/app/topbar.tsx`

**Steps:**
- [ ] Update search box: bg-surface-muted, border-border, hover border amber
- [ ] Update search placeholder: Syne 13px, text-light
- [ ] Update quick nav links: active border-bottom amber, text-dark
- [ ] Update user avatar: bg-amber, text-white
- [ ] Update user menu popover: border-border, shadow-lg
- [ ] Update user menu links: hover bg-surface-muted, text-amber on hover
- [ ] Update sign out button: text-danger, hover bg-danger-bg

---

### Task 2.4: Update Mobile Nav
**Files:**
- Modify: `apps/web/components/app/mobile-nav.tsx`

**Steps:**
- [ ] Update active state: text-amber
- [ ] Update inactive state: text-mid
- [ ] Ensure 56px height, fixed bottom, z-40

---

## Phase 3: Core Accounting Pages

### Task 3.1: Dashboard
**Files:**
- Modify: `apps/web/app/(app)/dashboard/page.tsx`

**Steps:**
- [ ] Update greeting heading: Playfair Display 36px
- [ ] Update FY badge: DM Mono 10px, uppercase, bg-surface-muted, border-border
- [ ] Update KPI row: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`
- [ ] Update receivables summary cards: icon container bg, Syne overline 10px, DM Mono value
- [ ] Update main body: `grid-cols-1 lg:grid-cols-12 gap-8`
  - `lg:col-span-8` for DataTable
  - `lg:col-span-4` for sidebar widgets
- [ ] Update DataTable: use updated primitive, ensure 10+ rows visible
- [ ] Update FY Progress widget: amber progress bar, Syne text
- [ ] Update Quick Actions widget: dark bg, amber icons, hover states
- [ ] Update Audit Readiness widget: card styling, group hover transform

---

### Task 3.2: Journal List
**Files:**
- Modify: `apps/web/app/(app)/journal/page.tsx`

**Steps:**
- [ ] Update page header: overline "General Ledger" (Syne 10px, amber), title "Journal Entries" (Playfair 24px)
- [ ] Update action buttons: Export CSV (.btn-secondary), Add Entry (.btn-primary)
- [ ] Update filter tabs: use `.filter-tabs` / `.filter-tab` classes, active has shadow-sm
- [ ] Update search input: `.input-field` with search icon
- [ ] Update DataTable columns:
  - Entry #: DM Mono 13px, amber-text, hover underline
  - Date: DM Mono 12px, text-mid
  - Narration: Syne 13px, text-dark
  - Debit/Credit: DM Mono 13px, tabular-nums, right-aligned
  - Status: Badge component
- [ ] Update footer: bg-surface-muted, border-t-2 border-border, Syne 10px uppercase total label, DM Mono 13px total value
- [ ] Update empty state: use EmptyState primitive

---

### Task 3.3: Journal Entry Detail
**Files:**
- Modify: `apps/web/app/(app)/journal/[id]/page.tsx`

**Steps:**
- [ ] Full redesign — audit existing file first
- [ ] Header: Entry # (DM Mono, amber), Date (DM Mono), Status (Badge)
- [ ] Lines table: `.table` / `.table-dense`, Account, Debit, Credit, right-aligned amounts
- [ ] Balance bar: shared BalanceBar component, real-time difference
- [ ] Actions: Edit (.btn-secondary), Delete (.btn-danger), Post (.btn-primary for drafts), Void (.btn-danger for posted)
- [ ] Narration correction: inline form, `.input-field`
- [ ] Void modal: amber warning header, DM Mono for amounts, reason input

---

### Task 3.4: New Journal Entry
**Files:**
- Modify: `apps/web/app/(app)/journal/new/page.tsx`

**Steps:**
- [ ] Full redesign — audit existing file
- [ ] Header: "New Journal Entry" (Playfair 24px), Entry # auto-generated (DM Mono)
- [ ] Form grid: `grid-cols-1 lg:grid-cols-2 gap-6`
  - Date, Narration, Reference inputs
  - Full-width: Lines table
- [ ] Lines table: Account autocomplete, Debit/Credit `.input-mono`, Add Line button
- [ ] Balance bar: fixed at bottom of form, green check when balanced
- [ ] Actions: Discard (.btn-ghost), Save Draft (.btn-secondary), Post Entry (.btn-primary, disabled until balanced)
- [ ] Keyboard hints: ⌘S save, ⌘↵ post, N new line

---

### Task 3.5: Chart of Accounts
**Files:**
- Modify: `apps/web/app/(app)/coa/page.tsx`

**Steps:**
- [ ] Update tree view: grouped by kind, collapsible groups
- [ ] Update group headers: Playfair Display 16px, bg-surface-muted, border-t-2 border-amber
- [ ] Update line items: Code (DM Mono 11px), Name (Syne 13px), Balance (DM Mono 13px, right-aligned)
- [ ] Update Dr/Cr labels: Badge component, green for Cr, amber for Dr
- [ ] Update inline add form: `.input-field`, `.btn-primary`

---

### Task 3.6: Accounts (List, Detail, New)
**Files:**
- Modify: `apps/web/app/(app)/accounts/page.tsx`
- Modify: `apps/web/app/(app)/accounts/[id]/page.tsx`
- Modify: `apps/web/app/(app)/accounts/new/page.tsx`

**Steps:**
- [ ] List: DataTable with `.table-dense`, overline + Playfair header, action buttons
- [ ] Detail: Card layout, header with account code (DM Mono), balance (DM Mono), status Badge
- [ ] New: Form grid `grid-cols-1 lg:grid-cols-2`, `.input-field`, `.btn-primary`

---

## Phase 4: Transactions & Compliance

### Task 4.1: Invoices (All Pages)
**Files:**
- Modify: `apps/web/app/(app)/invoices/page.tsx`
- Modify: `apps/web/app/(app)/invoices/[id]/page.tsx`
- Modify: `apps/web/app/(app)/invoices/[id]/edit/page.tsx`
- Modify: `apps/web/app/(app)/invoices/new/page.tsx`
- Modify: `apps/web/app/(app)/invoices/[id]/pdf/page.tsx`
- Modify: `apps/web/app/(app)/invoices/scan/page.tsx`

**Steps:**
- [ ] List: overline "Billing", Playfair header, filter tabs, DataTable with InvoiceStatusBadge
- [ ] Detail: header with invoice # (DM Mono, amber), customer, amount (DM Mono), status badge, action buttons
- [ ] Edit/New: form grid, `.input-field`, line items table, totals in DM Mono
- [ ] PDF: print-ready layout, Playfair headers, DM Mono amounts, no nav
- [ ] Scan: upload zone styling, scan results table

---

### Task 4.2: Receivables
**Files:**
- Modify: `apps/web/app/(app)/receivables/page.tsx`
- Modify: `apps/web/app/(app)/receivables/[customerId]/page.tsx`

**Steps:**
- [ ] List: Aging table (0-30, 31-60, 61-90, 90+), DM Mono amounts, color-coded overdue
- [ ] Customer detail: summary card, invoice history DataTable

---

### Task 4.3: Payments
**Files:**
- Modify: `apps/web/app/(app)/payments/page.tsx`
- Modify: `apps/web/app/(app)/payments/new/page.tsx`

**Steps:**
- [ ] List: DataTable, overline, Playfair header, filter tabs
- [ ] New: form grid, allocation table, balance bar

---

### Task 4.4: GST (All Pages)
**Files:**
- Modify: `apps/web/app/(app)/gst/returns/page.tsx`
- Modify: `apps/web/app/(app)/gst/returns/[period]/*` (4 files)
- Modify: `apps/web/app/(app)/gst/ledger/*` (4 files)
- Modify: `apps/web/app/(app)/gst/reconciliation/*` (2 files)
- Modify: `apps/web/app/(app)/gst/payment/*` (2 files)

**Steps:**
- [ ] Returns list: period cards, status badges, filing deadline indicators
- [ ] GSTR forms: dense tables, DM Mono for all GST amounts, section headers with amber border
- [ ] Ledger: tabbed layout, table per tax type
- [ ] Reconciliation: mismatch table, amber for unmatched, green for matched
- [ ] Payment: challan form, payment history table

---

### Task 4.5: ITR (All Pages)
**Files:**
- Modify: `apps/web/app/(app)/itr/returns/*` (4 files)
- Modify: `apps/web/app/(app)/itr/computation/*` (3 files)
- Modify: `apps/web/app/(app)/itr/payment/*` (5 files)

**Steps:**
- [ ] Returns: FY selector, return status cards
- [ ] Computation: tax computation table, regime comparison toggle, DM Mono for all tax amounts
- [ ] Presumptive scheme: scheme cards, 44AD/44ADA/44AE selection
- [ ] Payment: advance tax installments table, self-assessment form

---

## Phase 5: Operations & Reports

### Task 5.1: Inventory (All Pages)
**Files:**
- Modify: `apps/web/app/(app)/inventory/page.tsx`
- Modify: `apps/web/app/(app)/inventory/products/page.tsx`
- Modify: `apps/web/app/(app)/inventory/products/new/page.tsx`
- Modify: `apps/web/app/(app)/inventory/stock/page.tsx`
- Modify: `apps/web/app/(app)/inventory/reports/*` (2 files)

**Steps:**
- [ ] Dashboard: KPI tiles (total SKU value, low stock count), product table
- [ ] Products: DataTable with SKU, name, stock, valuation (FIFO), DM Mono for amounts
- [ ] New product: form grid, `.input-field`, stock adjustment inline
- [ ] Stock: movement log table, adjust stock dialog
- [ ] Reports: expiry report, stock valuation report

---

### Task 5.2: Payroll (All Pages)
**Files:**
- Modify: `apps/web/app/(app)/payroll/page.tsx`
- Modify: `apps/web/app/(app)/payroll/[id]/page.tsx`
- Modify: `apps/web/app/(app)/payroll/process/page.tsx`
- Modify: `apps/web/app/(app)/payroll/success/page.tsx`
- Modify: `apps/web/app/(app)/payroll/team-salary-preview/page.tsx`
- Modify: `apps/web/app/(app)/payroll-reports/*` (4 files)

**Steps:**
- [ ] List: month selector, salary summary table, status badges
- [ ] Detail: payslip card, earnings/deductions table, net pay (DM Mono, large)
- [ ] Process: employee checklist, salary preview, process button
- [ ] Success: confirmation card, download payslip button
- [ ] Reports: PF challan, ESI challan, Form 16 — all print-ready tables

---

### Task 5.3: Employees (All Pages)
**Files:**
- Modify: `apps/web/app/(app)/employees/page.tsx`
- Modify: `apps/web/app/(app)/employees/[id]/page.tsx`
- Modify: `apps/web/app/(app)/employees/[id]/salary/page.tsx`
- Modify: `apps/web/app/(app)/employees/new/page.tsx`
- Modify: `apps/web/app/(app)/my-payslips/page.tsx`

**Steps:**
- [ ] List: DataTable with employee code, name, department, salary (DM Mono)
- [ ] Detail: profile card, salary structure, document links
- [ ] Salary: salary breakdown table, statutory deductions
- [ ] New: form grid, `.input-field`, salary structure inline
- [ ] My payslips: payslip cards, download buttons

---

### Task 5.4: Reports (All Pages)
**Files:**
- Modify: `apps/web/app/(app)/reports/trial-balance/page.tsx`
- Modify: `apps/web/app/(app)/reports/profit-loss/page.tsx`
- Modify: `apps/web/app/(app)/reports/balance-sheet/page.tsx`
- Modify: `apps/web/app/(app)/reports/cash-flow/page.tsx`
- Modify: `apps/web/app/(app)/reports/ledger/page.tsx`
- Modify: `apps/web/app/(app)/reports/pl/page.tsx`

**Steps:**
- [ ] Trial Balance: report container centered `max-w-[1100px]`, Playfair company name, DM Mono amounts, group headers with amber border, grand total with border-t-2
- [ ] P&L: Schedule III format, section headers (Playfair 16px, bg-surface-muted), line items with indentation, final profit/loss card (green bg for profit, red for loss)
- [ ] Balance Sheet: 2-column grid `md:grid-cols-2`, Equity & Liabilities | Assets, balance check banner
- [ ] Cash Flow: indirect method, operating/investing/financing sections, net cash flow summary
- [ ] Ledger: account selector, transaction table with running balance, DM Mono for all amounts
- [ ] All reports: `@media print` styles, hide nav/buttons, preserve colors, page-break-inside avoid

---

## Phase 6: Onboarding, Settings, Auth

### Task 6.1: Onboarding Wizard
**Files:**
- Modify: `apps/web/app/(app)/onboarding/page.tsx`
- Modify: `apps/web/app/(app)/onboarding/step-business-profile.tsx`
- Modify: `apps/web/app/(app)/onboarding/step-module-activation.tsx`
- Modify: `apps/web/app/(app)/onboarding/step-coa-template.tsx`
- Modify: `apps/web/app/(app)/onboarding/step-coa-review.tsx`
- Modify: `apps/web/app/(app)/onboarding/step-fy-gst.tsx`
- Modify: `apps/web/app/(app)/onboarding/step-opening-balances.tsx`
- Modify: `apps/web/app/(app)/onboarding/components/account-tree.tsx`

**Steps:**
- [ ] Page layout: full-screen per step, no sidebar, `max-w-4xl mx-auto px-6 md:px-8`
- [ ] Step indicator: `.onboarding-step-number` classes
  - Completed: amber fill, white checkmark
  - Current: amber border, amber text, amber bg subtle
  - Pending: gray border, gray text
- [ ] Connector lines: `.onboarding-connector`, amber when completed
- [ ] Form inputs: `.input-field`, labels uppercase 10px tracking-widest
- [ ] Section headers: Playfair Display 20px
- [ ] Opening balances: live debit/credit difference with BalanceBar
- [ ] FY setup: auto-set to current Indian FY (Apr–Mar)
- [ ] Final step: dashboard preview card, quick-start prompt

---

### Task 6.2: Settings
**Files:**
- Modify: `apps/web/app/(app)/settings/fiscal-years/page.tsx`
- Modify: `apps/web/app/(app)/settings/fiscal-years/[id]/page.tsx`
- Modify: `apps/web/app/(app)/settings/invoices/page.tsx`

**Steps:**
- [ ] Fiscal years: table with FY name, status badge, close FY button, days remaining
- [ ] FY detail: edit form, `.input-field`, status toggle
- [ ] Invoice settings: form grid, prefix, numbering, terms

---

### Task 6.3: Auth
**Files:**
- Modify: `apps/web/app/(auth)/login/page.tsx`
- Modify: `apps/web/app/(auth)/signup/page.tsx`
- Modify: `apps/web/app/(auth)/layout.tsx`
- Modify: `apps/web/app/(auth)/error.tsx`

**Steps:**
- [ ] Login: centered card `max-w-[440px]`, Playfair "ComplianceOS" title, Syne subtitle, `.input-field` for email/password, `.btn-primary` submit, DM Mono for amount demo badge
- [ ] Signup: same card layout, progressive form fields, `.btn-primary`
- [ ] Layout: minimal, bg-lightest, centered
- [ ] Error: danger color, retry link

---

## Phase 7: Marketing

### Task 7.1: Marketing Layout & Shell
**Files:**
- Modify: `apps/web/app/(marketing)/layout.tsx`
- Modify: `apps/web/components/marketing/nav.tsx`
- Modify: `apps/web/components/marketing/footer.tsx`

**Steps:**
- [ ] Layout: unified container wrapper, skip link
- [ ] Nav: sticky, backdrop blur, `max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12`
  - Logo: Syne bold, text-dark
  - Links: Syne medium, active border-bottom amber
  - CTA: `.btn-primary` (amber)
- [ ] Footer: grid layout, links, copyright

---

### Task 7.2: Marketing Homepage
**Files:**
- Modify: `apps/web/app/(marketing)/page.tsx`

**Steps:**
- [ ] Hero: `grid-cols-1 md:grid-cols-2 gap-8 md:gap-16`, Playfair 64px heading, Syne 16px body, amber CTA + secondary button
- [ ] Social proof: `max-w-[1400px]`, grayscale logos
- [ ] Benefits: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6`, cards with amber top border on hover
- [ ] Product demo: dark section, tabbed screenshots
- [ ] Features: alternating 2-column grid, Playfair 26px headers
- [ ] Testimonials: `grid-cols-1 md:grid-cols-2 gap-8`, quote marks, grayscale avatars
- [ ] CTA: amber bg section, centered card, Playfair heading, amber button

---

### Task 7.3: Marketing Sub-Pages
**Files:**
- Modify: `apps/web/app/(marketing)/features/page.tsx`
- Modify: `apps/web/app/(marketing)/features/*` (5 files)
- Modify: `apps/web/app/(marketing)/pricing/page.tsx`
- Modify: `apps/web/app/(marketing)/about/page.tsx`
- Modify: `apps/web/app/(marketing)/blog/page.tsx`
- Modify: `apps/web/app/(marketing)/blog/[slug]/page.tsx`
- Modify: `apps/web/app/(marketing)/contact/page.tsx`
- Modify: `apps/web/app/(marketing)/contact/success/page.tsx`
- Modify: `apps/web/app/(marketing)/privacy/page.tsx`
- Modify: `apps/web/app/(marketing)/terms/page.tsx`
- Modify: `apps/web/app/(marketing)/cookies/page.tsx`
- Modify: `apps/web/app/(marketing)/security/page.tsx`

**Steps:**
- [ ] All pages: unified `max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12`
- [ ] Features overview: feature cards grid, Playfair headers
- [ ] Individual features: hero + detail grid, screenshots
- [ ] Pricing: 3-column pricing cards, amber CTA on recommended tier
- [ ] About: team grid, story section
- [ ] Blog: post cards grid, Playfair titles
- [ ] Blog post: article layout, Playfair headings, Syne body
- [ ] Contact: form grid, `.input-field`, `.btn-primary`
- [ ] Legal: plain text, Playfair headings, Syne body, max-w readable

---

### Task 7.4: Marketing Components
**Files:**
- Modify: `apps/web/components/marketing/button.tsx`
- Modify: `apps/web/components/marketing/feature-card.tsx`
- Modify: `apps/web/components/marketing/pricing-card.tsx`
- Modify: `apps/web/components/marketing/testimonial-card.tsx`
- Modify: `apps/web/components/marketing/faq-item.tsx`
- Modify: `apps/web/components/marketing/section-label.tsx`
- Modify: `apps/web/components/marketing/team-card.tsx`
- Modify: `apps/web/components/marketing/mobile-nav.tsx`

**Steps:**
- [ ] Button: amber primary, dark secondary, Syne font
- [ ] Feature card: icon, Playfair title, Syne description, amber top border on hover
- [ ] Pricing card: plan name (Playfair), price (DM Mono), features list, amber CTA
- [ ] Testimonial card: quote (Playfair italic), author (Syne bold), role (Syne xs)
- [ ] FAQ item: accordion, Syne text, amber icon
- [ ] Section label: Syne 12px, uppercase, amber, tracking-widest
- [ ] Team card: image, name (Syne bold), role (Syne xs)
- [ ] Mobile nav: hamburger, slide-out panel, amber active links

---

## Phase 8: Polish & Accessibility

### Task 8.1: Loading States
**Files:** All `page.tsx` with `isLoading` or `loading` state

**Steps:**
- [ ] Replace all generic spinners (`border-amber-500 border-t-transparent`) with skeleton screens
- [ ] Use `TableSkeleton` for list pages
- [ ] Use `CardSkeleton` for detail pages
- [ ] Use `KPISkeleton` for dashboard

---

### Task 8.2: Empty States
**Files:** All list `page.tsx`

**Steps:**
- [ ] Replace all inline empty divs with `<EmptyState>` component
- [ ] Ensure title is Playfair 20px, description Syne 13px, CTA `.btn-primary`

---

### Task 8.3: Error States
**Files:** All `page.tsx` with error handling

**Steps:**
- [ ] Replace generic error messages with `<ErrorState>` component
- [ ] Ensure danger color, actionable message, retry button

---

### Task 8.4: Command Palette
**Files:**
- Modify: `apps/web/components/command-palette.tsx`

**Steps:**
- [ ] Update styling: bg-surface, border-border, shadow-lg, rounded-xl
- [ ] Update input: Syne 16px, amber focus border
- [ ] Update items: Syne 13px, amber hover bg, white text on hover
- [ ] Add keyboard shortcut display (DM Mono 12px)
- [ ] Ensure focus trap, Esc to close, arrow key navigation
- [ ] Add empty state with suggested commands

---

### Task 8.5: Accessibility Pass
**Files:** All modified pages and components

**Steps:**
- [ ] All buttons have `aria-label` if icon-only
- [ ] All tables have `<thead>`, `<th scope="col">`
- [ ] All modals trap focus
- [ ] All status changes use `aria-live` regions
- [ ] Color not sole indicator — add icons to badges
- [ ] Heading hierarchy: single `<h1>`, logical `<h2>` → `<h3>`
- [ ] Skip link present on all layouts

---

### Task 8.6: Print Styles
**Files:**
- Modify: `apps/web/app/globals.css`

**Steps:**
- [ ] Add `@media print` rules for all report pages
- [ ] Hide nav, header, footer, buttons, filter tabs
- [ ] Force page breaks: `.card`, `.report-section` — `page-break-inside: avoid`
- [ ] Report container: no padding, no shadow, no border
- [ ] Ensure colors print (amber, green, red)

---

## Verification Commands

After each phase, run:

```bash
# Type check
pnpm --filter @complianceos/web typecheck

# Lint
pnpm --filter @complianceos/web lint

# Build
pnpm --filter @complianceos/web build

# E2E smoke tests
pnpm --filter @complianceos/web test:e2e --grep "smoke"
```

---

## Commit Strategy

One commit per task (or per group of related files). Use conventional commits:

```
feat(ui): add Playfair Display and Syne fonts, update color tokens
feat(ui): redesign sidebar with amber navigation
feat(ui): redesign dashboard with 12-column grid
feat(ui): redesign journal list and detail pages
feat(ui): redesign all invoice pages
...
```

---

*End of Implementation Plan*
