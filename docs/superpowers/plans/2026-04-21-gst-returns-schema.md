# GST Returns Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create database schema for GST returns generation system with ledgers for cash, ITC, and liability tracking.

**Architecture:** Event-sourced GST compliance module following existing schema patterns. All tables include `tenant_id` for multi-tenant isolation. Uses PostgreSQL `numeric(18,2)` for amounts, `text` for period fields (consistent with payroll).

**Tech Stack:** Drizzle ORM, PostgreSQL 16, TypeScript

---

## Files to Create

1. `packages/db/src/schema/enums.ts` - Add GST-specific enums
2. `packages/db/src/schema/gst-returns.ts` - Main GST return tables
3. `packages/db/src/schema/gst-ledgers.ts` - Cash, ITC, liability ledgers
4. `packages/db/src/schema/gst-config.ts` - Tenant GST configuration
5. `packages/db/src/schema/gstr-mappings.ts` - GSTR table mappings
6. `packages/db/src/schema/index.ts` - Export new modules

---

### Task 1: Add GST Enums

**Files:**
- Modify: `packages/db/src/schema/enums.ts`

- [ ] **Step 1: Add GST enums to enums.ts**

Add after `documentTypeEnum` (line 137):

```typescript
export const gstReturnTypeEnum = pgEnum("gst_return_type", ["gstr1", "gstr2b", "gstr3b", "gstr9", "gstr4"]);

export const gstReturnStatusEnum = pgEnum("gst_return_status", ["draft", "generated", "filed", "amended"]);

export const gstTaxTypeEnum = pgEnum("gst_tax_type", ["igst", "cgst", "sgst", "cess"]);

export const gstTransactionTypeEnum = pgEnum("gst_transaction_type", [
  "payment",
  "interest",
  "penalty",
  "refund",
  "itc_utilization",
]);
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
pnpm turbo typecheck
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/schema/enums.ts
git commit -m "feat(db): add GST return, status, tax type, transaction type enums"
```

---

### Task 2: Create GST Returns Schema

**Files:**
- Create: `packages/db/src/schema/gst-returns.ts`

- [ ] **Step 1: Create gst-returns.ts with main return table**

```typescript
import {
  pgTable, uuid, text, numeric, timestamp,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { gstReturnTypeEnum, gstReturnStatusEnum } from "./enums";
import { tenants } from "./tenants";

export const gstReturns = pgTable("gst_returns", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  periodMonth: text("period_month").notNull(),
  periodYear: text("period_year").notNull(),
  returnType: gstReturnTypeEnum("return_type").notNull(),
  status: gstReturnStatusEnum("status").notNull().default("draft"),
  grossTurnover: numeric("gross_turnover", { precision: 18, scale: 2 }).default("0"),
  taxableValue: numeric("taxable_value", { precision: 18, scale: 2 }).default("0"),
  igstAmount: numeric("igst_amount", { precision: 18, scale: 2 }).default("0"),
  cgstAmount: numeric("cgst_amount", { precision: 18, scale: 2 }).default("0"),
  sgstAmount: numeric("sgst_amount", { precision: 18, scale: 2 }).default("0"),
  cessAmount: numeric("cess_amount", { precision: 18, scale: 2 }).default("0"),
  itcAvailable: numeric("itc_available", { precision: 18, scale: 2 }).default("0"),
  itcReversed: numeric("itc_reversed", { precision: 18, scale: 2 }).default("0"),
  taxPayable: numeric("tax_payable", { precision: 18, scale: 2 }).default("0"),
  interest: numeric("interest", { precision: 18, scale: 2 }).default("0"),
  lateFee: numeric("late_fee", { precision: 18, scale: 2 }).default("0"),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
  filedAt: timestamp("filed_at", { withTimezone: true }),
  arn: text("arn"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("gst_returns_tenant_period_month_period_year_return_type_unique").on(
    table.tenantId, table.periodMonth, table.periodYear, table.returnType
  ),
  index("gst_returns_tenant_id_period_idx").on(table.tenantId, table.periodMonth, table.periodYear),
  index("gst_returns_tenant_id_status_idx").on(table.tenantId, table.status),
]);

export const gstReturnLines = pgTable("gst_return_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  returnId: uuid("return_id").notNull().references(() => gstReturns.id),
  tableNumber: text("table_number").notNull(),
  invoiceId: uuid("invoice_id"),
  partyGstin: text("party_gstin").notNull(),
  invoiceValue: numeric("invoice_value", { precision: 18, scale: 2 }).notNull(),
  taxableValue: numeric("taxable_value", { precision: 18, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 18, scale: 2 }).notNull(),
  placeOfSupply: text("place_of_supply").notNull(),
  reverseCharge: text("reverse_charge").notNull().default("N"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("gst_return_lines_return_id_idx").on(table.returnId),
]);
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
pnpm turbo typecheck
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/schema/gst-returns.ts
git commit -m "feat(db): add GST returns and return lines tables"
```

---

### Task 3: Create GST Ledgers Schema

**Files:**
- Create: `packages/db/src/schema/gst-ledgers.ts`

- [ ] **Step 1: Create gst-ledgers.ts with cash, ITC, liability ledgers**

```typescript
import {
  pgTable, uuid, text, numeric, timestamp,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { gstTaxTypeEnum, gstTransactionTypeEnum } from "./enums";
import { tenants } from "./tenants";

export const gstCashLedger = pgTable("gst_cash_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  transactionType: gstTransactionTypeEnum("transaction_type").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 18, scale: 2 }).notNull(),
  challanId: text("challan_id"),
  narration: text("narration"),
  postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("gst_cash_ledger_tenant_id_idx").on(table.tenantId),
  index("gst_cash_ledger_posted_at_idx").on(table.postedAt),
]);

export const gstItcLedger = pgTable("gst_itc_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  taxType: gstTaxTypeEnum("tax_type").notNull(),
  periodMonth: text("period_month").notNull(),
  periodYear: text("period_year").notNull(),
  openingBalance: numeric("opening_balance", { precision: 18, scale: 2 }).default("0"),
  additions: numeric("additions", { precision: 18, scale: 2 }).default("0"),
  reversals: numeric("reversals", { precision: 18, scale: 2 }).default("0"),
  utilized: numeric("utilized", { precision: 18, scale: 2 }).default("0"),
  closingBalance: numeric("closing_balance", { precision: 18, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("gst_itc_ledger_tenant_period_tax_type_unique").on(
    table.tenantId, table.periodMonth, table.periodYear, table.taxType
  ),
  index("gst_itc_ledger_tenant_id_idx").on(table.tenantId),
]);

export const gstLiabilityLedger = pgTable("gst_liability_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  taxType: gstTaxTypeEnum("tax_type").notNull(),
  periodMonth: text("period_month").notNull(),
  periodYear: text("period_year").notNull(),
  outputLiability: numeric("output_liability", { precision: 18, scale: 2 }).default("0"),
  inputCredit: numeric("input_credit", { precision: 18, scale: 2 }).default("0"),
  netPayable: numeric("net_payable", { precision: 18, scale: 2 }).default("0"),
  paidAmount: numeric("paid_amount", { precision: 18, scale: 2 }).default("0"),
  carriedForward: numeric("carried_forward", { precision: 18, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("gst_liability_ledger_tenant_period_tax_type_unique").on(
    table.tenantId, table.periodMonth, table.periodYear, table.taxType
  ),
  index("gst_liability_ledger_tenant_id_idx").on(table.tenantId),
]);
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
pnpm turbo typecheck
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/schema/gst-ledgers.ts
git commit -m "feat(db): add GST cash, ITC, liability ledger tables"
```

---

### Task 4: Create GST Config Schema

**Files:**
- Create: `packages/db/src/schema/gst-config.ts`

- [ ] **Step 1: Create gst-config.ts**

```typescript
import {
  pgTable, uuid, text, boolean, jsonb, timestamp,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const gstConfig = pgTable("gst_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  gstin: text("gstin").notNull(),
  stateCode: text("state_code").notNull(),
  businessNature: text("business_nature").notNull(),
  compositionScheme: boolean("composition_scheme").default(false),
  hsnMapping: jsonb("hsn_mapping"),
  reverseChargeApplicable: boolean("reverse_charge_applicable").default(false),
  tdsApplicable: boolean("tds_applicable").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex("gst_config_tenant_id_unique").on(table.tenantId),
  index("gst_config_gstin_idx").on(table.gstin),
]);
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
pnpm turbo typecheck
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/schema/gst-config.ts
git commit -m "feat(db): add GST configuration table"
```

---

### Task 5: Create GSTR Mappings Schema

**Files:**
- Create: `packages/db/src/schema/gstr-mappings.ts`

- [ ] **Step 1: Create gstr-mappings.ts**

```typescript
import {
  pgTable, uuid, text, jsonb, timestamp,
  index,
} from "drizzle-orm/pg-core";
import { gstReturnTypeEnum } from "./enums";

export const gstrTableMappings = pgTable("gstr_table_mappings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tableCode: text("table_code").notNull(),
  tableName: text("table_name").notNull(),
  description: text("description"),
  mappingLogic: jsonb("mapping_logic"),
  returnType: gstReturnTypeEnum("return_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("gstr_table_mappings_return_type_idx").on(table.returnType),
  index("gstr_table_mappings_table_code_idx").on(table.tableCode),
]);
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
pnpm turbo typecheck
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/schema/gstr-mappings.ts
git commit -m "feat(db): add GSTR table mappings table"
```

---

### Task 6: Update Schema Index

**Files:**
- Modify: `packages/db/src/schema/index.ts`

- [ ] **Step 1: Add GST schema exports**

Update `packages/db/src/schema/index.ts`:

```typescript
export * from "./enums";
export * from "./tenants";
export * from "./users";
export * from "./accounts";
export * from "./journal";
export * from "./projections";
export * from "./fiscal-years";
export * from "./projector-state";
export * from "./events";
export * from "./invoices";
export * from "./payments";
export * from "./invoice-config";
export * from "./receivables-summary";
export * from "./email-queue";
export * from "./ocr-scan";
export * from "./products";
export * from "./inventory";
export * from "./inventory-config";
export * from "./employees";
export * from "./salary-structure";
export * from "./payroll";
export * from "./payroll-config";
export * from "./gst-returns";
export * from "./gst-ledgers";
export * from "./gst-config";
export * from "./gstr-mappings";
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
pnpm turbo typecheck
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/schema/index.ts
git commit -m "feat(db): export GST schema modules"
```

---

### Task 7: Generate Drizzle Types and Final Verification

**Files:**
- All schema files

- [ ] **Step 1: Generate Drizzle types**

```bash
pnpm db:generate
```

Expected: Drizzle types generated successfully

- [ ] **Step 2: Run full typecheck**

```bash
pnpm turbo typecheck
```

Expected: No errors

- [ ] **Step 3: Final commit (if any generated files changed)**

```bash
git add .
git commit -m "chore(db): generate Drizzle types for GST schema"
```

---

## Self-Review Checklist

- [ ] All tables have `tenant_id` for multi-tenant isolation
- [ ] All amount fields use `numeric(18, 2)`
- [ ] Period fields use `text` type (consistent with payroll)
- [ ] Unique constraints on (tenant_id, period_month, period_year, ...) where required
- [ ] Indexes on tenant_id and commonly queried fields
- [ ] Follows existing schema patterns from payroll.ts
- [ ] All enums added to enums.ts
- [ ] All modules exported from index.ts
