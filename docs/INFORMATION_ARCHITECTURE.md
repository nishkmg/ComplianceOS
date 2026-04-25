# ComplianceOS — Information Architecture

**Version:** 1.0  
**Date:** 2026-04-24  
**Scope:** Complete structural documentation of the ComplianceOS application

---

## 1. System Overview

**Purpose:** Double-entry accounting engine with event sourcing for multi-tenant compliance management (India)

**Target Users:**
- Indian SMEs (proprietorships, partnerships)
- Freelancers
- Accountants/Bookkeepers

**Tech Stack:**
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS, Shadcn/UI
- **Backend:** tRPC v11, Node.js command handlers, event sourcing
- **Database:** PostgreSQL 16 (Drizzle ORM), Redis 7 (caching/queues)
- **Auth:** NextAuth.js v5
- **Infra:** Railway (deployment), PM2 (process management)

---

## 2. Application Routes (Next.js App Router)

### 2.1 Public Routes `(auth)`

| Route | Component | Purpose |
|-------|-----------|---------|
| `/login` | `apps/web/app/(auth)/login/page.tsx` | User authentication |
| `/signup` | `apps/web/app/(auth)/signup/page.tsx` | Tenant registration |

### 2.2 Authenticated Routes `(app)`

#### Dashboard
| Route | Component | Purpose |
|-------|-----------|---------|
| `/dashboard` | `apps/web/app/(app)/dashboard/page.tsx` | Main dashboard with KPIs |

#### Accounting Core
| Route | Component | Purpose |
|-------|-----------|---------|
| `/journal` | `apps/web/app/(app)/journal/page.tsx` | Journal entry list |
| `/journal/new` | `apps/web/app/(app)/journal/new/page.tsx` | Create journal entry |
| `/journal/[id]` | `apps/web/app/(app)/journal/[id]/page.tsx` | View journal entry detail |
| `/accounts` | `apps/web/app/(app)/accounts/page.tsx` | Chart of accounts list |
| `/accounts/new` | `apps/web/app/(app)/accounts/new/page.tsx` | Create new account |
| `/accounts/[id]` | `apps/web/app/(app)/accounts/[id]/page.tsx` | Account detail + ledger |
| `/coa` | `apps/web/app/(app)/coa/page.tsx` | Chart of accounts (full tree) |

#### Invoicing & Receivables
| Route | Component | Purpose |
|-------|-----------|---------|
| `/invoices` | `apps/web/app/(app)/invoices/page.tsx` | Invoice list |
| `/invoices/new` | `apps/web/app/(app)/invoices/new/page.tsx` | Create invoice |
| `/invoices/[id]` | `apps/web/app/(app)/invoices/[id]/page.tsx` | Invoice detail |
| `/invoices/[id]/edit` | `apps/web/app/(app)/invoices/[id]/edit/page.tsx` | Edit invoice |
| `/invoices/[id]/pdf` | `apps/web/app/(app)/invoices/[id]/pdf/page.tsx` | PDF preview |
| `/invoices/scan` | `apps/web/app/(app)/invoices/scan/page.tsx` | OCR invoice upload |
| `/receivables` | `apps/web/app/(app)/receivables/page.tsx` | Receivables summary |
| `/receivables/[customerId]` | `apps/web/app/(app)/receivables/[customerId]/page.tsx` | Customer detail |

#### Payments
| Route | Component | Purpose |
|-------|-----------|---------|
| `/payments` | `apps/web/app/(app)/payments/page.tsx` | Payment list |
| `/payments/new` | `apps/web/app/(app)/payments/new/page.tsx` | Record payment |
| `/receipts/scan` | `apps/web/app/(app)/receipts/scan/page.tsx` | OCR receipt upload |

#### Financial Reports
| Route | Component | Purpose |
|-------|-----------|---------|
| `/reports/trial-balance` | `apps/web/app/(app)/reports/trial-balance/page.tsx` | Trial balance |
| `/reports/pl` | `apps/web/app/(app)/reports/pl/page.tsx` | P&L (Schedule III) |
| `/reports/profit-loss` | `apps/web/app/(app)/reports/profit-loss/page.tsx` | P&L (proprietorship) |
| `/reports/balance-sheet` | `apps/web/app/(app)/reports/balance-sheet/page.tsx` | Balance sheet |
| `/reports/ledger` | `apps/web/app/(app)/reports/ledger/page.tsx` | General ledger |
| `/reports/cash-flow` | `apps/web/app/(app)/reports/cash-flow/page.tsx` | Cash flow (indirect) |

#### GST (Goods & Services Tax)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/gst/returns` | `apps/web/app/(app)/gst/returns/page.tsx` | GST returns list |
| `/gst/returns/[period]` | `apps/web/app/(app)/gst/returns/[period]/page.tsx` | Period selection |
| `/gst/returns/[period]/gstr1` | `apps/web/app/(app)/gst/returns/[period]/gstr1/page.tsx` | GSTR-1 (outward supplies) |
| `/gst/returns/[period]/gstr2b` | `apps/web/app/(app)/gst/returns/[period]/gstr2b/page.tsx` | GSTR-2B (ITC statement) |
| `/gst/returns/[period]/gstr3b` | `apps/web/app/(app)/gst/returns/[period]/gstr3b/page.tsx` | GSTR-3B (summary return) |
| `/gst/reconciliation` | `apps/web/app/(app)/gst/reconciliation/page.tsx` | 2A/2B vs books reconciliation |
| `/gst/reconciliation/mismatches` | `apps/web/app/(app)/gst/reconciliation/mismatches/page.tsx` | Mismatch detail view |
| `/gst/ledger` | `apps/web/app/(app)/gst/ledger/page.tsx` | GST ledger (combined) |
| `/gst/ledger/cash` | `apps/web/app/(app)/gst/ledger/cash/page.tsx` | Cash ledger (GST) |
| `/gst/ledger/itc` | `apps/web/app/(app)/gst/ledger/itc/page.tsx` | ITC ledger |
| `/gst/payment` | `apps/web/app/(app)/gst/payment/page.tsx` | GST tax payment |
| `/gst/payment/history` | `apps/web/app/(app)/gst/payment/history/page.tsx` | Payment history |

#### ITR (Income Tax Returns)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/itr/returns` | `apps/web/app/(app)/itr/returns/page.tsx` | ITR returns list |
| `/itr/returns/[financialYear]` | `apps/web/app/(app)/itr/returns/[financialYear]/page.tsx` | FY selection |
| `/itr/returns/[financialYear]/[returnId]` | `apps/web/app/(app)/itr/returns/[financialYear]/[returnId]/page.tsx` | Return detail |
| `/itr/returns/[financialYear]/[returnId]/gstr3b` | `apps/web/app/(app)/itr/returns/[financialYear]/[returnId]/gstr3b/page.tsx` | GSTR-3B linked data |
| `/itr/computation` | `apps/web/app/(app)/itr/computation/page.tsx` | Tax computation |
| `/itr/computation/regime-comparison` | `apps/web/app/(app)/itr/computation/regime-comparison/page.tsx` | Old vs new regime |
| `/itr/computation/presumptive-scheme` | `apps/web/app/(app)/itr/computation/presumptive-scheme/page.tsx` | 44AD/44ADA calculation |
| `/itr/payment` | `apps/web/app/(app)/itr/payment/page.tsx` | Tax payment |
| `/itr/payment/advance-tax` | `apps/web/app/(app)/itr/payment/advance-tax/page.tsx` | Advance tax |
| `/itr/payment/self-assessment` | `apps/web/app/(app)/itr/payment/self-assessment/page.tsx` | Self-assessment tax |
| `/itr/payment/history` | `apps/web/app/(app)/itr/payment/history/page.tsx` | Payment history |

#### Payroll & Employees
| Route | Component | Purpose |
|-------|-----------|---------|
| `/employees` | `apps/web/app/(app)/employees/page.tsx` | Employee list |
| `/employees/new` | `apps/web/app/(app)/employees/new/page.tsx` | Add employee |
| `/employees/[id]` | `apps/web/app/(app)/employees/[id]/page.tsx` | Employee detail |
| `/employees/[id]/salary` | `apps/web/app/(app)/employees/[id]/salary/page.tsx` | Salary structure |
| `/payroll` | `apps/web/app/(app)/payroll/page.tsx` | Payroll list |
| `/payroll/[id]` | `apps/web/app/(app)/payroll/[id]/page.tsx` | Payroll detail |
| `/payroll/process` | `apps/web/app/(app)/payroll/process/page.tsx` | Process payroll |
| `/payroll-reports` | `apps/web/app/(app)/payroll-reports/page.tsx` | Payroll reports |
| `/my-payslips` | `apps/web/app/(app)/my-payslips/page.tsx` | Employee payslip view |

#### Inventory
| Route | Component | Purpose |
|-------|-----------|---------|
| `/inventory` | `apps/web/app/(app)/inventory/page.tsx` | Inventory dashboard |
| `/inventory/products` | `apps/web/app/(app)/inventory/products/page.tsx` | Product list |
| `/inventory/products/new` | `apps/web/app/(app)/inventory/products/new/page.tsx` | Add product |
| `/inventory/stock` | `apps/web/app/(app)/inventory/stock/page.tsx` | Stock levels |

#### Settings
| Route | Component | Purpose |
|-------|-----------|---------|
| `/settings/fiscal-years` | `apps/web/app/(app)/settings/fiscal-years/page.tsx` | FY management |
| `/settings/fiscal-years/[id]` | `apps/web/app/(app)/settings/fiscal-years/[id]/page.tsx` | FY detail |
| `/settings/invoices` | `apps/web/app/(app)/settings/invoices/page.tsx` | Invoice configuration |

#### Onboarding
| Route | Component | Purpose |
|-------|-----------|---------|
| `/onboarding` | `apps/web/app/(app)/onboarding/page.tsx` | Multi-step onboarding wizard |

---

## 3. API Routes

### 3.1 tRPC Routers (`packages/server/src/routers/`)

| Router | File | Procedures |
|--------|------|------------|
| `accounts` | `accounts.ts` | `list`, `get`, `create`, `modify`, `deactivate` |
| `journalEntries` | `journal-entries.ts` | `list`, `get`, `create`, `post`, `void`, `modify`, `delete` |
| `balances` | `balances.ts` | `getTrialBalance`, `getAccountBalance` |
| `fiscalYears` | `fiscal-years.ts` | `list`, `create`, `close`, `get` |
| `onboarding` | `onboarding.ts` | `completeStep`, `getStatus` |
| `invoices` | `invoices.ts` | `list`, `get`, `create`, `update`, `delete`, `send` |
| `invoiceConfig` | `invoice-config.ts` | `get`, `update` |
| `payments` | `payments.ts` | `list`, `record`, `allocate` |
| `receivables` | `receivables.ts` | `summary`, `byCustomer` |
| `ocrScan` | `ocr-scan.ts` | `upload`, `extract` |
| `products` | `products.ts` | `list`, `create`, `update` |
| `inventory` | `inventory.ts` | `levels`, `adjust` |
| `stockReports` | `stock-reports.ts` | `summary`, `valuation` |
| `employees` | `employees.ts` | `list`, `get`, `create`, `update` |
| `salaryStructure` | `salary-structure.ts` | `get`, `set` |
| `payroll` | `payroll.ts` | `list`, `process`, `getPayslip` |
| `advances` | `advances.ts` | `request`, `approve`, `deduct` |
| `payslips` | `payslips.ts` | `list`, `get` |
| `payrollReports` | `payroll-reports.ts` | `summary`, `compliance` |
| `gstLedger` | `gst-ledger.ts` | `cash`, `itc`, `liability` |
| `gstReturns` | `gst-returns.ts` | `list`, `generate`, `file`, `amend` |
| `gstReconciliation` | `gst-reconciliation.ts` | `compare`, `mismatches` |
| `gstPayment` | `gst-payment.ts` | `calculate`, `record`, `history` |
| `itrReturns` | `itr-returns.ts` | `list`, `compute`, `file` |
| `itrComputation` | `itr-computation.ts` | `regimeComparison`, `presumptive` |
| `itrPayment` | `itr-payment.ts` | `calculate`, `record`, `history` |

### 3.2 Next.js API Routes

| Route | File | Purpose |
|-------|------|---------|
| `/api/auth/[...nextauth]` | `apps/web/app/api/auth/[...nextauth]/route.ts` | NextAuth.js handlers |
| `/api/health` | `apps/web/app/api/health/route.ts` | Health check (DB/Redis/Projector) |

---

## 4. Database Schema (`packages/db/src/schema/`)

### 4.1 Core Entities

| Table | File | Purpose |
|-------|------|---------|
| `tenants` | `tenants.ts` | Multi-tenant isolation |
| `users` | `users.ts` | User accounts |
| `accounts` | `accounts.ts` | Chart of accounts |
| `journal_entries` | `journal.ts` | Journal entry headers |
| `journal_lines` | `journal.ts` | Journal entry lines (debits/credits) |
| `events` | `events.ts` | Event store (append-only) |
| `projector_state` | `projector-state.ts` | Projector worker state |
| `projections` | `projections.ts` | Materialized views |
| `fiscal_years` | `fiscal-years.ts` | Fiscal year configuration |

### 4.2 Invoicing & Payments

| Table | File | Purpose |
|-------|------|---------|
| `invoices` | `invoices.ts` | Invoice headers |
| `invoice_lines` | `invoices.ts` | Invoice line items |
| `payments` | `payments.ts` | Payment records |
| `payment_allocations` | `payments.ts` | Payment → invoice allocation |
| `invoice_config` | `invoice-config.ts` | Invoice numbering, branding |
| `receivables_summary` | `receivables-summary.ts` | Customer receivables aggregate |

### 4.3 Inventory

| Table | File | Purpose |
|-------|------|---------|
| `products` | `products.ts` | Product catalog |
| `inventory` | `inventory.ts` | Stock levels |
| `inventory_config` | `inventory-config.ts` | Inventory valuation method |

### 4.4 Payroll

| Table | File | Purpose |
|-------|------|---------|
| `employees` | `employees.ts` | Employee master |
| `salary_structure` | `salary-structure.ts` | Salary components |
| `payroll` | `payroll.ts` | Payroll runs |
| `payslips` | `payroll.ts` | Generated payslips |
| `payroll_config` | `payroll-config.ts` | PF, ESI, PT settings |

### 4.5 GST

| Table | File | Purpose |
|-------|------|---------|
| `gst_returns` | `gst-returns.ts` | GSTR-1/2B/3B records |
| `gst_ledgers` | `gst-ledgers.ts` | Cash/ITC/liability ledgers |
| `gst_config` | `gst-config.ts` | GSTIN, HSN/SAC settings |

### 4.6 ITR

| Table | File | Purpose |
|-------|------|---------|
| `itr_returns` | `itr-returns.ts` | ITR filings |
| `itr_ledgers` | `itr-ledgers.ts` | Tax payment ledgers |
| `itr_config` | `itr-config.ts` | ITR form settings |
| `itr_snapshots` | `itr-snapshots.ts` | Computation snapshots |
| `itr_mappings` | `itr-mappings.ts` | GL → ITR mapping |
| `itr_projections` | `itr-projections.ts` | Tax liability projections |

### 4.7 Infrastructure

| Table | File | Purpose |
|-------|------|---------|
| `enums` | `enums.ts` | PostgreSQL enum types |
| `ocr_scan` | `ocr-scan.ts` | OCR extraction results |
| `email_queue` | `email-queue.ts` | Email delivery queue |

---

## 5. Command Handlers (`packages/server/src/commands/`)

### 5.1 Journal Entry Commands

| Command | File | Purpose |
|---------|------|---------|
| `create-journal-entry` | `create-journal-entry.ts` | Create draft JE |
| `post-journal-entry` | `post-journal-entry.ts` | Post draft → posted |
| `void-journal-entry` | `void-journal-entry.ts` | Void posted JE |
| `modify-journal-entry` | `modify-journal-entry.ts` | Modify draft JE |
| `delete-journal-entry` | `delete-journal-entry.ts` | Delete draft JE |
| `correct-narration` | `correct-narration.ts` | Fix JE narration |

### 5.2 Account Commands

| Command | File | Purpose |
|---------|------|---------|
| `create-account` | `create-account.ts` | Create new COA account |
| `modify-account` | `modify-account.ts` | Modify account details |
| `deactivate-account` | `deactivate-account.ts` | Deactivate account |
| `seed-coa` | `seed-coa.ts` | Seed chart of accounts |
| `setup-opening-balances` | `setup-opening-balances.ts` | Import opening balances |

### 5.3 Invoice Commands

| Command | File | Purpose |
|---------|------|---------|
| `create-invoice` | `create-invoice.ts` | Create sales invoice |
| `create-credit-note` | `create-credit-note.ts` | Create credit note |

### 5.4 Payment Commands

| Command | File | Purpose |
|---------|------|---------|
| `record-payment` | `record-payment.ts` | Record payment received/made |

### 5.5 Fiscal Year Commands

| Command | File | Purpose |
|---------|------|---------|
| `create-fiscal-year` | `create-fiscal-year.ts` | Create new FY |
| `close-fiscal-year` | `close-fiscal-year.ts` | Close FY (lock JE) |

### 5.6 GST Commands

| Command | File | Purpose |
|---------|------|---------|
| `generate-gstr1` | `generate-gstr1.ts` | Generate GSTR-1 from JEs |
| `reconcile-itc` | `reconcile-itc.ts` | Match ITC (2B vs books) |

### 5.7 ITR Commands

| Command | File | Purpose |
|---------|------|---------|
| `compute-income` | `compute-income.ts` | Compute taxable income |
| `compute-tax` | `compute-tax.ts` | Compute tax liability |

### 5.8 Tenant Commands

| Command | File | Purpose |
|---------|------|---------|
| `create-tenant` | `create-tenant.ts` | Onboard new tenant |

---

## 6. Frontend Components

### 6.1 UI Components (`apps/web/components/ui/`)

| Component | File | Purpose |
|-----------|------|---------|
| `BalanceBar` | `balance-bar.tsx` | Real-time JE balance indicator |
| `Badge` | `badge.tsx` | Status badge |
| `Button` | `button.tsx` | Button variants |
| `Dialog` | `dialog.tsx` | Modal dialog (Radix UI) |
| `Input` | `input.tsx` | Text input field |
| `Label` | `label.tsx` | Form label |
| `KpiTile` | `kpi-tile.tsx` | Dashboard KPI card |

### 6.2 Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| `AppShell` | `app/(app)/layout.tsx` | Main app layout (sidebar + content) |
| `ServerAuthCheck` | `app/(app)/server-auth-check.tsx` | Server-side auth guard |
| `CommandPalette` | `components/command-palette.tsx` | Keyboard shortcut palette (⌘K) |

### 6.3 Feature Components (by module)

| Module | Location | Key Components |
|--------|----------|----------------|
| Journal | `app/(app)/journal/` | Entry form, line item grid, balance bar |
| Onboarding | `app/(app)/onboarding/` | Multi-step wizard, step components |
| GST Returns | `app/(app)/gst/returns/` | Period selector, GSTR forms, ARN dialog |
| Reports | `app/(app)/reports/` | Statement tables, period filters |

---

## 7. Custom Hooks (`apps/web/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useKeyboardShortcuts` | `use-keyboard-shortcuts.ts` | ⌘K command palette, global shortcuts |
| `useArrowNavigation` | `use-arrow-navigation.ts` | Excel-style arrow key navigation (JE grid) |

---

## 8. Utility Libraries (`apps/web/lib/`)

| Module | File | Purpose |
|--------|------|---------|
| `auth` | `auth.ts` | NextAuth.js configuration |
| `format` | `format.ts` | Number/date formatting, balance calculation |
| `format-inr` | `format-inr.ts` | Indian Rupee formatting (₹, lakhs/crores) |
| `utils` | `utils.ts` | `cn()` class merger, helpers |
| `api` | `api.ts` | tRPC client setup |
| `logger` | `logger.ts` | Structured logging |
| `session` | `session.ts` | Session utilities |
| `toast` | `toast.ts` | Sonner toast notifications |

---

## 9. Server Libraries (`packages/server/src/lib/`)

| Module | File | Purpose |
|--------|------|---------|
| `event-store` | `event-store.ts` | Append-only event store |
| `balance-validator` | `balance-validator.ts` | Double-entry validation |
| `entry-number` | `entry-number.ts` | Gapless JE numbering per FY |
| `aggregate-loader` | `aggregate-loader.ts` | Event stream → aggregate state |
| `schemas` | `schemas.ts` | Zod validation schemas |

---

## 10. Navigation Structure

### 10.1 Primary Navigation (Sidebar)

```
Dashboard
Employees
Payroll
  ├─ Process
  └─ Reports
My Payslips
Invoices
  └─ Scan Invoice
Receivables
Payments
  └─ Scan Receipt
Journal
Accounts
Inventory
  ├─ Products
  ├─ Stock
  └─ Reports
GST
  ├─ Returns
  ├─ Reconciliation
  ├─ Ledger
  └─ Payment
ITR
  ├─ Returns
  ├─ Computation
  └─ Payment
Reports
Settings
```

### 10.2 Fiscal Year Selector (Footer)

- Shows current active FY (e.g., "FY 2026-27")
- Status badge (Open/Closed)
- Days remaining countdown
- Popover to switch between open FYs (max 2)

---

## 11. User Flows

### 11.1 Onboarding Flow

```
/signup → /onboarding
  ├─ Step 1: Business Profile (name, legal name, type, industry, PAN, GSTIN, state, address)
  ├─ Step 2: Module Activation (GST, ITR, Payroll, Inventory)
  ├─ Step 3: COA Template Selection
  ├─ Step 4: Fiscal Year + GST Type
  └─ Step 5: Opening Balances (CSV import/manual)
→ /dashboard
```

### 11.2 Journal Entry Flow

```
/journal/new
  ├─ Add line items (account, debit, credit)
  ├─ Real-time balance calculation (BalanceBar)
  ├─ Save as Draft OR Post
  └─ On Post → validate debits = credits → assign entry number → append events
→ /journal
```

### 11.3 GST Return Filing Flow

```
/gst/returns → Select Period → /gst/returns/[period]
  ├─ Generate GSTR-1 (from invoices/JEs)
  ├─ Fetch GSTR-2B (API)
  ├─ Reconcile ITC (2B vs books)
  ├─ Fill GSTR-3B (auto-populated)
  ├─ Enter ARN (Dialog component with validation)
  └─ File return
→ /gst/returns
```

### 11.4 Invoice Creation Flow

```
/invoices/new
  ├─ Select customer
  ├─ Add line items (product, qty, rate, GST%)
  ├─ Auto-calculate tax
  ├─ Preview PDF
  └─ Send (email) / Save
→ /invoices
```

---

## 12. Event Sourcing Architecture

### 12.1 Event Types

| Aggregate | Events |
|-----------|--------|
| `JournalEntry` | `JournalEntryCreated`, `JournalEntryPosted`, `JournalEntryVoided`, `JournalEntryModified`, `JournalEntryDeleted` |
| `Account` | `AccountCreated`, `AccountModified`, `AccountDeactivated` |
| `Invoice` | `InvoiceCreated`, `InvoiceUpdated`, `InvoiceDeleted`, `InvoiceSent` |
| `FiscalYear` | `FiscalYearCreated`, `FiscalYearClosed` |
| `Tenant` | `TenantCreated`, `TenantOnboardingCompleted` |

### 12.2 Event Structure

```typescript
{
  id: string;          // UUID
  aggregateId: string; // e.g., journal entry ID
  aggregateType: string; // e.g., "JournalEntry"
  eventType: string;   // e.g., "JournalEntryCreated"
  sequence: number;    // Per-aggregate sequence
  data: Record<string, any>; // Event payload
  metadata: {          // System metadata
    tenantId: string;
    userId: string;
    timestamp: string;
    version: string;
  };
  createdAt: Date;
}
```

### 12.3 Projector Worker

- **Pattern:** Polling with `FOR UPDATE SKIP LOCKED`
- **Frequency:** Continuous (PM2 supervised)
- **Idempotency:** Upsert by event ID
- **State Tracking:** `projector_state` table (last processed sequence per aggregate)

---

## 13. Security Architecture

### 13.1 Multi-Tenancy

- **Enforcement:** PostgreSQL Row-Level Security (RLS)
- **Policy:** `tenant_id = current_setting('app.current_tenant')::uuid`
- **Session:** Tenant ID set on DB connection per request

### 13.2 Authentication

- **Provider:** NextAuth.js v5
- **Strategy:** Database (email/password)
- **Session:** JWT (signed, encrypted)

### 13.3 Authorization

- **Middleware:** `apps/web/middleware.ts` (route protection)
- **Server:** tRPC middleware (tenant extraction, user injection)
- **RLS:** All tables have `tenant_id` column + policies

---

## 14. Design System Tokens

### 14.1 Colors (`apps/web/tailwind.config.ts`)

| Token | Value | Usage |
|-------|-------|-------|
| `amber.DEFAULT` | `#B47500` | Primary actions, active states |
| `light` | `#767676` | Secondary text (WCAG AA compliant) |
| `dark` | `#1A1A1A` | Primary text |
| `mid` | `#4A4A4A` | Body text |
| `lighter` | `#F5F5F5` | Hover backgrounds |
| `lightest` | `#FAFAFA` | Page backgrounds |
| `sidebar` | `#1A1A1A` | Sidebar background |
| `success` | `#059669` | Success states |
| `success-bg` | `#D1FAE5` | Success backgrounds |
| `danger` | `#DC2626` | Error states |

### 14.2 Typography

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `ui-xs` | 11px | 15px | Captions, footnotes |
| `ui-sm` | 13px | 17px | Secondary labels |
| `ui-md` | 14px | 20px | Body text, inputs |
| `display` | 38px | — | Logo, headings |

### 14.3 Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight spacing |
| `gap-2` | 8px | Standard spacing |
| `gap-3` | 12px | Relaxed spacing |
| `gap-4` | 16px | Section spacing |

---

## 15. Accessibility (WCAG 2.1 AA)

### 15.1 Implemented Features

- **Color Contrast:** All text ≥ 4.5:1 contrast ratio
- **Label-Input Linking:** Explicit `htmlFor`/`id` on all form fields
- **ARIA Navigation:** `aria-current="step"` on onboarding progress
- **Keyboard Navigation:** Arrow key support in JE grid (Excel-style)
- **Focus Management:** Visible focus rings on all interactive elements

### 15.2 Toast Notifications

- **Library:** Sonner
- **Position:** Top-right
- **Types:** Success, Error, Loading, Info
- **Usage:** All tRPC mutation handlers

---

## 16. Deployment Architecture

### 16.1 Infrastructure (Railway)

```
┌─────────────────┐
│   Next.js App   │ (PM2 cluster mode)
│   (apps/web)    │
└────────┬────────┘
         │
         ├─► PostgreSQL 16 (Drizzle ORM)
         │    ├─ Event store
         │    ├─ Projections
         │    └─ RLS policies
         │
         └─► Redis 7
              ├─ Session cache
              ├─ Email queue
              └─ Rate limiting
```

### 16.2 Projector Worker

- **Runtime:** Node.js (separate PM2 process)
- **Polling:** `SELECT ... FOR UPDATE SKIP LOCKED`
- **Supervision:** PM2 auto-restart on crash
- **Logging:** Structured JSON (health endpoint)

### 16.3 Health Endpoint

`/api/health` returns:
- Database connection status
- Redis connection status
- Projector worker lag (seconds behind)
- Uptime

---

## 17. Documentation Structure (`docs/`)

```
docs/
├── superpowers/
│   ├── specs/          # Feature specifications
│   ├── plans/          # Implementation plans
│   └── specs/          # UX/UI audit reports
├── RUNBOOKS/
│   ├── incident-response.md
│   ├── backup-restore.md
│   └── deployment.md
└── BACKUP_RESTORE.md
```

---

## 18. Key Metrics & Constraints

### 18.1 Fiscal Year Rules

- Max 2 concurrent open FYs
- 90-day grace period + 30-day hard deadline for auto-close
- `pending_close` state blocks new draft JEs

### 18.2 Journal Entry Rules

- Gapless entry numbers per FY
- Draft → Posted → Voided lifecycle
- Snapshots every 10 events per aggregate
- Mandatory snapshot on FY close

### 18.3 Chart of Accounts

- Hierarchical (4-level max depth)
- Leaf-only JE lines (no parent accounts)
- Account types: Asset, Liability, Equity, Income, Expense

---

## 19. Current State (as of 2026-04-24)

### 19.1 Completed Features

- ✅ Core accounting engine (event sourcing, double-entry)
- ✅ Chart of accounts (hierarchical)
- ✅ Journal entries (draft/posted/voided)
- ✅ Financial statements (Trial Balance, P&L, Balance Sheet, Cash Flow)
- ✅ Invoice creation + OCR scanning
- ✅ Receivables tracking
- ✅ Payment recording + allocation
- ✅ GST returns (GSTR-1/2B/3B generation)
- ✅ ITR computation (regime comparison, presumptive scheme)
- ✅ Payroll processing + payslips
- ✅ Inventory (products, stock levels)
- ✅ Multi-tenancy (PostgreSQL RLS)
- ✅ Fiscal year management

### 19.2 UX/UI Remediation (2026-04-24)

- ✅ Design system tokens (WCAG AA contrast)
- ✅ ARIA label-input linkage
- ✅ Sonner toast notifications
- ✅ Real-time balance calculation (JE grid)
- ✅ Dialog components (replaced window.prompt)
- ✅ Excel-style arrow navigation (JE grid)

### 19.3 Pending Features

- ⏳ Bank reconciliation (auto-match)
- ⏳ E-way bill generation
- ⏳ TDS/TCS computation + filing
- ⏳ Advanced inventory valuation (FIFO, weighted average)
- ⏳ Multi-currency support

---

## 20. Glossary

| Term | Definition |
|------|------------|
| **JE** | Journal Entry |
| **COA** | Chart of Accounts |
| **FY** | Fiscal Year (Apr–Mar for India) |
| **ITC** | Input Tax Credit (GST) |
| **ARN** | Application Reference Number (GST filing) |
| **GSTR-1** | Outward supplies return |
| **GSTR-2B** | Auto-populated ITC statement |
| **GSTR-3B** | Summary monthly return |
| **RLS** | Row-Level Security (PostgreSQL) |
| **OCR** | Optical Character Recognition |
