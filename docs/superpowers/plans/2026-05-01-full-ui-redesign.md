# ComplianceOS — Full UI Redesign Plan
**Date:** 2026-05-01  
**Scope:** All app screens (70+ routes) + marketing site (16+ routes)  
**Sidebar:** Replace layout.tsx inline sidebar with `<AppSidebar />` from `sidebar.tsx`  
**Strategy:** Shell first → Dashboard → Accounting → Reports → Domain modules → Marketing

---

## Analysis Summary

### What this application does
ComplianceOS is an Indian SME compliance management platform covering:
- Double-entry accounting (Journal Entries, Chart of Accounts, Ledger)
- Financial reports (Trial Balance, P&L, Balance Sheet, Cash Flow)
- GST compliance (GSTR-1/2B/3B, reconciliation, ledgers, payments)
- ITR filing (computation, advance tax, self-assessment, payment)
- Invoicing and receivables
- Payments
- Inventory management (FIFO, expiry, valuation)
- Payroll (PF/ESI/Form 16, multi-step wizard)
- Employees (directory, salary structure, payslips)
- Audit log

**User profile:** Indian SME owner, accountant, CFO. Data-dense, compliance-focused, professional. NOT a consumer app. Users spend hours per day in it — trust, accuracy, and fast information retrieval are primary UX values.

### Design direction
The existing token system is well-conceived:
- Warm amber accent (`#C8860A` primary-container, `#B47500` amber-text)
- Playfair Display for page headings/reports
- Syne for all UI text/labels/nav
- DM Mono for all financial numbers
- Sharp edges (2–4px radius) — correct for accounting software
- Flat design (shadow-sm only) — correct for data-dense context

**The direction is right. The implementation has fragmented from the design system over time.**

### Critical structural bugs (affect every screen)

| Bug | Impact |
|-----|--------|
| `AppSidebar` (sidebar.tsx, icon-based) is **never imported** in layout.tsx | App renders text-only, iconless sidebar |
| `AppTopBar` (topbar.tsx) is **never imported** in layout.tsx | App has no top navigation bar |
| `MobileNav` is **never imported** in layout.tsx | Mobile has no navigation |
| Sidebar not `fixed` — in flex row, not isolated scroll | Sidebar scrolls with page content |
| Double font loading (fontsource + Google Fonts CDN link in app/layout.tsx) | 3 extra font network requests per page load |
| `Card`/`Button` use raw `gray-200`/`gray-950` Tailwind colors | Off-brand, breaks dark mode |
| Typography scale mismatch: CSS vars (ui-md=14px) ≠ tailwind config (ui-md=16px) | Same class renders different sizes |
| `rounded-lg` = 4px in tailwind config, `--radius-lg` = 12px in CSS vars | Inconsistent border radii everywhere |
| `AppSidebar` navItems (11 items) doesn't match layout.tsx navItems (28 items) | Two out-of-sync nav definitions |
| `text-error` class used in sidebar.tsx — doesn't exist | Sign Out button has no color |
| Hardcoded "RK"/"Rahul Kumar" in topbar.tsx — no session data | Wrong user shown to all users |

---

## Phase 1 — Shell Unification
**Impact: fixes every screen simultaneously**

### Files to change

**`apps/web/app/(app)/layout.tsx`**
- Remove inline sidebar, FY switcher, and navItems definition
- Import and render `<AppSidebar />`, `<AppTopBar />`, `<MobileNav />`
- Fix main content positioning: `lg:ml-64 pt-14 lg:pt-14 pb-16 lg:pb-0`
- Retain: `<SkipToMainContent />`, `<CommandPalette />`, `<TRPCProvider />`, `<SessionProvider />`, `<ServerAuthCheck />`

**`apps/web/components/app/sidebar.tsx`**
- Expand navItems from 11 to full list with section groups (Accounting / Transactions / Compliance / Operations / Reports / System)
- Add collapsible sections for GST sub-routes and ITR sub-routes
- Fix `text-error` → `text-danger` on Sign Out
- Wire `activeFy` to future tRPC call (keep mock data for now, same values)
- Sidebar structure:
  ```
  Dashboard
  ─── Accounting ───────
  Journal       /journal
  Chart of Accs /coa
  Accounts      /accounts
  ─── Transactions ─────
  Invoices      /invoices
  Receivables   /receivables
  Payments      /payments
  ─── Compliance ───────
  GST           /gst/returns   [collapsible]
    Returns      /gst/returns
    Reconcil.    /gst/reconciliation
    Ledger       /gst/ledger
    Payment      /gst/payment
  ITR           /itr/returns   [collapsible]
    Returns      /itr/returns
    Computation  /itr/computation
    Payment      /itr/payment
  ─── Operations ───────
  Inventory     /inventory
  Payroll       /payroll
  Employees     /employees
  ─── Reports ──────────
  Reports       /reports/ledger [collapsible]
    Trial Balance /reports/trial-balance
    P&L           /reports/profit-loss
    Balance Sheet /reports/balance-sheet
    Cash Flow     /reports/cash-flow
    Ledger        /reports/ledger
  ─── System ───────────
  Audit Log     /audit-log
  Settings      /settings/fiscal-years
  ─────────────────────
  [FY Switcher Footer]
  Support
  Sign Out
  ```

**`apps/web/components/app/topbar.tsx`**
- Connect `useSession()` to replace hardcoded "RK"/"Rahul Kumar"/"rahul@complianceos.in"
- Wire search input to open CommandPalette (call `openCommandPalette()` from `useKeyboardShortcuts`)
- Keep all existing visual structure

**`apps/web/app/layout.tsx`** (root layout)
- Remove Google Fonts `<link>` tag (fonts already load via @fontsource in globals.css)

### Target layout structure after Phase 1
```
┌─────────────────────────────────────────────────────┐
│  AppTopBar (fixed, h-14, full-width, z-50)          │
├────────────┬────────────────────────────────────────┤
│ AppSidebar │  <main id="main-content">              │
│ (fixed,    │  (lg:ml-64, pt-14, flex-1,             │
│  w-64,     │   min-h-screen, p-6)                   │
│  pt-14,    │                                        │
│  h-screen, │  {children}                            │
│  overflow-y│                                        │
│  -auto,    │                                        │
│  lg:flex,  │                                        │
│  hidden)   │                                        │
├────────────┴────────────────────────────────────────┤
│  MobileNav (fixed, bottom-0, h-16, lg:hidden)       │
└─────────────────────────────────────────────────────┘
```

---

## Phase 2 — Design Token Alignment

**`apps/web/tailwind.config.ts`**
- Align fontSize scale with CSS vars:
  - `ui-xs`: 11px (currently 12px)
  - `ui-sm`: 13px (currently 14px)
  - `ui-md`: 14px (currently 16px)
  - `ui-lg`: 15px (currently 18px)
  - `mono-sm`: 11px (currently 12px)
  - `mono-md`: 13px (currently 14px)
  - `mono-lg`: 15px (currently 18px)
- Align borderRadius:
  - `lg`: 8px (currently 4px — bridges gap between tailwind and CSS var --radius-md)
  - `xl`: 12px (currently 8px — aligns with --radius-lg)

**`apps/web/components/ui/card.tsx`**
- Replace `border-gray-200` → `border-border-subtle`
- Replace `text-gray-950` → `text-dark`
- Replace `text-gray-500` → `text-mid`

**`apps/web/components/ui/button.tsx`**
- Replace `amber-500` → `primary-container`
- Replace `gray-300` → `border-subtle`
- Replace `gray-700`/`gray-800` → `dark`/`mid`

**`apps/web/components/ui/kpi-tile.tsx`**
- Replace `border-stone-300` → `border-border-subtle`
- Replace `text-stone-400` → `text-mid`
- Replace `text-stone-900` → `text-dark`

---

## Phase 3 — Dashboard (`/dashboard`)

**`apps/web/app/(app)/dashboard/page.tsx`**

### Page header
- Playfair greeting (Good morning/afternoon/evening, {company})
- Subtitle: current month + FY badge (mono)
- Right: "Export PDF" ghost button + "Add Entry" primary CTA

### KPI row
- 4× `KpiTile` (already correct — token fix from Phase 2 cleans up)
- Variants: Revenue (amber) / Expenses (dark) / Net Profit (amber) / Cash & Bank (neutral)

### Main grid (12-col, 8+4 split on desktop)
Left (8-col):
- "Recent Entries" card using `DataTable<JournalEntry>` component
- Columns: Entry# (mono, amber link) / Date (mono) / Narration / Amount (mono, right) / Status (Badge)
- Empty state: EmptyState component with "No entries yet" + "New Journal Entry" CTA

Right (4-col):
- FY Progress card (keep existing progress bar)
- Quick Actions dark card (keep existing stone-900 background)
- Audit Readiness card (keep existing)

### Receivables widget (below KPI row, above main grid)
- 3-column summary: Total Outstanding / Overdue / Top Customer
- Sources from tRPC `receivables.dashboard` — graceful fallback if null

---

## Phase 4 — Journal Module

### `/journal` (list)
**`apps/web/app/(app)/journal/page.tsx`**
- Page header: "Journal Entries" (Playfair h1) + "New Entry" CTA
- Filter row: Tab pills (All / Draft / Posted / Voided) + date range inputs + search
- `DataTable<JournalEntry>` with columns:
  - Entry # (mono, amber link to /journal/[id])
  - Date (mono)
  - Narration
  - Debit (mono, right-aligned)
  - Credit (mono, right-aligned)
  - Status (Badge: draft=amber, posted=success, voided=gray)
- Footer: total debit / total credit (mono, bold)
- Skeleton loading state
- EmptyState when filtered results = 0

### `/journal/new`
**`apps/web/app/(app)/journal/new/page.tsx`**
- Two-column layout (left 40% metadata, right 60% line items)
- Left: FormField wrappers for Entry #, Date, FY, Narration, Reference, Tags
- Right: line items table with Add Row button; each row = Account (Combobox) / Description / Debit input / Credit input / Delete
- BalanceBar sticky at bottom of line items
- Button group: "Post Entry" (primary) / "Save Draft" (outline) / "Discard" (ghost)
- Post triggers `DialogPostEntryConfirmation`

### `/journal/[id]` (detail)
**`apps/web/app/(app)/journal/[id]/page.tsx`**
- Status banner: amber strip (draft) / green strip (posted) / gray strip (voided)
- Header block: Entry #, Date, Narration, FY, Reference
- Line items table (read-only): Account / Description / Debit / Credit
- Totals row: total debit / total credit (must balance = shown in green)
- Footer: Posted by, timestamp, link to audit log
- Actions: "Void" (danger, shown if posted) / "Edit" (shown if draft)
- Void triggers `DialogVoidEntryConfirmation`

---

## Phase 5 — Accounts Module

### `/coa` (Chart of Accounts, hierarchical)
**`apps/web/app/(app)/coa/page.tsx`**
- Page header: "Chart of Accounts" + "Export CSV" + "New Account" CTA
- 4-summary tiles row: Total Assets / Liabilities / Equity / Net Income (mock values)
- Search bar (filters tree)
- "Collapse All / Expand All" toggle
- Hierarchical tree table:
  - Indent levels 1-4 with visual connector lines
  - Columns: Account Name / Code (mono) / Type badge / Normal Balance / Balance (mono, right)
  - Expandable parent rows with chevron
  - Leaf rows: clickable → opens `AccountPreviewSlideOver`
  - Active account: amber left border
- "Reset to Template" link → `DialogResetCoaTemplate`

### `/accounts` (flat list)
**`apps/web/app/(app)/accounts/page.tsx`**
- `DataTable<Account>` with columns: Code (mono) / Name / Type badge / Normal Balance / Opening Balance (mono) / Current Balance (mono)
- Toolbar: search input + Type filter (select: All/Asset/Liability/Equity/Revenue/Expense)
- New Account button → `/accounts/new`

### `/accounts/new`
**`apps/web/app/(app)/accounts/new/page.tsx`**
- FormField wrappers for: Account Code, Account Name, Account Type (select), Parent Account (Combobox), Opening Balance, Normal Balance (Dr/Cr radio), Notes
- Submit: "Create Account" primary CTA

### `/accounts/[id]` (ledger)
**`apps/web/app/(app)/accounts/[id]/page.tsx`**
- Account header card: Name + Code + Type badge + Current Balance (large mono, amber) + Normal Balance
- Toolbar: Period selector (Current FY / Last FY / Custom date range) + "Export Statement" CTA
- Ledger table: Date (mono) / Entry # (mono, amber link) / Narration / Debit (mono) / Credit (mono) / Running Balance (mono)
- Totals footer row

---

## Phase 6 — Financial Reports

All reports share a layout pattern:
- Page header: Report title (Playfair h1) + FY selector + Export PDF + Audit Trail link
- Print stylesheet: hide sidebar/topbar, full-width content
- Section headers: Playfair Display, uppercase tracking

### `/reports/trial-balance`
- Accounts grouped by type (Assets / Liabilities / Equity / Revenue / Expenses)
- Dr/Cr columns in DM Mono
- Section subtotals
- Grand total row (amber background)
- Toggle: "Show zero-balance accounts"

### `/reports/profit-loss` (Schedule III)
- Two-year comparison columns
- Schedule reference numbers (I, II, etc.) in text-mid
- Section groupings: Revenue from Operations / Other Income / Total Income / Expenses / Profit Before Tax / Tax / Net Profit
- Playfair section headers, DM Mono amounts

### `/reports/balance-sheet`
- Vertical Schedule III format
- Section 1: Equity & Liabilities (Shareholder's Equity / Non-current Liabilities / Current Liabilities)
- Section 2: Assets (Non-current Assets / Current Assets)
- Two-year comparison columns
- Note reference numbers

### `/reports/cash-flow`
- Three sections: Operating / Investing / Financing
- Indirect method adjustments table
- Net cash per section (bold, amber if positive)
- Opening + Closing cash reconciliation

---

## Phase 7 — Invoicing

### `/invoices` (list)
**`apps/web/app/(app)/invoices/page.tsx`**
- Status tabs: All / Draft / Sent / Paid / Partially Paid / Overdue
- `DataTable<Invoice>`: Invoice # (mono) / Customer / Date (mono) / Due Date (mono) / Amount (mono, right) / Status badge
- Overdue rows: subtle `bg-danger-bg/20` tint
- Page header: "Invoices" + "Scan Invoice" ghost + "New Invoice" primary CTA
- Footer: total invoiced / total outstanding

### `/invoices/new`
**`apps/web/app/(app)/invoices/new/page.tsx`**
- Header fields: Customer (Combobox) / Invoice # / Date / Due Date / Payment Terms
- Line items table: Description / Qty / Rate / GST% / Amount
- GST summary below table: CGST / SGST / IGST (conditional on transaction type)
- Total block (right-aligned): Subtotal / Tax / Grand Total in DM Mono
- CTAs: "Save Draft" / "Preview PDF" / "Send to Customer"

### `/invoices/[id]`
**`apps/web/app/(app)/invoices/[id]/page.tsx`**
- Invoice header block: Customer name/address, Invoice #, Date, Due Date, Status badge
- Line items table (read-only)
- GST breakdown
- Total block
- Payment history section (if any payments recorded)
- Actions: Edit / Record Payment / Void / Download PDF

### `/invoices/[id]/edit`
- Same as /invoices/new but pre-filled

### `/invoices/scan`
**`apps/web/app/(app)/invoices/scan/page.tsx`**
- Drag-and-drop upload zone (dashed border, icon center)
- After upload: left pane = image preview, right pane = extracted fields with FormField wrappers
- Manual correction before saving

---

## Phase 8 — Payments + Receivables

### `/payments` (list) + `/payments/new`
- Pattern mirrors invoices list/form
- List: Vendor / Payment # / Date / Mode / Amount / Linked Invoice
- New: FormField wrappers, invoice allocation section, `DialogPaymentAllocation`

### `/receivables`
**`apps/web/app/(app)/receivables/page.tsx`**
- Summary row: Total Outstanding / Overdue / 90+ days
- `DataTable<Customer>`: Customer / Outstanding (mono) / Current / 1-30 / 31-60 / 61-90 / 90+ aging buckets (all mono)
- Click row → `/receivables/[customerId]`

### `/receivables/[customerId]`
**`apps/web/app/(app)/receivables/[customerId]/page.tsx`**
- Customer header card: Name, GSTIN, Total Outstanding
- Invoice-level aging table with "Record Payment" per row

---

## Phase 9 — GST Module

### `/gst/returns` (hub)
**`apps/web/app/(app)/gst/returns/page.tsx`**
- Period grid (12 cards, Apr–Mar): Month name / Filed on / Status badge (Not Filed / Draft / Filed / Amended)
- Current period card: amber border highlight
- Each card: GSTR-1 / GSTR-3B status dots

### `/gst/returns/[period]` (period detail)
- Return type links: GSTR-1 / GSTR-2B / GSTR-3B
- Filing status and deadlines

### `/gst/returns/[period]/gstr1`
- Three tabs: B2B Supplies / B2C Supplies / CDNR
- `DataTable` per tab
- Section totals, File Return CTA → `DialogFileGstReturn`

### `/gst/returns/[period]/gstr2b`
- ITC table: Supplier GSTIN / Invoice # / Date / Amount / ITC Available / Match Status badge
- Filter by match status (Matched / Mismatched / Missing)

### `/gst/returns/[period]/gstr3b`
- Summary form sections: Outward Supplies / ITC / Tax Liability / Offset / Net Payable
- Challan details (if filed)

### `/gst/reconciliation`
- Books vs Portal comparison table
- Match status filter
- Link to mismatch detail

### `/gst/reconciliation/mismatches`
- Supplier GSTIN / Invoice # / Books Amount / Portal Amount / Difference / Resolution

### `/gst/ledger` (tabbed: cash/itc/liability)
- Three tabs using URL sub-routes
- Each: Opening Balance / Credits / Debits / Closing Balance table

### `/gst/payment` + `/gst/payment/history`
- Challan form: CGST/SGST/IGST/Cess amounts, payment mode
- History: DataTable of past challans

---

## Phase 10 — ITR Module

### `/itr/returns` (list)
- FY-grouped accordion; each entry: Return Type / Filing Date / Status / Tax Paid

### `/itr/returns/[fy]/[id]` (detail)
- Return summary: income sources, deductions, computed tax, filed on

### `/itr/computation`
- Tax worksheet sections: Gross Income / Deductions / Net Income / Tax / Surcharge / Cess / Relief / Net Tax
- All amounts in DM Mono

### `/itr/computation/regime-comparison`
- Side-by-side table: Old Regime vs New Regime
- Recommendation badge (green "New regime saves ₹X")

### `/itr/computation/presumptive-scheme`
- Turnover input / Section (44AD/44ADA) selector / Computed income display

### `/itr/payment/advance-tax`
- Quarterly timeline: Jun 15 / Sep 15 / Dec 15 / Mar 15
- Per quarter: Due / Paid / Status badge

### `/itr/payment/self-assessment` + `/recording` + `/history`
- SAT calculation form, payment recording form, history DataTable

---

## Phase 11 — Payroll + Employees

### `/employees` (directory)
- Toggle: Card grid view / List view
- Card: initials avatar (bg-primary-container, white text) / Name / Designation / Department / Status badge
- Search + department filter

### `/employees/new`
- 4-tab form: Personal / Employment / Bank / Tax
- Step tabs (not wizard — all sections accessible)

### `/employees/[id]` (profile)
- Header: Avatar (large) / Name / Designation / Join Date / Status badge / Edit CTA
- Tabs: Overview / Salary Structure / Payslips / Documents

### `/employees/[id]/salary`
- CTC breakdown table: Component / Monthly / Annual / Type (Fixed/Variable/Statutory)
- PF/ESI statutory section
- Effective from date

### `/payroll` (list)
- DataTable: Month / Employees / Gross / Deductions / Net / Status badge / Process date
- "Process Payroll" primary CTA

### `/payroll/process` (wizard)
- 4-step wizard with step indicator bar:
  1. Select Month
  2. Preview Team Salary
  3. Review Deductions (PF/ESI/PT)
  4. Confirm & Process
- Step indicator: connected dots with current step amber

### `/payroll/team-salary-preview`
- Table: Employee / Basic / HRA / Allowances / PF / ESI / PT / Net Pay
- Editable override column (for ad-hoc adjustments)

### `/payroll/success`
- Centered success state: checkmark icon, "Payroll Processed", summary stats, links to payslips + payroll reports

### `/my-payslips`
- Month/Year selector (dropdown)
- Payslip card: Earnings table + Deductions table + Net Pay (large mono)
- Download PDF button

### Payroll reports hub + ESI/PF/Form-16
- Hub: 3-4 report card links
- Each report: header (period, entity) + DataTable + Download

---

## Phase 12 — Inventory

### `/inventory` (dashboard)
- 4 KPI tiles: Total SKUs / Stock Value / Low Stock Items / Expiring Soon
- Implement placeholder chart: CSS/SVG horizontal bar chart (category breakdown) — no new library
- Quick links: Products / Stock Levels / Reports

### `/inventory/products` (list)
- DataTable: HSN Code (mono) / Product Name / Unit / Category / Sale Price (mono) / Stock Qty

### `/inventory/products/new`
- Form: Product Name / HSN / Category / Unit / GST Rate (select) / Sale Price / Reorder Qty

### `/inventory/stock`
- DataTable: Product / Category / Stock Qty / Reorder Qty / Status badge (OK / Low / Critical)
- Low stock: `bg-danger-bg/30` row tint
- Adjust Stock CTA → `DialogAdjustStock`

### `/inventory/reports` (hub)
- Cards: Inventory Valuation / Stock Movement / Turnover Analysis / Expiry Log

### `/inventory/reports/expiry`
- DataTable: Product / Batch / Expiry Date / Qty / Days Remaining
- Urgency badges: <30 days = danger, 30-60 = amber, 60-90 = success

---

## Phase 13 — Settings + Auth

### `/settings/fiscal-years`
- Timeline-style list: each FY = card with status badge / dates / days remaining progress bar
- "Open FY" / "Close FY" CTAs → `DialogCloseFiscalYear`
- Max 2 open FYs warning (if approaching limit)

### `/settings/invoices`
- Invoice template preview (react-pdf iframe or thumbnail)
- Form: Company logo upload / Invoice number prefix / Payment terms template / Footer notes
- Save Changes CTA

### `/login`
- Centered layout, `bg-[#FAFAF8]` page bg
- Card (white, hairline border, shadow-md): ComplianceOS logotype (Playfair) / Email + Password FormFields / Sign In primary CTA / "Forgot password?" link
- Below card: "Don't have an account? Sign up"

### `/signup`
- Same layout as login; fields: Business name / Email / Password / Confirm Password / Sign Up CTA

### `/onboarding`
- 5-step wizard (step indicator bar at top):
  1. Business Profile (name, PAN, GSTIN, address)
  2. CoA Template (select template card: Manufacturing / Trading / Services / Professional)
  3. Review Accounts (collapsible tree preview)
  4. FY + GST Config (FY start, GSTIN, filing frequency)
  5. Module Activation (toggle cards: GST / ITR / Payroll / Inventory)
  6. Opening Balances (account-by-account balance entry form)

---

## Phase 14 — Marketing Site

Matching `stitch_compliance_os/` reference screens. Warm editorial style throughout.

**Color palette (marketing):**
- Page bg: `#FAFAF8`
- Section dark: `#111111` (used for hero and CTA sections)
- Section muted: `#F4F2EE`
- Section amber: `rgba(200,134,10,0.06)` (subtle feature sections)
- Amber CTA: `#C8860A` bg / white text
- Typography: Playfair Display headlines, Syne body, DM Mono stats

**Screens:**
- `/` (homepage): Hero with tagline + CTA / Feature grid / Stats row / Testimonials / Pricing preview / Footer
- `/about`: Mission statement / Team / Values
- `/pricing`: 3-tier pricing table (Starter / Professional / Enterprise) with feature checklist
- `/features`: Overview grid with icons
- `/features/accounting` + `/gst` + `/invoicing` + `/itr` + `/payroll`: Feature deep-dives with product screenshots
- `/blog` (index + post): Editorial layout, article cards
- `/contact` + `/contact/success`: Contact form, success state
- `/privacy` + `/terms` + `/cookies` + `/security`: Legal text layout

**Mobile:** Burger menu overlay (hamburger icon → full-screen nav drawer, matching `mobile_nav_overlay_marketing` Stitch reference)

---

## Phase 15 — Dialogs + Empty States + Polish

### Dialog standardization (15 dialogs in `components/dialogs/`)
All dialogs get consistent structure:
```
<Dialog>
  <DialogHeader>
    <Icon (contextual color) />
    <DialogTitle />
    <DialogDescription />
  </DialogHeader>
  <DialogBody>
    {/* content */}
  </DialogBody>
  <DialogFooter>
    <Button variant="ghost">Cancel</Button>
    <Button variant={risk === 'danger' ? 'danger' : 'primary'}>Confirm</Button>
  </DialogFooter>
</Dialog>
```
Risk tiers:
- `low`: neutral confirm button
- `medium`: amber confirm button
- `high`: red confirm button, bold warning text
- `critical`: red confirm + require typing entity name to confirm

### Empty states
Each list/table page needs `EmptyState` component when data is empty:
- Journal: "No journal entries" / "Create your first entry to start tracking your books"
- Accounts: "No accounts found" / "Set up your chart of accounts"
- Invoices: "No invoices yet" / "Create and send your first invoice"
- Payments: "No payments recorded"
- GST Returns: "No returns for this period"
- Employees: "No employees added"
- Inventory: "No products in catalogue"

### Micro-interactions (CSS only, zero JS overhead)
- Table row hover: `hover:bg-section-muted transition-colors duration-100`
- Button press: `active:scale-[0.98] transition-transform duration-75`
- Sidebar active: `border-l-[3px] border-primary-container`
- Form field focus ring: `focus-visible:ring-2 focus-visible:ring-primary-container/30 focus-visible:ring-offset-0`
- Dialog open: Radix `data-[state=open]:animate-in data-[state=closed]:animate-out fade-in-0 zoom-in-95`
- Skeleton → content: `transition-opacity duration-200`
- Nav link hover: `hover:translate-x-0.5 transition-transform duration-150`

### Print stylesheet (for reports + invoices)
```css
@media print {
  aside, header, nav, .no-print { display: none !important; }
  main { margin: 0 !important; padding: 0 !important; }
  body { background: white !important; }
}
```

---

## Constraints (respected throughout all phases)

- **Zero backend changes** — no API, tRPC, schema, or data model modifications
- **No new dependencies** — all work uses existing stack: lucide-react, radix dialog, sonner, react-hook-form, next-intl, tailwind v4, @fontsource
- **Mock data preserved** — all pages that currently use `const mockX = [...]` keep their mock data
- **All routes remain functional** — no regressions in routing, logic, or data flow
- **Session data** — topbar connects to `useSession()` but falls back gracefully if null (avoids breaking the unauthenticated state during dev)

---

## File Change Summary by Phase

| Phase | Key Files | New Files |
|-------|-----------|-----------|
| 1 Shell | layout.tsx, sidebar.tsx, topbar.tsx, app/layout.tsx | — |
| 2 Tokens | tailwind.config.ts, card.tsx, button.tsx, kpi-tile.tsx | — |
| 3 Dashboard | dashboard/page.tsx | — |
| 4 Journal | journal/page.tsx, journal/new/page.tsx, journal/[id]/page.tsx | — |
| 5 Accounts | coa/page.tsx, accounts/page.tsx, accounts/new/page.tsx, accounts/[id]/page.tsx | — |
| 6 Reports | reports/trial-balance, profit-loss, balance-sheet, cash-flow pages | — |
| 7 Invoicing | invoices/page.tsx, new, [id], [id]/edit, scan | — |
| 8 Payments | payments/page.tsx, new; receivables/page.tsx, [customerId] | — |
| 9 GST | gst/returns/page.tsx + sub-routes, reconciliation, ledger, payment | — |
| 10 ITR | itr/returns, computation, payment sub-routes | — |
| 11 Payroll | payroll/*, employees/*, my-payslips, payroll-reports/* | — |
| 12 Inventory | inventory/*, inventory/products/*, inventory/stock, reports/* | — |
| 13 Settings+Auth | settings/fiscal-years, settings/invoices, login, signup, onboarding | — |
| 14 Marketing | app/(marketing)/* | — |
| 15 Polish | components/dialogs/*, empty states, print.css | — |
