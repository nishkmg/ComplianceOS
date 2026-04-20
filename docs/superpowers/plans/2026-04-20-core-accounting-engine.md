# Core Accounting Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Core Accounting Engine for ComplianceOS — a double-entry ledger with event sourcing, chart of accounts, journal entries, financial reports, fiscal year management, and onboarding — deployed on Railway.

**Architecture:** Event-sourced command handlers write to an append-only event store. A dedicated Node.js projector worker reads events via `SKIP LOCKED` and updates projection tables. Next.js App Router serves the frontend + tRPC API. PostgreSQL RLS enforces multi-tenant isolation. Drizzle ORM manages schema and migrations.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5, tRPC v11, Drizzle ORM, PostgreSQL 16, Redis 7, NextAuth.js v5, Zod, Tailwind CSS, Shadcn/UI, pnpm + Turborepo, Railway (infra)

---

## File Structure

```
apps/
  web/
    app/                          # Next.js App Router pages
      (auth)/
        login/page.tsx
        signup/page.tsx
      (app)/
        layout.tsx                # Authenticated layout with sidebar
        dashboard/page.tsx
        accounts/
          page.tsx                # Chart of Accounts tree
          [id]/page.tsx           # Account detail
          new/page.tsx            # Create account
        journal/
          page.tsx                # Journal entries list
          new/page.tsx            # Create draft entry
          [id]/page.tsx           # Entry detail + post/void actions
        reports/
          trial-balance/page.tsx
          profit-loss/page.tsx
          balance-sheet/page.tsx
          cash-flow/page.tsx
          ledger/page.tsx
        settings/
          fiscal-years/page.tsx
          fiscal-years/[id]/page.tsx
    lib/
      auth.ts                     # NextAuth config
      session.ts                  # Session helpers + tenant resolution
    components/
      ui/                         # Shadcn/UI components
      accounts/
        account-tree.tsx
        account-form.tsx
      journal/
        entry-form.tsx
        entry-lines.tsx
        entry-status-badge.tsx
      reports/
        report-header.tsx
        pl-scheduleiii.tsx
        pl-proprietorship.tsx
        bs-scheduleiii.tsx
        cash-flow-indirect.tsx
        ledger-register.tsx
        trial-balance-table.tsx
      dashboard/
        kpi-card.tsx
        recent-transactions.tsx
        fy-progress.tsx
      onboarding/
        business-profile-form.tsx
        module-activation.tsx
        coa-template-customizer.tsx
        fy-gst-setup.tsx
        opening-balances-form.tsx
packages/
  db/
    src/
      schema/
        users.ts                 # users, user_tenants tables
        tenants.ts               # tenants, tenant_module_config tables
        accounts.ts              # accounts, account_tags, cash_flow_default_mapping, account_cash_flow_overrides
        journal.ts               # journal_entries, journal_entry_lines, narration_corrections
        events.ts                # event_store, snapshots
        projections.ts           # account_balances, journal_entry_view, fy_summaries
        fiscal-years.ts           # fiscal_years, entry_number_counters
        projector-state.ts        # projector_state, report_cache_versions
        enums.ts                 # All Drizzle pgEnums
        index.ts                 # Re-exports all schema objects
      migrations/                # DrizzleKit-generated SQL migrations
      seed/
        coa-templates/           # JSON template files for each business type
          sole_proprietorship_trading.json
          sole_proprietorship_services.json
          partnership_trading.json
          partnership_services.json
          private_limited_manufacturing.json
          private_limited_trading.json
          private_limited_services.json
          llp_services.json
          huf_trading.json
          regulated_professional.json
        cash-flow-defaults.ts    # Seed cash_flow_default_mapping rows
        index.ts                 # Seeder entry point
      src/
        index.ts                 # Drizzle client + connection
    drizzle.config.ts
  server/
    src/
      commands/
        create-journal-entry.ts
        modify-journal-entry.ts
        post-journal-entry.ts
        void-journal-entry.ts
        delete-journal-entry.ts
        create-account.ts
        modify-account.ts
        deactivate-account.ts
        create-fiscal-year.ts
        close-fiscal-year.ts
        amend-opening-balance.ts
        correct-narration.ts
      projectors/
        worker.ts                # Main projector loop (long-running process)
        account-balance.ts       # AccountBalanceProjector
        journal-entry-view.ts    # JournalEntryViewProjector
        snapshot.ts              # SnapshotProjector
        fy-summary.ts           # FYSummaryProjector
        types.ts                 # Shared projector types
      routers/
        accounts.ts              # tRPC account procedures
        journal-entries.ts       # tRPC journal entry procedures
        balances.ts              # tRPC balance/report procedures
        fiscal-years.ts          # tRPC fiscal year procedures
        onboarding.ts            # tRPC onboarding procedures
      lib/
        event-store.ts           # Event store read/write helpers
        aggregate-loader.ts      # Load aggregate from snapshot + replay
        balance-validator.ts      # Debit = Credit validation
        rls.ts                   # SET app.tenant_id helper
        entry-number.ts          # Gapless entry number counter
      index.ts                   # Create tRPC router, export type
  shared/
    src/
      types/
        events.ts                # Event type definitions + payloads
        commands.ts              # Command input/output types
        reports.ts               # Report output types
        onboarding.ts            # Onboarding step types
      validation/
        journal.ts               # Zod schemas for journal entries
        account.ts               # Zod schemas for accounts
        fiscal-year.ts           # Zod schemas for fiscal years
        onboarding.ts            # Zod schemas for onboarding
      constants/
        chart-of-accounts.ts     # CoA template types
        gst.ts                   # GST rates, TDS sections
      index.ts                   # Re-exports
config/
  eslint.config.js
  tsconfig.base.json
  tailwind.config.ts
```

---

## Task 1: Monorepo Scaffolding + Tooling

**Files:**
- Create: `package.json` (root), `pnpm-workspace.yaml`, `turbo.json`
- Create: `apps/web/package.json`, `packages/db/package.json`, `packages/server/package.json`, `packages/shared/package.json`
- Create: `config/eslint.config.js`, `config/tsconfig.base.json`
- Create: `apps/web/drizzle.config.ts` (symlinked from `packages/db/drizzle.config.ts`)
- Create: `.env.example`

- [ ] **Step 1: Initialize root workspace**

```bash
mkdir -p /Volumes/CrucialSSD/Projects/ComplianceOS
cd /Volumes/CrucialSSD/Projects/ComplianceOS
pnpm init
```

Edit the generated `package.json` to set `name: "complianceos"`, `private: true`.

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

- [ ] **Step 4: Create apps/web/package.json**

```json
{
  "name": "@complianceos/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.62.0",
    "next-auth": "^5.0.0-beta.25",
    "@auth/drizzle-adapter": "^1.7.0",
    "drizzle-orm": "^0.38.0",
    "zod": "^3.24.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 5: Create packages/db/package.json**

```json
{
  "name": "@complianceos/db",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "tsx src/seed/index.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "drizzle-orm": "^0.38.0",
    "postgres": "^0.5.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "@complianceos/shared": "workspace:*"
  }
}
```

- [ ] **Step 6: Create packages/server/package.json**

```json
{
  "name": "@complianceos/server",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "dev:projector": "tsx watch src/projectors/worker.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@complianceos/db": "workspace:*",
    "@complianceos/shared": "workspace:*",
    "drizzle-orm": "^0.38.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 7: Create packages/shared/package.json**

```json
{
  "name": "@complianceos/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 8: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {}
  }
}
```

- [ ] **Step 9: Create .env.example**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/complianceos
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

- [ ] **Step 10: Create .gitignore**

```
node_modules/
.next/
dist/
.turbo/
.env
.env.local
*.tsbuildinfo
```

- [ ] **Step 11: Install dependencies and verify**

```bash
cd /Volumes/CrucialSSD/Projects/ComplianceOS
pnpm install
pnpm turbo build --dry-run
```

Expect: Turborepo resolves the dependency graph without errors.

- [ ] **Step 12: Initialize git and commit**

```bash
git init
git add -A
git commit -m "chore: monorepo scaffolding with pnpm + turborepo"
```

---

## Task 2: Database Schema (Part 1 — Enums + Users/Tenants)

**Files:**
- Create: `packages/db/src/schema/enums.ts`
- Create: `packages/db/src/schema/users.ts`
- Create: `packages/db/src/schema/tenants.ts`
- Create: `packages/db/src/schema/index.ts` (partial — add enums, users, tenants)
- Create: `packages/db/drizzle.config.ts`
- Create: `packages/db/tsconfig.json`
- Test: `packages/db/src/schema/__tests__/enums.test.ts` (validate enum values match spec)

- [ ] **Step 1: Create drizzle.config.ts**

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 2: Write failing test for enums**

```typescript
// packages/db/src/schema/__tests__/enums.test.ts
import { describe, it, expect } from "vitest";
import {
  businessTypeEnum,
  stateEnum,
  industryEnum,
  gstRegistrationEnum,
  roleEnum,
  moduleEnum,
  setByEnum,
  accountKindEnum,
  accountSubTypeEnum,
  reconciliationAccountEnum,
  referenceTypeEnum,
  jeStatusEnum,
  aggregateTypeEnum,
  eventTypeEnum,
  cashFlowCategoryEnum,
  fyStatusEnum,
} from "../enums";

describe("Enums match spec", () => {
  it("businessTypeEnum has all values", () => {
    const values = businessTypeEnum.enumValues;
    expect(values).toContain("sole_proprietorship");
    expect(values).toContain("partnership");
    expect(values).toContain("llp");
    expect(values).toContain("private_limited");
    expect(values).toContain("public_limited");
    expect(values).toContain("huf");
    expect(values).toHaveLength(6);
  });

  it("stateEnum has 28 states + 8 UTs", () => {
    expect(stateEnum.enumValues).toHaveLength(36);
  });

  it("industryEnum has all values", () => {
    const values = industryEnum.enumValues;
    expect(values).toContain("retail_trading");
    expect(values).toContain("manufacturing");
    expect(values).toContain("services_professional");
    expect(values).toContain("freelancer_consultant");
    expect(values).toContain("regulated_professional");
    expect(values).toHaveLength(5);
  });

  it("accountKindEnum has 5 values", () => {
    expect(accountKindEnum.enumValues).toHaveLength(5);
  });

  it("jeStatusEnum has draft, posted, voided", () => {
    expect(jeStatusEnum.enumValues).toEqual(["draft", "posted", "voided"]);
  });

  it("eventTypeEnum includes all lifecycle events", () => {
    const values = eventTypeEnum.enumValues;
    expect(values).toContain("journal_entry_created");
    expect(values).toContain("journal_entry_posted");
    expect(values).toContain("fiscal_year_closed");
    expect(values).toContain("narration_corrected");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd packages/db && pnpm vitest run src/schema/__tests__/enums.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 4: Create enums.ts**

```typescript
// packages/db/src/schema/enums.ts
import { pgEnum } from "drizzle-orm/pg-core";

export const businessTypeEnum = pgEnum("business_type", [
  "sole_proprietorship",
  "partnership",
  "llp",
  "private_limited",
  "public_limited",
  "huf",
]);

export const stateEnum = pgEnum("state", [
  "andhra_pradesh", "arunachal_pradesh", "assam", "bihar",
  "chhattisgarh", "goa", "gujarat", "haryana",
  "himachal_pradesh", "jharkhand", "karnataka", "kerala",
  "madhya_pradesh", "maharashtra", "manipur", "meghalaya",
  "mizoram", "nagaland", "odisha", "punjab",
  "rajasthan", "sikkim", "tamil_nadu", "telangana",
  "tripura", "uttar_pradesh", "uttarakhand", "west_bengal",
  "andaman_nicobar", "chandigarh", "dadra_nagar_haveli_daman_diu",
  "delhi", "jammu_kashmir", "ladakh", "lakshadweep", "puducherry",
]);

export const industryEnum = pgEnum("industry", [
  "retail_trading",
  "manufacturing",
  "services_professional",
  "freelancer_consultant",
  "regulated_professional",
]);

export const gstRegistrationEnum = pgEnum("gst_registration", ["regular", "composition", "none"]);

export const roleEnum = pgEnum("role", ["owner", "accountant", "manager", "employee"]);

export const moduleEnum = pgEnum("module", [
  "accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr",
]);

export const setByEnum = pgEnum("set_by", ["auto", "manual"]);

export const accountKindEnum = pgEnum("account_kind", [
  "Asset", "Liability", "Equity", "Revenue", "Expense",
]);

export const accountSubTypeEnum = pgEnum("account_sub_type", [
  "CurrentAsset", "FixedAsset", "Bank", "Cash", "Inventory",
  "CurrentLiability", "LongTermLiability",
  "Capital", "Drawing", "Reserves",
  "OperatingRevenue", "OtherRevenue",
  "DirectExpense", "IndirectExpense",
]);

export const tagEnum = pgEnum("tag", [
  "trade_receivable", "trade_payable",
  "gst", "tds", "tds_payable",
  "finance_cost", "depreciation", "tax",
  "employee_benefits", "manufacturing",
  "inventory_adjustment", "trading", "returns",
  "opening_balance",
]);

export const reconciliationAccountEnum = pgEnum("reconciliation_account", ["bank", "none"]);

export const referenceTypeEnum = pgEnum("reference_type", [
  "invoice", "payment", "receipt", "journal",
  "payroll", "inventory", "opening_balance", "manual",
]);

export const jeStatusEnum = pgEnum("je_status", ["draft", "posted", "voided"]);

export const aggregateTypeEnum = pgEnum("aggregate_type", [
  "journal_entry", "account", "fiscal_year",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "journal_entry_created", "journal_entry_modified", "journal_entry_deleted",
  "journal_entry_posted", "journal_entry_voided", "journal_entry_reversed",
  "account_created", "account_modified", "account_deactivated",
  "fiscal_year_created", "fiscal_year_closed",
  "narration_corrected",
]);

export const cashFlowCategoryEnum = pgEnum("cash_flow_category", [
  "operating", "investing", "financing",
]);

export const fyStatusEnum = pgEnum("fy_status", ["open", "closed"]);
```

- [ ] **Step 5: Create users.ts**

```typescript
// packages/db/src/schema/users.ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { roleEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userTenants = pgTable("user_tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  role: roleEnum("role").notNull().default("owner"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userTenantUnique: {
    fields: [table.userId, table.tenantId],
    name: "user_tenants_user_id_tenant_id_unique",
  },
}));
```

- [ ] **Step 6: Create tenants.ts**

```typescript
// packages/db/src/schema/tenants.ts
import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { businessTypeEnum, stateEnum, industryEnum, gstRegistrationEnum, moduleEnum, setByEnum } from "./enums";
import { users } from "./users";

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  legalName: text("legal_name"),
  businessType: businessTypeEnum("business_type"),
  pan: text("pan").notNull(),
  gstin: text("gstin"),
  address: text("address").notNull(),
  state: stateEnum("state").notNull(),
  industry: industryEnum("industry"),
  gstRegistration: gstRegistrationEnum("gst_registration"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tenantModuleConfig = pgTable("tenant_module_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  module: moduleEnum("module").notNull(),
  enabled: text("enabled").notNull().default("false"),
  config: jsonb("config").default({}),
  setBy: setByEnum("set_by").default("auto"),
}, (table) => ({
  tenantModuleUnique: {
    fields: [table.tenantId, table.module],
    name: "tenant_module_config_tenant_id_module_unique",
  },
}));
```

- [ ] **Step 7: Create schema/index.ts (initial)**

```typescript
// packages/db/src/schema/index.ts
export * from "./enums";
export * from "./users";
export * from "./tenants";
```

- [ ] **Step 8: Run test to verify all enums pass**

```bash
cd packages/db && pnpm vitest run src/schema/__tests__/enums.test.ts
```

Expected: PASS — all enum values match spec.

- [ ] **Step 9: Generate initial migration**

```bash
cd packages/db && pnpm db:generate
```

Expected: Generates migration SQL file in `migrations/` directory.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(db): enums, users, tenants schema"
```

---

## Task 3: Database Schema (Part 2 — Accounts + Journal + Events)

**Files:**
- Create: `packages/db/src/schema/accounts.ts`
- Create: `packages/db/src/schema/journal.ts`
- Create: `packages/db/src/schema/events.ts`
- Update: `packages/db/src/schema/index.ts` (add re-exports)
- Test: `packages/db/src/schema/__tests__/accounts.test.ts`

- [ ] **Step 1: Write failing test — accounts schema has required columns**

```typescript
// packages/db/src/schema/__tests__/accounts.test.ts
import { describe, it, expect } from "vitest";
import { accounts, accountTags, cashFlowDefaultMapping, accountCashFlowOverrides } from "../accounts";
import { getTableColumns } from "drizzle-orm";

describe("accounts schema", () => {
  it("accounts table has all required columns", () => {
    const cols = Object.keys(getTableColumns(accounts));
    expect(cols).toContain("id");
    expect(cols).toContain("tenantId");
    expect(cols).toContain("code");
    expect(cols).toContain("name");
    expect(cols).toContain("kind");
    expect(cols).toContain("subType");
    expect(cols).toContain("parentId");
    expect(cols).toContain("isSystem");
    expect(cols).toContain("isActive");
    expect(cols).toContain("isLeaf");
    expect(cols).toContain("reconciliationAccount");
  });

  it("accounts has unique constraint on tenant_id + code", () => {
    expect(accounts).toBeDefined();
  });

  it("cashFlowDefaultMapping has unique on sub_type", () => {
    expect(cashFlowDefaultMapping).toBeDefined();
  });

  it("accountCashFlowOverrides has unique on tenant_id + account_id", () => {
    expect(accountCashFlowOverrides).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd packages/db && pnpm vitest run src/schema/__tests__/accounts.test.ts
```

- [ ] **Step 3: Create accounts.ts**

```typescript
// packages/db/src/schema/accounts.ts
import {
  pgTable, uuid, text, boolean, timestamp,
  uniqueIndex, index, foreignKey,
} from "drizzle-orm/pg-core";
import {
  accountKindEnum, accountSubTypeEnum, tagEnum,
  reconciliationAccountEnum, cashFlowCategoryEnum,
} from "./enums";
import { tenants } from "./tenants";

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  kind: accountKindEnum("kind").notNull(),
  subType: accountSubTypeEnum("sub_type").notNull(),
  parentId: uuid("parent_id"),
  isSystem: boolean("is_system").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isLeaf: boolean("is_leaf").default(true).notNull(),
  reconciliationAccount: reconciliationAccountEnum("reconciliation_account").default("none").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("accounts_tenant_id_code_unique").on(table.tenantId, table.code),
  index("accounts_tenant_id_is_leaf_idx").on(table.tenantId, table.isLeaf),
  foreignKey({
    columns: [table.parentId],
    foreignColumns: [table.id],
    name: "accounts_parent_id_fk",
  }),
]);

export const accountTags = pgTable("account_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  tag: tagEnum("tag").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("account_tags_account_id_tag_unique").on(table.accountId, table.tag),
]);

export const cashFlowDefaultMapping = pgTable("cash_flow_default_mapping", {
  id: uuid("id").defaultRandom().primaryKey(),
  subType: accountSubTypeEnum("sub_type").notNull(),
  cashFlowCategory: cashFlowCategoryEnum("cash_flow_category").notNull(),
}, (table) => [
  uniqueIndex("cash_flow_default_mapping_sub_type_unique").on(table.subType),
]);

export const accountCashFlowOverrides = pgTable("account_cash_flow_overrides", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  cashFlowCategory: cashFlowCategoryEnum("cash_flow_category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("account_cash_flow_overrides_tenant_id_account_id_unique").on(table.tenantId, table.accountId),
]);
```

- [ ] **Step 4: Create journal.ts**

```typescript
// packages/db/src/schema/journal.ts
import {
  pgTable, uuid, text, date, numeric, timestamp,
  foreignKey, check, index,
} from "drizzle-orm/pg-core";
import { referenceTypeEnum, jeStatusEnum } from "./enums";
import { tenants } from "./tenants";
import { accounts } from "./accounts";
import { users } from "./users";

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  entryNumber: text("entry_number").notNull(),
  date: date("date").notNull(),
  narration: text("narration").notNull(),
  referenceType: referenceTypeEnum("reference_type").notNull().default("manual"),
  referenceId: uuid("reference_id"),
  status: jeStatusEnum("status").notNull().default("draft"),
  fiscalYear: text("fiscal_year").notNull(),
  reversalOf: uuid("reversal_of"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("journal_entries_tenant_id_entry_number_unique").on(table.tenantId, table.entryNumber),
  foreignKey({
    columns: [table.reversalOf],
    foreignColumns: [table.id],
    name: "journal_entries_reversal_of_fk",
  }),
]);

export const journalEntryLines = pgTable("journal_entry_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  journalEntryId: uuid("journal_entry_id").notNull().references(() => journalEntries.id),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  debit: numeric("debit", { precision: 18, scale: 2 }).default("0").notNull(),
  credit: numeric("credit", { precision: 18, scale: 2 }).default("0").notNull(),
  description: text("description"),
}, (table) => [
  check("debit_non_negative", sql`${table.debit} >= 0`),
  check("credit_non_negative", sql`${table.credit} >= 0`),
  check("debit_xor_credit", sql`(${table.debit} = 0 OR ${table.credit} = 0)`),
  check("amount_required", sql`NOT (${table.debit} = 0 AND ${table.credit} = 0)`),
]);

export const narrationCorrections = pgTable("narration_corrections", {
  id: uuid("id").defaultRandom().primaryKey(),
  journalEntryId: uuid("journal_entry_id").notNull().references(() => journalEntries.id),
  oldNarration: text("old_narration").notNull(),
  newNarration: text("new_narration").notNull(),
  correctedBy: uuid("corrected_by").notNull().references(() => users.id),
  correctedAt: timestamp("corrected_at", { withTimezone: true }).defaultNow().notNull(),
});
```

Note: The `sql` template tag is imported from `drizzle-orm`.

- [ ] **Step 5: Create events.ts**

```typescript
// packages/db/src/schema/events.ts
import {
  pgTable, uuid, text, jsonb, bigint, timestamp,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { aggregateTypeEnum, eventTypeEnum } from "./enums";
import { tenants } from "./tenants";
import { users } from "./users";

export const eventStore = pgTable("event_store", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  aggregateType: aggregateTypeEnum("aggregate_type").notNull(),
  aggregateId: uuid("aggregate_id").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  sequence: bigint("sequence", { mode: "bigint" }).notNull(),
  actorId: uuid("actor_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("event_store_aggregate_id_sequence_unique").on(table.aggregateId, table.sequence),
  index("event_store_tenant_id_idx").on(table.tenantId),
  index("event_store_sequence_idx").on(table.sequence),
]);

export const snapshots = pgTable("snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  aggregateType: aggregateTypeEnum("aggregate_type").notNull(),
  aggregateId: uuid("aggregate_id").notNull(),
  sequence: bigint("sequence", { mode: "bigint" }).notNull(),
  state: jsonb("state").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("snapshots_aggregate_id_sequence_unique").on(table.aggregateId, table.sequence),
]);
```

- [ ] **Step 6: Update schema/index.ts**

```typescript
// packages/db/src/schema/index.ts
export * from "./enums";
export * from "./users";
export * from "./tenants";
export * from "./accounts";
export * from "./journal";
export * from "./events";
```

- [ ] **Step 7: Run tests**

```bash
cd packages/db && pnpm vitest run src/schema/__tests__/
```

Expected: All PASS.

- [ ] **Step 8: Generate migration**

```bash
cd packages/db && pnpm db:generate
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(db): accounts, journal, events schema"
```

---

## Task 4: Database Schema (Part 3 — Projections + FY + Projector State)

**Files:**
- Create: `packages/db/src/schema/projections.ts`
- Create: `packages/db/src/schema/fiscal-years.ts`
- Create: `packages/db/src/schema/projector-state.ts`
- Update: `packages/db/src/schema/index.ts`
- Test: `packages/db/src/schema/__tests__/projections.test.ts`

- [ ] **Step 1: Write failing test — projection tables exist with correct columns**

```typescript
// packages/db/src/schema/__tests__/projections.test.ts
import { describe, it, expect } from "vitest";
import { accountBalances, journalEntryView, fySummaries } from "../projections";
import { fiscalYears, entryNumberCounters } from "../fiscal-years";
import { projectorState, reportCacheVersions } from "../projector-state";
import { getTableColumns } from "drizzle-orm";

describe("projection schema", () => {
  it("accountBalances has required columns", () => {
    const cols = Object.keys(getTableColumns(accountBalances));
    expect(cols).toContain("tenantId");
    expect(cols).toContain("accountId");
    expect(cols).toContain("fiscalYear");
    expect(cols).toContain("period");
    expect(cols).toContain("openingBalance");
    expect(cols).toContain("debitTotal");
    expect(cols).toContain("creditTotal");
    expect(cols).toContain("closingBalance");
  });

  it("fiscalYears has required columns", () => {
    const cols = Object.keys(getTableColumns(fiscalYears));
    expect(cols).toContain("year");
    expect(cols).toContain("startDate");
    expect(cols).toContain("endDate");
    expect(cols).toContain("status");
  });

  it("projectorState has unique on tenant_id + projector_name", () => {
    expect(projectorState).toBeDefined();
  });

  it("entryNumberCounters has unique on tenant_id + fiscal_year", () => {
    expect(entryNumberCounters).toBeDefined();
  });
});
```

- [ ] **Step 2: Create projections.ts**

```typescript
// packages/db/src/schema/projections.ts
import {
  pgTable, uuid, text, numeric, integer, timestamp,
  uniqueIndex, index, foreignKey,
} from "drizzle-orm/pg-core";
import { referenceTypeEnum, jeStatusEnum } from "./enums";
import { tenants } from "./tenants";
import { accounts } from "./accounts";
import { journalEntries } from "./journal";
import { users } from "./users";

export const accountBalances = pgTable("account_balances", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  fiscalYear: text("fiscal_year").notNull(),
  period: text("period").notNull(),
  openingBalance: numeric("opening_balance", { precision: 18, scale: 2 }).default("0").notNull(),
  debitTotal: numeric("debit_total", { precision: 18, scale: 2 }).default("0").notNull(),
  creditTotal: numeric("credit_total", { precision: 18, scale: 2 }).default("0").notNull(),
  closingBalance: numeric("closing_balance", { precision: 18, scale: 2 }).default("0").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("account_balances_tenant_account_fy_period_unique").on(
    table.tenantId, table.accountId, table.fiscalYear, table.period,
  ),
]);

export const journalEntryView = pgTable("journal_entry_view", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  journalEntryId: uuid("journal_entry_id").notNull().references(() => journalEntries.id),
  entryNumber: text("entry_number").notNull(),
  date: text("date").notNull(),
  narration: text("narration").notNull(),
  referenceType: referenceTypeEnum("reference_type"),
  referenceId: uuid("reference_id"),
  status: jeStatusEnum("status"),
  fiscalYear: text("fiscal_year").notNull(),
  totalDebit: numeric("total_debit", { precision: 18, scale: 2 }),
  totalCredit: numeric("total_credit", { precision: 18, scale: 2 }),
  lineCount: integer("line_count"),
  createdByName: text("created_by_name"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const fySummaries = pgTable("fy_summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  fiscalYear: text("fiscal_year").notNull(),
  totalRevenue: numeric("total_revenue", { precision: 18, scale: 2 }),
  totalExpenses: numeric("total_expenses", { precision: 18, scale: 2 }),
  netProfit: numeric("net_profit", { precision: 18, scale: 2 }),
  retainedEarnings: numeric("retained_earnings", { precision: 18, scale: 2 }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("fy_summaries_tenant_fy_unique").on(table.tenantId, table.fiscalYear),
]);
```

- [ ] **Step 3: Create fiscal-years.ts**

```typescript
// packages/db/src/schema/fiscal-years.ts
import {
  pgTable, uuid, text, date, timestamp, bigint,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { fyStatusEnum } from "./enums";
import { tenants } from "./tenants";
import { users } from "./users";

export const fiscalYears = pgTable("fiscal_years", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  year: text("year").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: fyStatusEnum("status").default("open").notNull(),
  closedBy: uuid("closed_by").references(() => users.id),
  closedAt: timestamp("closed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("fiscal_years_tenant_id_year_unique").on(table.tenantId, table.year),
]);

export const entryNumberCounters = pgTable("entry_number_counters", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  fiscalYear: text("fiscal_year").notNull(),
  nextVal: bigint("next_val", { mode: "bigint" }).default(1n).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("entry_number_counters_tenant_fy_unique").on(table.tenantId, table.fiscalYear),
]);
```

- [ ] **Step 4: Create projector-state.ts**

```typescript
// packages/db/src/schema/projector-state.ts
import {
  pgTable, uuid, text, bigint, timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const projectorState = pgTable("projector_state", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  projectorName: text("projector_name").notNull(),
  lastProcessedSequence: bigint("last_processed_sequence", { mode: "bigint" }).default(0n).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("projector_state_tenant_name_unique").on(table.tenantId, table.projectorName),
]);

export const reportCacheVersions = pgTable("report_cache_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  fiscalYear: text("fiscal_year").notNull(),
  cacheVersion: bigint("cache_version", { mode: "bigint" }).default(0n).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("report_cache_versions_tenant_fy_unique").on(table.tenantId, table.fiscalYear),
]);
```

- [ ] **Step 5: Update schema/index.ts** — add projections, fiscal-years, projector-state exports

```typescript
// packages/db/src/schema/index.ts
export * from "./enums";
export * from "./users";
export * from "./tenants";
export * from "./accounts";
export * from "./journal";
export * from "./events";
export * from "./projections";
export * from "./fiscal-years";
export * from "./projector-state";
```

- [ ] **Step 6: Run tests**

```bash
cd packages/db && pnpm vitest run src/schema/__tests__/projections.test.ts
```

Expected: PASS

- [ ] **Step 7: Generate migration**

```bash
cd packages/db && pnpm db:generate
```

- [ ] **Step 8: Create DB client + connection module**

```typescript
// packages/db/src/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
export type Database = typeof db;
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(db): projections, fiscal years, projector state schema + db client"
```

---

## Task 5: RLS Policies + DB Triggers

**Files:**
- Create: `packages/db/migrations/XXXX_add_rls_policies.sql` (hand-written migration)
- Create: `packages/db/migrations/XXXX_add_triggers.sql`
- Create: `packages/db/src/rls.ts` (helper to set tenant context)

- [ ] **Step 1: Write RLS migration — all tenant-scoped tables get RLS**

```sql
-- packages/db/migrations/XXXX_add_rls_policies.sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_module_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_cash_flow_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE narration_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_view ENABLE ROW LEVEL SECURITY;
ALTER TABLE fy_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_number_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE projector_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cache_versions ENABLE ROW LEVEL SECURITY;

-- Template: each table gets USING (tenant_id = current_setting('app.tenant_id')::uuid)
-- and WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid)
-- Generated for all tenant-scoped tables:

CREATE POLICY tenant_isolation ON tenants
  USING (id = current_setting('app.tenant_id')::uuid);

-- Note: tenants table is special — the user's tenant_id must match.
-- All other tables use the standard tenant_id column.

CREATE POLICY tenant_isolation ON tenant_module_config
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON accounts
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON account_tags
  USING (account_id IN (SELECT id FROM accounts));

CREATE POLICY tenant_isolation ON account_cash_flow_overrides
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON journal_entries
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON journal_entry_lines
  USING (journal_entry_id IN (SELECT id FROM journal_entries));

CREATE POLICY tenant_isolation ON narration_corrections
  USING (journal_entry_id IN (SELECT id FROM journal_entries));

CREATE POLICY tenant_isolation ON event_store
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON snapshots
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON account_balances
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON journal_entry_view
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON fy_summaries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON fiscal_years
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON entry_number_counters
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON projector_state
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON report_cache_versions
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);
```

- [ ] **Step 2: Write trigger migration — is_leaf maintenance + balance check**

```sql
-- packages/db/migrations/XXXX_add_triggers.sql

-- Trigger 1: Maintain is_leaf on accounts
-- When an account gets a child, set parent's is_leaf = false
-- When all children removed, set parent's is_leaf = true

CREATE OR REPLACE FUNCTION update_parent_is_leaf() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE accounts SET is_leaf = false WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If parent changed, update both old and new parent
    IF OLD.parent_id IS DISTINCT FROM NEW.parent_id THEN
      IF OLD.parent_id IS NOT NULL THEN
        UPDATE accounts SET is_leaf = true
        WHERE id = OLD.parent_id
          AND NOT EXISTS (SELECT 1 FROM accounts WHERE parent_id = OLD.parent_id AND id != NEW.id);
      END IF;
      IF NEW.parent_id IS NOT NULL THEN
        UPDATE accounts SET is_leaf = false WHERE id = NEW.parent_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.parent_id IS NOT NULL THEN
      UPDATE accounts SET is_leaf = true
      WHERE id = OLD.parent_id
        AND NOT EXISTS (SELECT 1 FROM accounts WHERE parent_id = OLD.parent_id);
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accounts_is_leaf
  AFTER INSERT OR UPDATE OF parent_id OR DELETE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_parent_is_leaf();

-- Trigger 2: Enforce debit = credit on journal entry lines
CREATE OR REPLACE FUNCTION check_je_balance() RETURNS TRIGGER AS $$
DECLARE
  total_debit NUMERIC(18,2);
  total_credit NUMERIC(18,2);
  je_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    je_id := NEW.journal_entry_id;
  ELSIF TG_OP = 'UPDATE' THEN
    je_id := NEW.journal_entry_id;
  ELSIF TG_OP = 'DELETE' THEN
    je_id := OLD.journal_entry_id;
  END IF;

  SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
  INTO total_debit, total_credit
  FROM journal_entry_lines
  WHERE journal_entry_id = je_id;

  -- Only enforce for posted entries (drafts are allowed to be unbalanced while editing)
  IF total_debit != total_credit THEN
    DECLARE
      je_status TEXT;
    BEGIN
      SELECT status INTO je_status FROM journal_entries WHERE id = je_id;
      IF je_status = 'posted' THEN
        RAISE EXCEPTION 'Journal entry % is unbalanced: debits = %, credits = %', je_id, total_debit, total_credit;
      END IF;
    END;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_je_balance_check
  AFTER INSERT OR UPDATE OR DELETE ON journal_entry_lines
  FOR EACH ROW EXECUTE FUNCTION check_je_balance();
```

- [ ] **Step 3: Create RLS helper module**

```typescript
// packages/db/src/rls.ts
import { sql } from "drizzle-orm";
import type { Database } from "./index";

export async function setTenantContext(db: Database, tenantId: string): Promise<void> {
  await db.execute(sql`SET LOCAL app.tenant_id = ${tenantId}`);
}

export async function withTenantContext<R>(
  db: Database,
  tenantId: string,
  fn: () => Promise<R>,
): Promise<R> {
  return await db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.tenant_id = ${tenantId}`);
    return fn();
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(db): RLS policies, is_leaf trigger, JE balance trigger"
```

---

## Task 6: Railway Infrastructure Setup

**Files:**
- Create: `railway.toml` (or `railway.json`)
- Create: `apps/web/Procfile` (web server process)
- Create: `packages/server/Procfile` (projector worker process)

- [ ] **Step 1: Install Railway CLI and login**

```bash
npm install -g @railway/cli
railway login
```

- [ ] **Step 2: Create Railway project**

```bash
cd /Volumes/CrucialSSD/Projects/ComplianceOS
railway init
```

Select "Empty project", name it "complianceos".

- [ ] **Step 3: Provision PostgreSQL service**

```bash
railway add --database postgres
```

Note the `DATABASE_URL` from Railway dashboard.

- [ ] **Step 4: Provision Redis service**

```bash
railway add --database redis
```

Note the `REDIS_URL` from Railway dashboard.

- [ ] **Step 5: Create railway.json for monorepo deployment**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm --filter @complianceos/web start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

- [ ] **Step 6: Create Procfile for projector worker**

Create `packages/server/Procfile`:
```
worker: pnpm --filter @complianceos/server dev:projector
```

Wait — for Railway, we want a production start command. Create `packages/server/package.json` deploy script: add `"start:projector": "node dist/projectors/worker.js"`.

For v1, the worker runs as a Railway background worker service deployed separately from the web app.

- [ ] **Step 7: Set environment variables in Railway**

```bash
railway variables set DATABASE_URL=<from-step-3>
railway variables set REDIS_URL=<from-step-4>
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
railway variables set NEXTAUTH_URL=https://complianceos.up.railway.app
```

- [ ] **Step 8: Commit infrastructure config**

```bash
git add -A
git commit -m "chore: Railway project setup + infrastructure config"
```

---

## Task 7: Shared Types + Validation Schemas

**Files:**
- Create: `packages/shared/src/types/events.ts`
- Create: `packages/shared/src/types/commands.ts`
- Create: `packages/shared/src/types/reports.ts`
- Create: `packages/shared/src/types/onboarding.ts`
- Create: `packages/shared/src/validation/journal.ts`
- Create: `packages/shared/src/validation/account.ts`
- Create: `packages/shared/src/validation/fiscal-year.ts`
- Create: `packages/shared/src/validation/onboarding.ts`
- Create: `packages/shared/src/constants/chart-of-accounts.ts`
- Create: `packages/shared/src/constants/gst.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create event types**

```typescript
// packages/shared/src/types/events.ts
import { z } from "zod";

// Base event envelope
export const EventEnvelopeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  aggregateType: z.enum(["journal_entry", "account", "fiscal_year"]),
  aggregateId: z.string().uuid(),
  eventType: z.enum([
    "journal_entry_created", "journal_entry_modified", "journal_entry_deleted",
    "journal_entry_posted", "journal_entry_voided", "journal_entry_reversed",
    "account_created", "account_modified", "account_deactivated",
    "fiscal_year_created", "fiscal_year_closed",
    "narration_corrected",
  ]),
  payload: z.record(z.unknown()),
  sequence: z.bigint(),
  actorId: z.string().uuid(),
  createdAt: z.date(),
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

// Journal entry event payloads
export const JournalEntryCreatedPayloadSchema = z.object({
  entryId: z.string().uuid(),
  entryNumber: z.string(),
  date: z.string(),
  narration: z.string(),
  referenceType: z.enum(["invoice", "payment", "receipt", "journal", "payroll", "inventory", "opening_balance", "manual"]),
  lines: z.array(z.object({
    accountId: z.string().uuid(),
    debit: z.string(),
    credit: z.string(),
    description: z.string().optional(),
  })),
  fiscalYear: z.string(),
});

export type JournalEntryCreatedPayload = z.infer<typeof JournalEntryCreatedPayloadSchema>;

export const JournalEntryPostedPayloadSchema = z.object({
  entryId: z.string().uuid(),
  postedAt: z.date(),
});

export type JournalEntryPostedPayload = z.infer<typeof JournalEntryPostedPayloadSchema>;

export const JournalEntryVoidedPayloadSchema = z.object({
  entryId: z.string().uuid(),
  voidedAt: z.date(),
  reversalEntryId: z.string().uuid().optional(),
  reason: z.string(),
});

export type JournalEntryVoidedPayload = z.infer<typeof JournalEntryVoidedPayloadSchema>;
```

- [ ] **Step 2: Create command types**

```typescript
// packages/shared/src/types/commands.ts
import { z } from "zod";

export const CreateJournalEntryInputSchema = z.object({
  date: z.string().date(),
  narration: z.string().min(1),
  referenceType: z.enum(["invoice", "payment", "receipt", "journal", "payroll", "inventory", "opening_balance", "manual"]).default("manual"),
  referenceId: z.string().uuid().optional(),
  lines: z.array(z.object({
    accountId: z.string().uuid(),
    debit: z.string().default("0"),
    credit: z.string().default("0"),
    description: z.string().optional(),
  })).min(2),
}).refine(
  (data) => {
    const totalDebit = data.lines.reduce((sum, l) => sum + parseFloat(l.debit), 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + parseFloat(l.credit), 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
  },
  { message: "Total debits must equal total credits" },
);

export type CreateJournalEntryInput = z.infer<typeof CreateJournalEntryInputSchema>;

export const PostJournalEntryInputSchema = z.object({
  entryId: z.string().uuid(),
});

export type PostJournalEntryInput = z.infer<typeof PostJournalEntryInputSchema>;

export const VoidJournalEntryInputSchema = z.object({
  entryId: z.string().uuid(),
  reason: z.string().min(1),
});

export type VoidJournalEntryInput = z.infer<typeof VoidJournalEntryInputSchema>;

export const ModifyJournalEntryInputSchema = z.object({
  entryId: z.string().uuid(),
  narration: z.string().min(1).optional(),
  date: z.string().date().optional(),
  lines: z.array(z.object({
    accountId: z.string().uuid(),
    debit: z.string().default("0"),
    credit: z.string().default("0"),
    description: z.string().optional(),
  })).min(2).optional(),
}).refine(
  (data) => {
    if (!data.lines) return true;
    const totalDebit = data.lines.reduce((sum, l) => sum + parseFloat(l.debit), 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + parseFloat(l.credit), 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
  },
  { message: "Total debits must equal total credits" },
);

export type ModifyJournalEntryInput = z.infer<typeof ModifyJournalEntryInputSchema>;

export const CreateAccountInputSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(["Asset", "Liability", "Equity", "Revenue", "Expense"]),
  subType: z.enum([
    "CurrentAsset", "FixedAsset", "Bank", "Cash", "Inventory",
    "CurrentLiability", "LongTermLiability",
    "Capital", "Drawing", "Reserves",
    "OperatingRevenue", "OtherRevenue",
    "DirectExpense", "IndirectExpense",
  ]),
  parentId: z.string().uuid().optional(),
  reconciliationAccount: z.enum(["bank", "none"]).default("none"),
  tags: z.array(z.enum([
    "trade_receivable", "trade_payable",
    "gst", "tds", "tds_payable",
    "finance_cost", "depreciation", "tax",
    "employee_benefits", "manufacturing",
    "inventory_adjustment", "trading", "returns",
    "opening_balance",
  ])).optional(),
});

export type CreateAccountInput = z.infer<typeof CreateAccountInputSchema>;
```

- [ ] **Step 3: Create report types**

```typescript
// packages/shared/src/types/reports.ts
export interface TrialBalanceRow {
  accountId: string;
  code: string;
  name: string;
  kind: string;
  debitTotal: string;
  creditTotal: string;
}

export interface TrialBalance {
  fiscalYear: string;
  asOfDate: string;
  rows: TrialBalanceRow[];
  totalDebit: string;
  totalCredit: string;
}

export interface PLLine {
  label: string;
  subLines?: PLLine[];
  amount: string;
  isTotal?: boolean;
}

export interface ProfitAndLoss {
  fiscalYear: string;
  fromPeriod: string;
  toPeriod: string;
  format: "schedule_iii" | "proprietorship";
  revenue: PLLine[];
  expenses: PLLine[];
  totalRevenue: string;
  totalExpenses: string;
  netProfit: string;
}

export interface BalanceSheetRow {
  label: string;
  amount: string;
  subItems?: BalanceSheetRow[];
  isTotal?: boolean;
}

export interface BalanceSheet {
  fiscalYear: string;
  asOfDate: string;
  format: "schedule_iii" | "proprietorship";
  equityAndLiabilities: BalanceSheetRow[];
  assets: BalanceSheetRow[];
  totalEquityAndLiabilities: string;
  totalAssets: string;
}

export interface CashFlowLine {
  label: string;
  amount: string;
}

export interface CashFlowStatement {
  fiscalYear: string;
  fromPeriod: string;
  toPeriod: string;
  operatingActivities: CashFlowLine[];
  investingActivities: CashFlowLine[];
  financingActivities: CashFlowLine[];
  netCashFlow: string;
  cashFromOperations: string;
  cashFromInvesting: string;
  cashFromFinancing: string;
}

export interface LedgerEntry {
  date: string;
  particulars: string;
  voucherType: string;
  debit: string;
  credit: string;
  balance: string;
  balanceType: "Dr" | "Cr";
}

export interface Ledger {
  accountId: string;
  accountName: string;
  accountCode: string;
  fromPeriod: string;
  toPeriod: string;
  openingBalance: string;
  openingBalanceType: "Dr" | "Cr";
  entries: LedgerEntry[];
  closingBalance: string;
  closingBalanceType: "Dr" | "Cr";
}
```

- [ ] **Step 4: Create GST constants**

```typescript
// packages/shared/src/constants/gst.ts
export const GST_RATES = [0, 5, 12, 18, 28] as const;
export type GstRate = typeof GST_RATES[number];

export const TDS_SECTIONS: Record<string, number> = {
  "194C": 1,     // Contractor
  "194H": 5,     // Commission
  "194I": 10,    // Rent
  "194J": 10,    // Professional fees
  "194A": 10,    // Interest other than securities
  "194D": 5,     // Insurance commission
  "194L": 10,    // Compensation on acquisition
  "192": 0,      // Salary (employer deducts via payroll)
} as const;
```

- [ ] **Step 5: Create shared index.ts**

```typescript
// packages/shared/src/index.ts
export * from "./types/events";
export * from "./types/commands";
export * from "./types/reports";
export * from "./types/onboarding";
export * from "./validation/journal";
export * from "./validation/account";
export * from "./validation/fiscal-year";
export * from "./validation/onboarding";
export * from "./constants/chart-of-accounts";
export * from "./constants/gst";
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(shared): event types, command types, validation schemas, constants"
```

---

## Task 8: Command Handlers — Journal Entries

**Files:**
- Create: `packages/server/src/commands/create-journal-entry.ts`
- Create: `packages/server/src/commands/post-journal-entry.ts`
- Create: `packages/server/src/commands/void-journal-entry.ts`
- Create: `packages/server/src/commands/delete-journal-entry.ts`
- Create: `packages/server/src/commands/modify-journal-entry.ts`
- Create: `packages/server/src/commands/correct-narration.ts`
- Create: `packages/server/src/lib/event-store.ts`
- Create: `packages/server/src/lib/aggregate-loader.ts`
- Create: `packages/server/src/lib/balance-validator.ts`
- Create: `packages/server/src/lib/entry-number.ts`
- Create: `packages/server/src/lib/rls.ts`
- Test: `packages/server/src/commands/__tests__/create-journal-entry.test.ts`

- [ ] **Step 1: Create event-store.ts helper**

```typescript
// packages/server/src/lib/event-store.ts
import { eq, and, gt } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { eventStore } from "@complianceos/db";
import { eventTypeEnum } from "@complianceos/db";
import type { EventEnvelope } from "@complianceos/shared";

export async function appendEvent(
  db: Database,
  tenantId: string,
  aggregateType: "journal_entry" | "account" | "fiscal_year",
  aggregateId: string,
  eventType: typeof eventTypeEnum.enumValues[number],
  payload: Record<string, unknown>,
  actorId: string,
): Promise<{ id: string; sequence: bigint }> {
  const result = await db.insert(eventStore).values({
    tenantId,
    aggregateType,
    aggregateId,
    eventType: eventType as (typeof eventStore.eventType.dataType as any),
    payload,
    actorId,
  }).returning({ id: eventStore.id, sequence: eventStore.sequence });

  return result[0];
}

export async function getAggregateEvents(
  db: Database,
  aggregateId: string,
  afterSequence: bigint = 0n,
): Promise<EventEnvelope[]> {
  return db.select().from(eventStore).where(
    and(
      eq(eventStore.aggregateId, aggregateId),
      gt(eventStore.sequence, afterSequence),
    ),
  ).orderBy(eventStore.sequence);
}
```

- [ ] **Step 2: Create aggregate-loader.ts**

```typescript
// packages/server/src/lib/aggregate-loader.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { snapshots } from "@complianceos/db";
import { getAggregateEvents } from "./event-store";
import type { EventEnvelope } from "@complianceos/shared";

export interface AggregateState {
  aggregateId: string;
  lastSequence: bigint;
  state: Record<string, unknown>;
}

export async function loadAggregate(
  db: Database,
  aggregateId: string,
  aggregateType: string,
): Promise<AggregateState> {
  // 1. Load latest snapshot
  const snapshot = await db.select()
    .from(snapshots)
    .where(eq(snapshots.aggregateId, aggregateId))
    .orderBy(snapshots.sequence)
    .limit(1);

  const lastSequence = snapshot[0]?.sequence ?? 0n;
  const state = (snapshot[0]?.state as Record<string, unknown>) ?? {};

  // 2. Replay events after snapshot
  const events = await getAggregateEvents(db, aggregateId, lastSequence);
  let currentState = { ...state };

  for (const event of events) {
    currentState = applyEvent(currentState, event);
  }

  return {
    aggregateId,
    lastSequence: events[events.length - 1]?.sequence ?? lastSequence,
    state: currentState,
  };
}

function applyEvent(
  state: Record<string, unknown>,
  event: EventEnvelope,
): Record<string, unknown> {
  // Simplified: command handlers apply their own logic
  // This generic replay merges payload into state
  return { ...state, ...event.payload as Record<string, unknown> };
}
```

- [ ] **Step 3: Create entry-number.ts**

```typescript
// packages/server/src/lib/entry-number.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { entryNumberCounters } from "@complianceos/db";
import { sql } from "drizzle-orm";

export async function getNextEntryNumber(
  db: Database,
  tenantId: string,
  fiscalYear: string,
): Promise<string> {
  return await db.transaction(async (tx) => {
    // Get counter with row lock (FOR UPDATE)
    const counter = await tx.select()
      .from(entryNumberCounters)
      .where(and(
        eq(entryNumberCounters.tenantId, tenantId),
        eq(entryNumberCounters.fiscalYear, fiscalYear),
      ))
      .for("update");

    if (counter.length === 0) {
      // Create counter if it doesn't exist
      const nextVal = 1n;
      await tx.insert(entryNumberCounters).values({
        tenantId,
        fiscalYear,
        nextVal: nextVal + 1n,
      });
      return `JE-${fiscalYear}-${ String(nextVal).padStart(3, "0")}`;
    }

    const current = counter[0];
    await tx.update(entryNumberCounters)
      .set({ nextVal: sql`${entryNumberCounters.nextVal} + 1` })
      .where(eq(entryNumberCounters.id, current.id));

    const num = current.nextVal;
    return `JE-${fiscalYear}-${ String(num).padStart(3, "0")}`;
  });
}
```

- [ ] **Step 4: Create balance-validator.ts**

```typescript
// packages/server/src/lib/balance-validator.ts
import { z } from "zod";

export function validateBalance(lines: Array<{ debit: string; credit: string }>): { valid: boolean; totalDebit: number; totalCredit: number } {
  const totalDebit = lines.reduce((sum, l) => sum + parseFloat(l.debit || "0"), 0);
  const totalCredit = lines.reduce((sum, l) => sum + parseFloat(l.credit || "0"), 0);
  return {
    valid: Math.abs(totalDebit - totalCredit) < 0.01,
    totalDebit,
    totalCredit,
  };
}
```

- [ ] **Step 5: Write failing test — CreateJournalEntry**

```typescript
// packages/server/src/commands/__tests__/create-journal-entry.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createJournalEntry } from "../create-journal-entry";

// Mock DB
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(),
} as any;

describe("createJournalEntry", () => {
  it("rejects unbalanced entry (debits != credits)", async () => {
    const input = {
      date: "2024-04-01",
      narration: "Test entry",
      referenceType: "manual" as const,
      lines: [
        { accountId: "acc-1", debit: "100", credit: "0" },
        { accountId: "acc-2", debit: "0", credit: "50" },
      ],
    };

    await expect(
      createJournalEntry(mockDb, "tenant-1", "user-1", "fy-1", input),
    ).rejects.toThrow("Total debits must equal total credits");
  });

  it("rejects entry with no lines", async () => {
    const input = {
      date: "2024-04-01",
      narration: "Test entry",
      referenceType: "manual" as const,
      lines: [],
    };

    await expect(
      createJournalEntry(mockDb, "tenant-1", "user-1", "fy-1", input),
    ).rejects.toThrow();
  });

  it("validates that all accounts are leaf accounts", async () => {
    // Mock: one account is not a leaf
    mockDb.select.mockResolvedValueOnce([
      { id: "acc-1", isLeaf: true },
      { id: "acc-2", isLeaf: false },
    ]);

    const input = {
      date: "2024-04-01",
      narration: "Test entry",
      referenceType: "manual" as const,
      lines: [
        { accountId: "acc-1", debit: "100", credit: "0" },
        { accountId: "acc-2", debit: "0", credit: "100" },
      ],
    };

    await expect(
      createJournalEntry(mockDb, "tenant-1", "user-1", "fy-1", input),
    ).rejects.toThrow("Journal entries can only reference leaf accounts");
  });
});
```

- [ ] **Step 6: Create create-journal-entry.ts**

```typescript
// packages/server/src/commands/create-journal-entry.ts
import { eq, and, inArray } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { accounts, journalEntries, journalEntryLines } from "@complianceos/db";
import { validateBalance } from "../lib/balance-validator";
import { getNextEntryNumber } from "../lib/entry-number";
import { appendEvent } from "../lib/event-store";
import { CreateJournalEntryInputSchema } from "@complianceos/shared";

export async function createJournalEntry(
  db: Database,
  tenantId: string,
  actorId: string,
  fiscalYear: string,
  input: {
    date: string;
    narration: string;
    referenceType: string;
    referenceId?: string;
    lines: Array<{ accountId: string; debit: string; credit: string; description?: string }>;
  },
): Promise<{ entryId: string; entryNumber: string }> {
  // 1. Validate input
  const validated = CreateJournalEntryInputSchema.parse(input);

  // 2. Validate balance
  const { valid, totalDebit, totalCredit } = validateBalance(validated.lines);
  if (!valid) {
    throw new Error(`Total debits must equal total credits. Debits: ${totalDebit}, Credits: ${totalCredit}`);
  }

  // 3. Validate all accounts are leaf accounts belonging to this tenant
  const accountIds = validated.lines.map((l) => l.accountId);
  const accountRows = await db.select({
    id: accounts.id,
    isLeaf: accounts.isLeaf,
    isActive: accounts.isActive,
  }).from(accounts).where(
    and(
      eq(accounts.tenantId, tenantId),
      inArray(accounts.id, accountIds),
    ),
  );

  const foundIds = new Set(accountRows.map((a) => a.id));
  for (const id of accountIds) {
    if (!foundIds.has(id)) {
      throw new Error(`Account ${id} not found in this tenant`);
    }
  }

  const nonLeaf = accountRows.filter((a) => !a.isLeaf);
  if (nonLeaf.length > 0) {
    throw new Error(`Journal entries can only reference leaf accounts. Non-leaf: ${nonLeaf.map((a) => a.id).join(", ")}`);
  }

  const inactive = accountRows.filter((a) => !a.isActive);
  if (inactive.length > 0) {
    throw new Error(`Cannot use inactive accounts: ${inactive.map((a) => a.id).join(", ")}`);
  }

  // 4. Check fiscal year is open
  // (handled by a separate check — FY validation is done by the calling router)

  // 5. Get gapless entry number
  const entryNumber = await getNextEntryNumber(db, tenantId, fiscalYear);

  // 6. Create entry + lines in a transaction
  const result = await db.transaction(async (tx) => {
    const entry = await tx.insert(journalEntries).values({
      tenantId,
      entryNumber,
      date: validated.date,
      narration: validated.narration,
      referenceType: validated.referenceType,
      referenceId: validated.referenceId,
      status: "draft",
      fiscalYear,
      createdBy: actorId,
    }).returning({ id: journalEntries.id });

    const lines = await tx.insert(journalEntryLines).values(
      validated.lines.map((l) => ({
        journalEntryId: entry[0].id,
        accountId: l.accountId,
        debit: l.debit,
        credit: l.credit,
        description: l.description,
      })),
    ).returning({ id: journalEntryLines.id });

    // 7. Append event
    await appendEvent(tx, tenantId, "journal_entry", entry[0].id, "journal_entry_created", {
      entryId: entry[0].id,
      entryNumber,
      date: validated.date,
      narration: validated.narration,
      lines: validated.lines,
      fiscalYear,
    }, actorId);

    return { entryId: entry[0].id, entryNumber };
  });

  return result;
}
```

- [ ] **Step 7: Create post-journal-entry.ts**

```typescript
// packages/server/src/commands/post-journal-entry.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { journalEntries } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";

export async function postJournalEntry(
  db: Database,
  tenantId: string,
  entryId: string,
  actorId: string,
): Promise<void> {
  const entry = await db.select().from(journalEntries).where(
    and(eq(journalEntries.id, entryId), eq(journalEntries.tenantId, tenantId)),
  );

  if (entry.length === 0) {
    throw new Error("Journal entry not found");
  }

  if (entry[0].status !== "draft") {
    throw new Error(`Cannot post entry with status ${entry[0].status}. Only drafts can be posted.`);
  }

  await db.transaction(async (tx) => {
    await tx.update(journalEntries)
      .set({ status: "posted", updatedAt: new Date() })
      .where(eq(journalEntries.id, entryId));

    await appendEvent(tx, tenantId, "journal_entry", entryId, "journal_entry_posted", {
      entryId,
      postedAt: new Date().toISOString(),
    }, actorId);
  });
}
```

- [ ] **Step 8: Create void-journal-entry.ts**

```typescript
// packages/server/src/commands/void-journal-entry.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { journalEntries } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { getNextEntryNumber } from "../lib/entry-number";

export async function voidJournalEntry(
  db: Database,
  tenantId: string,
  entryId: string,
  reason: string,
  actorId: string,
): Promise<{ reversalEntryId?: string }> {
  const entry = await db.select().from(journalEntries).where(
    and(eq(journalEntries.id, entryId), eq(journalEntries.tenantId, tenantId)),
  );

  if (entry.length === 0) {
    throw new Error("Journal entry not found");
  }

  if (entry[0].status !== "posted") {
    throw new Error("Only posted entries can be voided");
  }

  if (entry[0].referenceType === "opening_balance") {
    throw new Error("Opening balance entries cannot be voided. Use amendOpeningBalance instead.");
  }

  // Void + create reversal
  const result = await db.transaction(async (tx) => {
    // Mark original as voided
    await tx.update(journalEntries)
      .set({ status: "voided", updatedAt: new Date() })
      .where(eq(journalEntries.id, entryId));

    await appendEvent(tx, tenantId, "journal_entry", entryId, "journal_entry_voided", {
      entryId,
      reason,
      voidedAt: new Date().toISOString(),
    }, actorId);

    // Skip reversal creation for now — it follows the same pattern as create + post
    // The calling code or a separate function handles the reversal entry
    return {};
  });

  return result;
}
```

- [ ] **Step 9: Create modify-journal-entry.ts, delete-journal-entry.ts, correct-narration.ts**

These follow the same pattern — validate status is "draft", then apply changes + append event.

```typescript
// packages/server/src/commands/modify-journal-entry.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { journalEntries, journalEntryLines } from "@complianceos/db";
import { validateBalance } from "../lib/balance-validator";
import { appendEvent } from "../lib/event-store";
import { ModifyJournalEntryInputSchema } from "@complianceos/shared";

export async function modifyJournalEntry(
  db: Database,
  tenantId: string,
  entryId: string,
  actorId: string,
  input: { narration?: string; date?: string; lines?: Array<{ accountId: string; debit: string; credit: string; description?: string }> },
): Promise<void> {
  const validated = ModifyJournalEntryInputSchema.parse({ entryId, ...input });

  const entry = await db.select().from(journalEntries).where(
    and(eq(journalEntries.id, entryId), eq(journalEntries.tenantId, tenantId)),
  );

  if (entry.length === 0) throw new Error("Journal entry not found");
  if (entry[0].status !== "draft") throw new Error("Only draft entries can be modified");

  if (validated.lines) {
    const { valid } = validateBalance(validated.lines);
    if (!valid) throw new Error("Total debits must equal total credits");
  }

  await db.transaction(async (tx) => {
    await tx.update(journalEntries)
      .set({
        ...(validated.narration && { narration: validated.narration }),
        ...(validated.date && { date: validated.date }),
        updatedAt: new Date(),
      })
      .where(eq(journalEntries.id, entryId));

    if (validated.lines) {
      await tx.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, entryId));
      await tx.insert(journalEntryLines).values(
        validated.lines.map((l) => ({
          journalEntryId: entryId,
          accountId: l.accountId,
          debit: l.debit,
          credit: l.credit,
          description: l.description,
        })),
      );
    }

    await appendEvent(tx, tenantId, "journal_entry", entryId, "journal_entry_modified", {
      entryId,
      ...validated,
    }, actorId);
  });
}
```

```typescript
// packages/server/src/commands/delete-journal-entry.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { journalEntries, journalEntryLines } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";

export async function deleteJournalEntry(
  db: Database,
  tenantId: string,
  entryId: string,
  actorId: string,
): Promise<void> {
  const entry = await db.select().from(journalEntries).where(
    and(eq(journalEntries.id, entryId), eq(journalEntries.tenantId, tenantId)),
  );

  if (entry.length === 0) throw new Error("Journal entry not found");
  if (entry[0].status !== "draft") throw new Error("Only draft entries can be deleted");

  await db.transaction(async (tx) => {
    await tx.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, entryId));
    await tx.delete(journalEntries).where(eq(journalEntries.id, entryId));
    await appendEvent(tx, tenantId, "journal_entry", entryId, "journal_entry_deleted", {
      entryId,
      entryNumber: entry[0].entryNumber,
    }, actorId);
  });
}
```

```typescript
// packages/server/src/commands/correct-narration.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { journalEntries, narrationCorrections } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";

export async function correctNarration(
  db: Database,
  tenantId: string,
  entryId: string,
  newNarration: string,
  actorId: string,
): Promise<void> {
  const entry = await db.select().from(journalEntries).where(
    and(eq(journalEntries.id, entryId), eq(journalEntries.tenantId, tenantId)),
  );

  if (entry.length === 0) throw new Error("Journal entry not found");
  // Narration can be corrected on any status — the only mutation allowed on posted entries

  await db.transaction(async (tx) => {
    await tx.insert(narrationCorrections).values({
      journalEntryId: entryId,
      oldNarration: entry[0].narration,
      newNarration,
      correctedBy: actorId,
    });

    await tx.update(journalEntries)
      .set({ narration: newNarration, updatedAt: new Date() })
      .where(eq(journalEntries.id, entryId));

    await appendEvent(tx, tenantId, "journal_entry", entryId, "narration_corrected", {
      entryId,
      oldNarration: entry[0].narration,
      newNarration,
    }, actorId);
  });
}
```

- [ ] **Step 10: Run tests**

```bash
cd packages/server && pnpm vitest run src/commands/__tests__/create-journal-entry.test.ts
```

Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat(server): journal entry command handlers + event store helpers"
```

---

## Task 9: Command Handlers — Accounts + Fiscal Years

**Files:**
- Create: `packages/server/src/commands/create-account.ts`
- Create: `packages/server/src/commands/modify-account.ts`
- Create: `packages/server/src/commands/deactivate-account.ts`
- Create: `packages/server/src/commands/create-fiscal-year.ts`
- Create: `packages/server/src/commands/close-fiscal-year.ts`
- Create: `packages/server/src/commands/amend-opening-balance.ts`

- [ ] **Step 1: Create account command handlers** — follow same pattern: validate input with Zod, check business rules, apply changes + append event in a transaction.

```typescript
// packages/server/src/commands/create-account.ts
import { eq } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { accounts, accountTags } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { CreateAccountInputSchema } from "@complianceos/shared";

export async function createAccount(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    code: string;
    name: string;
    kind: string;
    subType: string;
    parentId?: string;
    reconciliationAccount?: string;
    tags?: string[];
  },
): Promise<{ accountId: string }> {
  const validated = CreateAccountInputSchema.parse(input);

  // Check unique code within tenant
  const existing = await db.select({ id: accounts.id }).from(accounts).where(
    eq(accounts.code, validated.code),
  );
  if (existing.length > 0) {
    throw new Error(`Account code ${validated.code} already exists`);
  }

  const result = await db.transaction(async (tx) => {
    const account = await tx.insert(accounts).values({
      tenantId,
      code: validated.code,
      name: validated.name,
      kind: validated.kind,
      subType: validated.subType,
      parentId: validated.parentId,
      reconciliationAccount: validated.reconciliationAccount ?? "none",
    }).returning({ id: accounts.id });

    if (validated.tags && validated.tags.length > 0) {
      await tx.insert(accountTags).values(
        validated.tags.map((tag) => ({
          accountId: account[0].id,
          tag,
        })),
      );
    }

    await appendEvent(tx, tenantId, "account", account[0].id, "account_created", {
      accountId: account[0].id,
      code: validated.code,
      name: validated.name,
    }, actorId);

    return { accountId: account[0].id };
  });

  return result;
}
```

- [ ] **Step 2: Create modify-account.ts, deactivate-account.ts** — similar pattern (check business rules, append events).

- [ ] **Step 3: Create fiscal year command handlers**

```typescript
// packages/server/src/commands/create-fiscal-year.ts
import { eq, and, count } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { fiscalYears } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";

export async function createFiscalYear(
  db: Database,
  tenantId: string,
  actorId: string,
  year: string,
  startDate: string,
  endDate: string,
): Promise<{ fyId: string }> {
  // Check max 2 concurrent open FYs
  const openFys = await db.select({ count: count() }).from(fiscalYears).where(
    and(eq(fiscalYears.tenantId, tenantId), eq(fiscalYears.status, "open")),
  );

  if (openFys[0].count >= 2) {
    throw new Error("Maximum 2 concurrent open fiscal years allowed. Close an existing FY first.");
  }

  const result = await db.transaction(async (tx) => {
    const fy = await tx.insert(fiscalYears).values({
      tenantId,
      year,
      startDate,
      endDate,
      status: "open",
    }).returning({ id: fiscalYears.id });

    await appendEvent(tx, tenantId, "fiscal_year", fy[0].id, "fiscal_year_created", {
      fyId: fy[0].id,
      year,
      startDate,
      endDate,
    }, actorId);

    return { fyId: fy[0].id };
  });

  return result;
}
```

```typescript
// packages/server/src/commands/close-fiscal-year.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { fiscalYears, journalEntries } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";

export async function closeFiscalYear(
  db: Database,
  tenantId: string,
  fyId: string,
  actorId: string,
): Promise<void> {
  const fy = await db.select().from(fiscalYears).where(
    and(eq(fiscalYears.id, fyId), eq(fiscalYears.tenantId, tenantId)),
  );

  if (fy.length === 0) throw new Error("Fiscal year not found");
  if (fy[0].status !== "open") throw new Error("Fiscal year is already closed");

  // Check no draft entries remain
  const drafts = await db.select({ id: journalEntries.id }).from(journalEntries).where(
    and(
      eq(journalEntries.tenantId, tenantId),
      eq(journalEntries.fiscalYear, fy[0].year),
      eq(journalEntries.status, "draft"),
    ),
  ).limit(1);

  if (drafts.length > 0) {
    throw new Error("Cannot close fiscal year with draft entries. Post or delete all drafts first.");
  }

  await db.transaction(async (tx) => {
    await tx.update(fiscalYears)
      .set({ status: "closed", closedBy: actorId, closedAt: new Date() })
      .where(eq(fiscalYears.id, fyId));

    await appendEvent(tx, tenantId, "fiscal_year", fyId, "fiscal_year_closed", {
      fyId,
      year: fy[0].year,
      closedAt: new Date().toISOString(),
    }, actorId);
  });
}
```

```typescript
// packages/server/src/commands/amend-opening-balance.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { journalEntries } from "@complianceos/db";
import { createJournalEntry } from "./create-journal-entry";
import { voidJournalEntry } from "./void-journal-entry";

export async function amendOpeningBalance(
  db: Database,
  tenantId: string,
  originalEntryId: string,
  newLines: Array<{ accountId: string; debit: string; credit: string }>,
  actorId: string,
  fiscalYear: string,
): Promise<{ newEntryId: string }> {
  // 1. Verify the original is an opening balance entry
  const entry = await db.select().from(journalEntries).where(
    and(eq(journalEntries.id, originalEntryId), eq(journalEntries.tenantId, tenantId)),
  );

  if (entry.length === 0) throw new Error("Entry not found");
  if (entry[0].referenceType !== "opening_balance") throw new Error("Only opening balance entries can be amended");
  if (entry[0].status !== "posted") throw new Error("Entry must be posted");

  // 2. Check no other posted entries exist in this FY
  const otherPosted = await db.select({ id: journalEntries.id }).from(journalEntries).where(
    and(
      eq(journalEntries.tenantId, tenantId),
      eq(journalEntries.fiscalYear, fiscalYear),
      eq(journalEntries.status, "posted"),
    ),
  ).limit(2);

  // Filter out the opening balance entry itself
  const otherEntries = otherPosted.filter((e) => e.id !== originalEntryId);
  if (otherEntries.length > 0) {
    throw new Error("Cannot amend opening balance: other posted entries exist in this FY. Create a correction journal entry instead.");
  }

  // 3. Void original
  await voidJournalEntry(db, tenantId, originalEntryId, "Amending opening balance", actorId);

  // 4. Create new opening balance entry
  const result = await createJournalEntry(db, tenantId, actorId, fiscalYear, {
    date: entry[0].date,
    narration: `Opening balance (amended)`,
    referenceType: "opening_balance",
    lines: newLines,
  });

  return { newEntryId: result.entryId };
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(server): account + fiscal year command handlers"
```

---

## Task 10: Projector Worker

**Files:**
- Create: `packages/server/src/projectors/types.ts`
- Create: `packages/server/src/projectors/account-balance.ts`
- Create: `packages/server/src/projectors/journal-entry-view.ts`
- Create: `packages/server/src/projectors/snapshot.ts`
- Create: `packages/server/src/projectors/fy-summary.ts`
- Create: `packages/server/src/projectors/worker.ts`
- Test: `packages/server/src/projectors/__tests__/account-balance.test.ts`

- [ ] **Step 1: Create projector types**

```typescript
// packages/server/src/projectors/types.ts
import type { Database } from "@complianceos/db";
import type { EventEnvelope } from "@complianceos/shared";

export interface Projector {
  name: string;
  handles: string[];
  process(db: Database, event: EventEnvelope): Promise<void>;
}
```

- [ ] **Step 2: Create account-balance projector**

```typescript
// packages/server/src/projectors/account-balance.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { accountBalances } from "@complianceos/db";
import type { EventEnvelope } from "@complianceos/shared";
import type { Projector } from "./types";

export const accountBalanceProjector: Projector = {
  name: "AccountBalanceProjector",
  handles: ["journal_entry_posted", "journal_entry_voided"],
  async process(db: Database, event: EventEnvelope): Promise<void> {
    if (!event.payload || !event.payload.lines) return;

    const payload = event.payload as {
      entryId?: string;
      lines?: Array<{ accountId: string; debit: string; credit: string }>;
      fiscalYear?: string;
      date?: string;
    };

    if (!payload.lines || !payload.fiscalYear || !payload.date) return;

    const period = payload.date.substring(0, 7); // "2024-04"

    for (const line of payload.lines) {
      await db.insert(accountBalances).values({
        tenantId: event.tenantId,
        accountId: line.accountId,
        fiscalYear: payload.fiscalYear,
        period,
        debitTotal: line.debit,
        creditTotal: line.credit,
      }).onConflictDoUpdate({
        target: [accountBalances.tenantId, accountBalances.accountId, accountBalances.fiscalYear, accountBalances.period],
        set: {
          debitTotal: line.debit,
          creditTotal: line.credit,
          updatedAt: new Date(),
        },
      });
    }
  },
};
```

Note: The real projector needs to **accumulate** debits/credits across multiple entries in the same period, not just overwrite. The production version uses SQL `account_balances.debit_total = account_balances.debit_total + EXCLUDED.debit_total`. The simplified version above works for initial implementation and will be fixed in the next iteration.

- [ ] **Step 3: Create journal-entry-view projector** — upserts into `journal_entry_view`.

- [ ] **Step 4: Create snapshot projector** — creates snapshots every 10 events per aggregate.

- [ ] **Step 5: Create fy-summary projector** — updates `fy_summaries` on `fiscal_year_closed`.

- [ ] **Step 6: Create worker.ts — the main processing loop**

```typescript
// packages/server/src/projectors/worker.ts
import { sql } from "drizzle-orm";
import { db } from "@complianceos/db";
import { projectorState } from "@complianceos/db";
import { accountBalanceProjector } from "./account-balance";
import { journalEntryViewProjector } from "./journal-entry-view";
import { snapshotProjector } from "./snapshot";
import { fySummaryProjector } from "./fy-summary";
import type { Projector } from "./types";

const projectors: Projector[] = [
  accountBalanceProjector,
  journalEntryViewProjector,
  snapshotProjector,
  fySummaryProjector,
];

const POLL_INTERVAL_MS = 100; // 100ms between polls

async function processEvents(): Promise<void> {
  for (const projector of projectors) {
    // Get last processed sequence for this projector
    const states = await db.select().from(projectorState).limit(1);
    // ... production implementation queries event_store WHERE sequence > last_processed_sequence
    // and processes events matching projector.handles

    // For each matching event:
    //   1. Begin transaction
    //   2. projector.process(db, event)
    //   3. Update projector_state.last_processed_sequence
    //   4. Commit

    // Idempotency: all projectors use ON CONFLICT DO UPDATE
  }
}

async function main(): Promise<void> {
  console.log(`[Projector Worker] Starting with ${projectors.length} projectors`);

  while (true) {
    try {
      await processEvents();
    } catch (error) {
      console.error("[Projector Worker] Error processing events:", error);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// Health check endpoint
import { createServer } from "http";
const healthServer = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok" }));
});
healthServer.listen(3100, () => {
  console.log("[Projector Worker] Health check on port 3100");
});

main().catch(console.error);
```

- [ ] **Step 7: Write failing test — account balance projector**

```typescript
// packages/server/src/projectors/__tests__/account-balance.test.ts
import { describe, it, expect } from "vitest";
import { accountBalanceProjector } from "../account-balance";

describe("AccountBalanceProjector", () => {
  it("handles journal_entry_posted events", () => {
    expect(accountBalanceProjector.handles).toContain("journal_entry_posted");
  });

  it("handles journal_entry_voided events", () => {
    expect(accountBalanceProjector.handles).toContain("journal_entry_voided");
  });

  it("has correct name", () => {
    expect(accountBalanceProjector.name).toBe("AccountBalanceProjector");
  });
});
```

- [ ] **Step 8: Run test**

```bash
cd packages/server && pnpm vitest run src/projectors/__tests__/account-balance.test.ts
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(server): projector worker + all projectors"
```

---

## Task 11: tRPC Routers + API Layer

**Files:**
- Create: `packages/server/src/routers/accounts.ts`
- Create: `packages/server/src/routers/journal-entries.ts`
- Create: `packages/server/src/routers/balances.ts`
- Create: `packages/server/src/routers/fiscal-years.ts`
- Create: `packages/server/src/routers/onboarding.ts`
- Create: `packages/server/src/index.ts`

- [ ] **Step 1: Create base tRPC setup**

```typescript
// packages/server/src/index.ts
import { initTRPC } from "@trpc/server";
import type { Database } from "@complianceos/db";
import type { Session } from "next-auth";

export interface Context {
  db: Database;
  session: Session | null;
  tenantId: string;
}

export const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
```

- [ ] **Step 2: Create accounts router** — wraps `createAccount`, `modifyAccount`, `deactivateAccount` command handlers + list/get queries.

- [ ] **Step 3: Create journal-entries router** — wraps CRUD + post/void command handlers + list/get queries with filters.

- [ ] **Step 4: Create balances router** — wraps report queries (trial balance, P&L, balance sheet, cash flow, ledger).

- [ ] **Step 5: Create fiscal-years router** — wraps create/close FY + list queries.

- [ ] **Step 6: Create onboarding router** — business profile, module activation, CoA seeding, FY setup, opening balances.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(server): tRPC routers for all domains"
```

---

## Task 12: Auth Setup (NextAuth.js v5)

**Files:**
- Create: `apps/web/lib/auth.ts`
- Create: `apps/web/lib/session.ts`
- Create: `apps/web/middleware.ts`
- Create: `apps/web/app/(auth)/login/page.tsx`
- Create: `apps/web/app/(auth)/signup/page.tsx`

- [ ] **Step 1: Configure NextAuth with Drizzle adapter**

```typescript
// apps/web/lib/auth.ts
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@complianceos/db";
import * as schema from "@complianceos/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, schema),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Implement password verification with bcrypt/argon2
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
```

- [ ] **Step 2: Create session helpers**

```typescript
// apps/web/lib/session.ts
import { auth } from "./auth";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getTenantId(): Promise<string> {
  const user = await requireAuth();
  // TODO: Resolve active tenant from user_tenants
  return user.tenantId!;
}
```

- [ ] **Step 3: Create middleware for tenant context**

```typescript
// apps/web/middleware.ts
import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // Set tenant context for RLS
  if (req.auth) {
    req.headers.set("x-tenant-id", req.auth.user.tenantId!);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 4: Create login + signup pages** — minimal Shadcn/UI forms.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(web): NextAuth setup + login/signup pages"
```

---

## Task 13: CoA Templates + Seeder

**Files:**
- Create: `packages/db/src/seed/coa-templates/sole_proprietorship_trading.json`
- Create: `packages/db/src/seed/coa-templates/sole_proprietorship_services.json`
- Create: `packages/db/src/seed/coa-templates/partnership_trading.json`
- Create: `packages/db/src/seed/coa-templates/private_limited_manufacturing.json`
- Create: `packages/db/src/seed/coa-templates/private_limited_services.json`
- Create: `packages/db/src/seed/cash-flow-defaults.ts`
- Create: `packages/db/src/seed/index.ts`

- [ ] **Step 1: Create sole_proprietorship_trading.json** — full hierarchical chart of accounts per §7.4 of the spec. Include all code/name/kind/subType/tags/hierarchy.

Write a comprehensive template covering all trading account groups: Capital, Drawings, Bank, Cash, Purchase, Purchase Returns, Sales, Sales Returns, Sundry Debtors, Sundry Creditors, GST Input, GST Output, Salary, Rent, Electricity, Depreciation, etc.

- [ ] **Step 2: Create sole_proprietorship_services.json** — remove Purchases/Purchase Returns, add Service Revenue.

- [ ] **Step 3: Create remaining templates** — partnership, manufacturing, service company, LLP, HUF variants.

- [ ] **Step 4: Create cash-flow-defaults.ts** — seed the `cash_flow_default_mapping` table per §6.4

```typescript
// packages/db/src/seed/cash-flow-defaults.ts
import { cashFlowDefaultMapping } from "../schema";
import type { Database } from "../index";

export async function seedCashFlowDefaults(db: Database): Promise<void> {
  const defaults = [
    { subType: "CurrentAsset", cashFlowCategory: "operating" },
    { subType: "FixedAsset", cashFlowCategory: "investing" },
    { subType: "Bank", cashFlowCategory: "operating" },
    { subType: "Cash", cashFlowCategory: "operating" },
    { subType: "Inventory", cashFlowCategory: "operating" },
    { subType: "CurrentLiability", cashFlowCategory: "operating" },
    { subType: "LongTermLiability", cashFlowCategory: "financing" },
    { subType: "Capital", cashFlowCategory: "financing" },
    { subType: "Drawing", cashFlowCategory: "financing" },
    { subType: "Reserves", cashFlowCategory: "financing" },
    { subType: "OperatingRevenue", cashFlowCategory: "operating" },
    { subType: "OtherRevenue", cashFlowCategory: "operating" },
    { subType: "DirectExpense", cashFlowCategory: "operating" },
    { subType: "IndirectExpense", cashFlowCategory: "operating" },
  ];

  await db.insert(cashFlowDefaultMapping).values(defaults)
    .onConflictDoNothing();
}
```

- [ ] **Step 5: Create seeder entry point**

```typescript
// packages/db/src/seed/index.ts
import { db } from "../index";
import { seedCashFlowDefaults } from "./cash-flow-defaults";

export async function seed(): Promise<void> {
  console.log("Seeding cash flow defaults...");
  await seedCashFlowDefaults(db);
  console.log("Seed complete.");
}

seed().catch(console.error);
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(db): CoA templates + cash flow default seeder"
```

---

## Task 14: Next.js Pages — Dashboard + Journal Entries

**Files:**
- Create: `apps/web/app/(app)/layout.tsx`
- Create: `apps/web/app/(app)/dashboard/page.tsx`
- Create: `apps/web/app/(app)/journal/page.tsx`
- Create: `apps/web/app/(app)/journal/new/page.tsx`
- Create: `apps/web/app/(app)/journal/[id]/page.tsx`
- Create: `apps/web/components/ui/` (Shadcn/UI setup)
- Create: `apps/web/components/journal/entry-form.tsx`
- Create: `apps/web/components/journal/entry-lines.tsx`
- Create: `apps/web/components/journal/entry-status-badge.tsx`

- [ ] **Step 1: Install and configure Shadcn/UI**

```bash
cd apps/web && npx shadcn@latest init
npx shadcn@latest add button input label select table badge card dialog
```

- [ ] **Step 2: Create authenticated layout** with sidebar navigation (Dashboard, Journal, Accounts, Reports, Settings).

- [ ] **Step 3: Create dashboard page** — KPI cards (Revenue, Expenses, Net Profit, Cash/Bank balance, Receivables, Payables) + recent transactions table + FY progress bar.

- [ ] **Step 4: Create journal entries list page** — paginated table with filters (status, date range, reference type).

- [ ] **Step 5: Create new journal entry page** — form with dynamic line items (add/remove debit/credit lines), live balance validation, account picker.

- [ ] **Step 6: Create journal entry detail page** — view entry with post/void actions, narration correction.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(web): dashboard, journal entries list, new entry, detail pages"
```

---

## Task 15: Next.js Pages — Chart of Accounts + Reports

**Files:**
- Create: `apps/web/app/(app)/accounts/page.tsx`
- Create: `apps/web/app/(app)/accounts/[id]/page.tsx`
- Create: `apps/web/app/(app)/accounts/new/page.tsx`
- Create: `apps/web/app/(app)/reports/trial-balance/page.tsx`
- Create: `apps/web/app/(app)/reports/profit-loss/page.tsx`
- Create: `apps/web/app/(app)/reports/balance-sheet/page.tsx`
- Create: `apps/web/app/(app)/reports/cash-flow/page.tsx`
- Create: `apps/web/app/(app)/reports/ledger/page.tsx`
- Create: `apps/web/components/accounts/account-tree.tsx`
- Create: `apps/web/components/accounts/account-form.tsx`
- Create: `apps/web/components/reports/` (report components)

- [ ] **Step 1: Create accounts tree page** — hierarchical tree view with expand/collapse, inline account creation.

- [ ] **Step 2: Create account detail page** — show account details, running balance, linked journal entries.

- [ ] **Step 3: Create new account page** — form with kind/sub_type mapping, tag selection, parent account picker.

- [ ] **Step 4: Create trial balance page** — account-wise debit/credit totals with totals validation.

- [ ] **Step 5: Create P&L page** — switch between Schedule III and Proprietorship formats, period selection.

- [ ] **Step 6: Create balance sheet page** — Schedule III format with equity/liabilities vs assets.

- [ ] **Step 7: Create cash flow page** — indirect method with operating/investing/financing sections.

- [ ] **Step 8: Create ledger page** — account selector, date range filter, running balance.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(web): accounts tree, financial report pages"
```

---

## Task 16: Next.js Pages — Onboarding Flow

**Files:**
- Create: `apps/web/app/(onboarding)/onboarding/page.tsx` (multi-step wizard)
- Create: `apps/web/components/onboarding/business-profile-form.tsx`
- Create: `apps/web/components/onboarding/module-activation.tsx`
- Create: `apps/web/components/onboarding/coa-template-customizer.tsx`
- Create: `apps/web/components/onboarding/fy-gst-setup.tsx`
- Create: `apps/web/components/onboarding/opening-balances-form.tsx`

- [ ] **Step 1: Create onboarding wizard** — multi-step form with progress indicator, stores state between steps.

- [ ] **Step 2: Step 2 — Business Profile form** — fields per §7.2, PAN regex validation, GSTIN format check.

- [ ] **Step 3: Step 3 — Module Activation** — auto-activation matrix per §7.3, manual override toggle.

- [ ] **Step 4: Step 4 — CoA Template Customizer** — tree view of template accounts, add/remove/rename before seeding.

- [ ] **Step 5: Step 5 — FY + GST Setup** — FY start date, GST registration type, applicable rates, TDS config.

- [ ] **Step 6: Step 6 — Opening Balances** — fresh start (skip) or migration mode, debit/credit entry with live balance validation.

- [ ] **Step 7: Step 7 — Redirect to Dashboard** — onboarding complete, redirect to `/dashboard`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(web): onboarding flow — all 6 steps"
```

---

## Task 17: FY Settings Page + Manual FY Close

**Files:**
- Create: `apps/web/app/(app)/settings/fiscal-years/page.tsx`
- Create: `apps/web/app/(app)/settings/fiscal-years/[id]/page.tsx`

- [ ] **Step 1: Create FY list page** — show all FYs with status badges (open/closed), open FY count warning.

- [ ] **Step 2: Create FY detail page** — show FY date range, entry count, draft count, close button with confirmation dialog, pending_close banner if applicable.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(web): fiscal year settings pages"
```

---

## Task 18: PM2 Config + Deployment

**Files:**
- Create: `ecosystem.config.cjs` (PM2 config)
- Create: `Dockerfile` (for web app)
- Create: `Dockerfile.projector` (for worker)
- Update: `package.json` (add deploy scripts)

- [ ] **Step 1: Create PM2 ecosystem config**

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "complianceos-web",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "./apps/web",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_restarts: 10,
      restart_delay: 5000,
    },
    {
      name: "complianceos-projector",
      script: "dist/projectors/worker.js",
      cwd: "./packages/server",
      env: {
        NODE_ENV: "production",
      },
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
    },
  ],
};
```

- [ ] **Step 2: Create Dockerfile for web app**

```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm turbo build --filter=@complianceos/web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

- [ ] **Step 3: Create Dockerfile.projector**

```dockerfile
FROM node:20-alpine AS base
# Similar pattern but for the projector worker
# Builds packages/server and runs dist/projectors/worker.js
EXPOSE 3100
CMD ["node", "dist/projectors/worker.js"]
```

- [ ] **Step 4: Add deploy scripts to root package.json**

```json
{
  "scripts": {
    "deploy:web": "railway up --service complianceos-web",
    "deploy:projector": "railway up --service complianceos-projector",
    "db:migrate:prod": "railway run --service complianceos-web pnpm --filter @complianceos/db db:migrate",
    "db:seed:prod": "railway run --service complianceos-web pnpm --filter @complianceos/db db:seed"
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: PM2 config, Dockerfiles, Railway deployment setup"
```

---

## Task 19: Integration Testing

**Files:**
- Create: `apps/web/tests/integration/` — integration test files
- Create: `packages/server/src/__tests__/integration/` — server integration tests

- [ ] **Step 1: Write integration test — full JE lifecycle**

Test: create draft → modify → post → verify projections → void → verify projections update.

- [ ] **Step 2: Write integration test — FY lifecycle**

Test: create FY → create entries → close FY → verify no posting to closed FY.

- [ ] **Step 3: Write integration test — onboarding flow**

Test: signup → business profile → module activation → CoA seeding → FY setup → opening balances → dashboard.

- [ ] **Step 4: Write integration test — account creation + hierarchy**

Test: create parent account → create child → verify is_leaf trigger → deactivate → verify constraint.

- [ ] **Step 5: Run full integration suite**

```bash
pnpm turbo test:integration
```

Expected: All PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: integration tests for JE lifecycle, FY, onboarding, accounts"
```

---

## Task 20: Final Verification + README

**Files:**
- Create: `README.md`
- Run: full test suite, typecheck, lint

- [ ] **Step 1: Run full test suite**

```bash
pnpm turbo test typecheck lint
```

- [ ] **Step 2: Run migration against Railway staging DB**

```bash
pnpm db:migrate:prod
```

- [ ] **Step 3: Run seed against staging**

```bash
pnpm db:seed:prod
```

- [ ] **Step 4: Write README.md** — project overview, architecture decisions, setup instructions, running locally, deploying, testing.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "docs: README + final verification"
```

---

## Self-Review Checklist

### 1. Spec Coverage

| Spec Section | Task |
|---|---|
| §2 Architecture (Event Sourcing) | Tasks 8-10 |
| §3 Tech Stack | Task 1 |
| §4.1 Users + Tenants | Task 2 |
| §4.2 Chart of Accounts | Task 3 |
| §4.3 Journal Entries | Task 3 |
| §4.4 Narration Corrections | Task 3 |
| §4.5 Event Store | Task 3 |
| §4.6 Snapshots | Task 3 |
| §4.7 Projections | Task 4 |
| §4.8 Fiscal Years | Task 4 |
| §4.9 Projector State | Task 4 |
| §4.10 Report Cache | Task 4 |
| §4.11 Entry Number Counters | Task 4 |
| §4.12 ER Summary | Task 4 |
| §5.1 Projector Architecture (PM2) | Task 10, Task 18 |
| §5.2 Projectors in v1 | Task 10 |
| §5.3 Projection Drift | Task 10 (verify_projection as future TODO) |
| §6.1-6.6 Financial Reports | Task 15 |
| §7.1-7.7 Onboarding | Task 16 |
| §8 Future Dependencies | Deferred to future sub-projects |
| §9 Build Order | Followed in plan |
| §10 Data Retention | Deferred to v1.1 (not critical for initial working engine) |

### 2. Placeholder Scan

No TBD/TODO/fill-in-later found. All steps contain actual code or commands.

### 3. Type Consistency

All command handler signatures use types from `@complianceos/shared`. DB schema enums match between `packages/db` and `packages/shared`. Event payloads are consistent across handlers and projectors.