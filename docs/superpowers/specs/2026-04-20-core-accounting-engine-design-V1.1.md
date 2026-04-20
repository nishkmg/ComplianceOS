# ComplianceOS — Core Accounting Engine Design

**Sub-project:** #1 of 8 (Core Accounting Engine)
**Date:** 2026-04-20
**Status:** V1.2 — All 5 remaining issues fixed

---

## 1. Product Overview

### 1.1 What Is ComplianceOS

ComplianceOS is a full-stack business management platform for Indian businesses — an alternative to LedgerX that covers everything from accounting to GST/ITR generation without automated GSP filing. It serves sole proprietors through mid-size companies across all business types: trading, manufacturing, services, and regulated professions.

### 1.2 Scope Decomposition

The full platform is decomposed into 8 sub-projects, built and shipped sequentially:

1. **Core Accounting Engine** (this spec)
2. **Onboarding + Business Setup**
3. **Invoicing + Receivables**
4. **OCR Scan (Image → Ledger)**
5. **Inventory + Warehousing**
6. **Payroll**
7. **GST Returns Generation**
8. **ITR Generation**

Each sub-project has its own spec → plan → implementation cycle.

### 1.3 Core Accounting Engine Scope

The accounting engine is the foundation every other module builds on. It provides:

- Double-entry ledger with event sourcing
- Chart of accounts (hierarchical, template-driven)
- Journal entries (draft/posted/voided lifecycle)
- Financial statements (P&L, Balance Sheet, Cash Flow, Trial Balance)
- Fiscal year management (Indian FY: Apr–Mar)
- Multi-tenant architecture (SaaS)
- Standard cloud-hosted encryption (at-rest + in-transit)

### 1.4 Target Users

All business sizes from day 1, adapted via onboarding:
- Solo proprietors/freelancers
- Small businesses (1–10 people)
- Growing businesses (10–50 people)

v1 is single-user per business. Multi-user RBAC is a future extension enabled by the tenant model.

### 1.5 Platform

- **Primary:** Web app (Next.js)
- **Companion:** React Native mobile app (future — for receipt scanning, quick approvals)
- **India-only** — no multi-country support planned

### 1.6 Business Model

Freemium SaaS. Pricing details deferred.

---

## 2. Architecture

### 2.1 Approach: Event Sourcing with Projections

Every state change is recorded as an immutable event. Current state is derived by projecting events into read-optimized tables. Snapshots prevent unbounded replay.

**Why event sourcing:**
- Full audit trail by design — regulatory requirement for Indian financial software
- Correct by construction — can't have unbalanced books
- Every transaction traceable — essential for GST audits and income tax scrutiny
- Extensible — future modules just emit events into the same store
- Historical state reconstruction — "what was our cash balance on Oct 3rd?" is answerable

**Why not full CQRS:**
- Two databases to manage and sync is over-engineering for v1 scale
- Consistency lag between write/read models adds UX complexity
- YAGNI until real scale problems emerge

### 2.2 Event Flow

```
User Action → Command Handler (validate + decide) → Event Store (append)
                                                         ↓
                                                    Projectors (async)
                                                         ↓
                                              Read Models (projections)
                                                         ↓
                                                    Snapshots (periodic)
```

### 2.3 Mutability Model

Financial data demands immutability for posted entries. The system enforces a strict mutability boundary:

| Entity State | Create | Edit | Delete | Event Log Impact |
|---|---|---|---|---|
| Account (active) | Yes | Yes (rename, reclassify) | No — deactivate only | `account_modified` event appended |
| Account (system) | Yes (seeded) | Name only | Never | `account_modified` event appended |
| Journal Entry (draft) | Yes | Yes — any field | Yes — hard delete allowed | `journal_entry_created`, `journal_entry_modified`, `journal_entry_deleted` |
| Journal Entry (posted) | Yes | **Never** — void + re-enter | **Never** — void only | `journal_entry_posted`, `journal_entry_voided` |
| Journal Entry (voided) | N/A | Never | Never | Immutable terminal state |
| Fiscal Year (open) | Yes | Close it | Never | `fiscal_year_closed` event |
| Fiscal Year (closed) | N/A | Never | Never | No entries can be posted to closed FY |

### 2.4 Enforced Rules

| Invariant | Enforced At |
|---|---|
| Debits = Credits | Zod schema (client) + Command handler (server) + DB check constraint (last resort) |
| No posting to closed FY | Command handler checks FY status |
| No editing posted entries | Command handler checks `status = 'draft'` |
| Leaf accounts only in JE lines | Command handler checks `is_leaf = true` on account |
| No deactivating accounts with pending entries | Command handler checks for draft entries referencing the account |
| Max 2 concurrent open FYs | Command handler checks count of open FYs for tenant |
| Sequential entry numbers | `entry_number_counters` table with `FOR UPDATE` lock, gapless |

---

## 3. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 15 (App Router) + React 19 + Tailwind + Shadcn/UI | SSR, App Router layouts, accessible components |
| API | tRPC v11 | End-to-end type safety, no codegen |
| ORM | Drizzle ORM | Lightweight, SQL-like, performant for complex queries |
| Database | PostgreSQL 16 | ACID, RLS for multi-tenancy, jsonb for events |
| Cache | Redis 7 | Sessions, rate limiting, projection caching |
| Auth | NextAuth.js v5 | Built-in Next.js integration, OAuth + credentials |
| Queue | PostgreSQL `SKIP LOCKED` | No external broker at v1 scale |
| Monitoring | OpenTelemetry + Grafana | Structured logging, trace correlation, metrics from day 1 |
| Rust Microservice | Axum + Tokio | Future OCR pipeline — stub only in v1 |

### 3.1 Monorepo Structure

```
apps/
  web/                  # Next.js 15 (frontend + tRPC server)
  mobile/               # React Native (future — not in v1)
packages/
  db/                   # Drizzle schema, migrations, seed scripts
  server/               # tRPC routers, command handlers, projectors
  shared/               # Shared types, constants, validation schemas
  ocr-service/          # Rust microservice (future — stub only)
config/                 # ESLint, TSConfig, Tailwind config
```

### 3.2 API Architecture

**tRPC** for CRUD + complex queries (type-safe procedures with Zod validation).
**Server Actions** for mutations that trigger the command layer (form entry points, optimistic UI).

**tRPC Router Structure:**

```
router:
  accounting:
    accounts:
      .list()                  # GET accounts tree
      .get(id)                 # GET single account
      .create()                # POST create account
      .modify()                # PATCH modify account
      .deactivate()            # POST deactivate account
    journalEntries:
      .list(filters)           # GET paginated entries
      .get(id)                 # GET single entry with lines
      .create()                # POST create draft entry
      .modify()                # PATCH modify draft entry
      .post()                  # POST post draft entry
      .void()                  # POST void posted entry
      .delete()                # DELETE draft entry
    balances:
      .get(accountId, period)  # GET balance for account
      .trialBalance(fy)        # GET trial balance
      .pAndL(fy, from, to)     # GET P&L statement
      .balanceSheet(fy, asOf)  # GET Balance Sheet
      .cashFlow(fy, from, to)  # GET Cash Flow
    fiscalYears:
      .list()                  # GET all FYs
      .current()               # GET current open FY
      .close()                 # POST close FY
```

### 3.3 Command Handler Pattern

Every mutation flows through a command handler:

1. Parse + validate input (Zod)
2. Load aggregate state (from snapshot + replay recent events)
3. Check business rules (status checks, balance validation, FY open)
4. If valid → construct event payload, append to `event_store`
5. Return result (success with event, or error with reason)
6. Projector picks up the event async and updates projections

### 3.4 Row-Level Security (Multi-Tenancy)

Every table has `tenant_id`. PostgreSQL RLS policies ensure:

- Every SELECT scoped to current tenant
- Every INSERT/UPDATE sets `tenant_id`
- No cross-tenant data leakage

```sql
CREATE POLICY tenant_isolation ON journal_entries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

`app.tenant_id` is set at the start of every request via Next.js middleware.

### 3.5 Authentication Flow

1. User signs up → NextAuth creates `users` record
2. User creates business (tenant) → `tenants` record created, user assigned as owner
3. Login → NextAuth issues session token (JWT)
4. Every request → middleware extracts user from token, resolves active tenant, sets `app.tenant_id`
5. All DB queries automatically scoped to that tenant

v1 is single-user per business. Adding multi-user RBAC later requires only a `user_tenants` join table with a role column — no schema rework.

---

## 4. Data Model

### 4.1 Users + Tenants

```sql
users (
  id          UUID PK,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
)

tenants (
  id              UUID PK,
  name            TEXT NOT NULL,          -- Business display name
  legal_name      TEXT,                   -- If different from trading name
  business_type   ENUM(                   -- Legal structure
                    'sole_proprietorship',
                    'partnership',
                    'llp',
                    'private_limited',
                    'public_limited',
                    'huf'
                  ),
  pan             TEXT NOT NULL,          -- Validated: AAAAA9999A
  gstin           TEXT,                   -- 15-digit, conditional
  address         TEXT NOT NULL,
  state           ENUM(28_states + 8_uts),
  industry        ENUM(                   -- Drives module activation
                    'retail_trading',
                    'manufacturing',
                    'services_professional',
                    'freelancer_consultant',
                    'regulated_professional'
                  ),
  gst_registration ENUM('regular', 'composition', 'none'),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
)

user_tenants (
  id          UUID PK,
  user_id     UUID FK → users,
  tenant_id   UUID FK → tenants,
  role        ENUM('owner', 'accountant', 'manager', 'employee'),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tenant_id)
)

tenant_module_config (
  id          UUID PK,
  tenant_id   UUID FK → tenants,
  module      ENUM('accounting', 'invoicing', 'inventory', 'payroll', 'gst', 'ocr', 'itr'),
  enabled     BOOLEAN NOT NULL,
  config      JSONB DEFAULT '{}',         -- Module-specific config
  set_by      ENUM('auto', 'manual'),
  UNIQUE(tenant_id, module)
)
```

### 4.2 Chart of Accounts

```sql
accounts (
  id                      UUID PK,
  tenant_id               UUID NOT NULL,
  code                    TEXT NOT NULL,           -- User-visible "1000"
  name                    TEXT NOT NULL,
  kind                    ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense'),
  sub_type                ENUM(
                            'CurrentAsset', 'FixedAsset', 'Bank', 'Cash', 'Inventory',
                            'CurrentLiability', 'LongTermLiability',
                            'Capital', 'Drawing', 'Reserves',
                            'OperatingRevenue', 'OtherRevenue',
                            'DirectExpense', 'IndirectExpense'
                          ),
  parent_id               UUID FK → accounts,      -- Nullable for root
  is_system               BOOLEAN DEFAULT false,
  is_active               BOOLEAN DEFAULT true,
  is_leaf                 BOOLEAN NOT NULL DEFAULT true,
  reconciliation_account  ENUM('bank', 'none') DEFAULT 'none',
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, code)
)

account_tags (
  id          UUID PK,
  account_id  UUID FK → accounts,
  tag         ENUM(
                'trade_receivable', 'trade_payable',
                'gst', 'tds', 'tds_payable',
                'finance_cost', 'depreciation', 'tax',
                'employee_benefits', 'manufacturing',
                'inventory_adjustment', 'trading', 'returns',
                'opening_balance'
              ),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, tag)
)

cash_flow_default_mapping (
  id UUID PK,
  sub_type ENUM (same as accounts.sub_type) NOT NULL,
  cash_flow_category ENUM('operating', 'investing', 'financing') NOT NULL,
  UNIQUE(sub_type)
)

account_cash_flow_overrides (
  id UUID PK,
  tenant_id UUID NOT NULL,
  account_id UUID FK → accounts,
  cash_flow_category ENUM('operating', 'investing', 'financing') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, account_id)
)
```

**Hierarchy rules:**
- Max depth: 4 levels (Group → Sub-group → Account → Sub-account)
- Leaf nodes only can receive journal entries (enforced by command handler)
- `is_leaf` is maintained via triggers: when an account is created with `parent_id`, the parent's `is_leaf` is set to `false`. When all children of an account are removed, the parent's `is_leaf` is set back to `true`. An index on `(tenant_id, is_leaf)` ensures fast lookup.
- Group accounts show aggregated balances (sum of children)
- Indian convention: assets/liabilities = balance sheet, revenue/expense = P&L

### 4.3 Journal Entries

```sql
journal_entries (
  id              UUID PK,
  tenant_id       UUID NOT NULL,
  entry_number    TEXT NOT NULL,            -- "JE-2024-001" gapless per FY
  date            DATE NOT NULL,
  narration       TEXT NOT NULL,
  reference_type  ENUM('invoice', 'payment', 'receipt', 'journal',
                       'payroll', 'inventory', 'opening_balance', 'manual'),
  reference_id    UUID,                     -- FK to source document
  status          ENUM('draft', 'posted', 'voided'),
  fiscal_year     TEXT NOT NULL,            -- "2024-25"
  reversal_of     UUID FK → journal_entries, -- If this reverses another
  created_by      UUID FK → users,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, entry_number)
)

journal_entry_lines (
  id                  UUID PK,
  journal_entry_id    UUID FK → journal_entries,
  account_id          UUID FK → accounts,    -- Must be leaf
  debit               NUMERIC(18,2) DEFAULT 0,
  credit              NUMERIC(18,2) DEFAULT 0,
  description         TEXT,
  CHECK (debit >= 0 AND credit >= 0),
  CHECK (debit = 0 OR credit = 0),           -- A line is debit XOR credit
  CHECK (NOT (debit = 0 AND credit = 0))     -- A line must have an amount
)

-- Balance constraint on journal entries:
-- SUM(lines.debit) = SUM(lines.credit) for every entry
-- Enforced via DB trigger on INSERT/UPDATE/DELETE of lines

-- Note on NUMERIC(18,2): All monetary amounts use NUMERIC(18,2).
-- 18 total digits, 2 decimal places (max ₹99,99,99,99,99,99,999.99).
-- Indian GST requires amounts to 2 decimal places — this precision
-- is sufficient and fixed. Do not change to higher precision
-- without understanding the GST rounding implications.
```

### 4.4 Narration Corrections

Separate table — does not mutate the journal entry row itself:

```sql
narration_corrections (
  id                UUID PK,
  journal_entry_id  UUID FK → journal_entries,
  old_narration     TEXT NOT NULL,
  new_narration     TEXT NOT NULL,
  corrected_by      UUID FK → users,
  corrected_at      TIMESTAMPTZ DEFAULT now()
)
```

UI shows corrected narration with a "corrected" badge and expandable history.

### 4.5 Event Store

```sql
event_store (
  id              UUID PK,
  tenant_id       UUID NOT NULL,
  aggregate_type  ENUM('journal_entry', 'account', 'fiscal_year'),
  aggregate_id    UUID NOT NULL,
  event_type      ENUM(
                    -- Draft lifecycle (mutable phase)
                    'journal_entry_created',
                    'journal_entry_modified',
                    'journal_entry_deleted',
                    -- Posted lifecycle (immutable phase)
                    'journal_entry_posted',
                    'journal_entry_voided',
                    'journal_entry_reversed',
                    -- Account lifecycle
                    'account_created',
                    'account_modified',
                    'account_deactivated',
                    -- Fiscal year lifecycle
                    'fiscal_year_created',
                    'fiscal_year_closed',
                    -- Metadata-only corrections
                    'narration_corrected'
                  ),
  payload         JSONB NOT NULL,           -- Full snapshot of the change
  sequence        BIGINT NOT NULL,           -- Monotonically increasing per aggregate
  actor_id        UUID FK → users,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(aggregate_id, sequence)             -- Optimistic concurrency
)
```

**Properties:**
- Append-only — events are never updated or deleted
- `sequence` per aggregate guarantees ordering and concurrent-write safety
- Current state = projection of all events for an aggregate
- Optimistic concurrency: command handler reads current `sequence`, writes with `sequence + 1`. If another write happened in between, insert fails and command retries.

### 4.6 Snapshots

```sql
snapshots (
  id              UUID PK,
  tenant_id       UUID NOT NULL,
  aggregate_type  ENUM (same as event_store),
  aggregate_id    UUID NOT NULL,
  sequence        BIGINT NOT NULL,           -- Snapshot taken AFTER this sequence
  state           JSONB NOT NULL,            -- Full current state at this sequence
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(aggregate_id, sequence)
)
```

Note: `tenant_id` is required for row-level security. Without it, RLS policies cannot scope snapshots to tenants, creating a data isolation gap.

**Replay rule:** Load latest snapshot, then replay only events with `sequence > snapshot.sequence`.

**Snapshot triggers:**
- Every 10 events per aggregate (configurable)
- After fiscal year close (mandatory)
- On-demand (admin action if projection drifts)

### 4.7 Projections (Read Models)

```sql
account_balances (
  id                UUID PK,
  tenant_id         UUID NOT NULL,
  account_id        UUID FK → accounts,
  fiscal_year       TEXT NOT NULL,            -- "2024-25"
  period            TEXT NOT NULL,            -- "2024-04" (month granularity)
  opening_balance   NUMERIC(18,2) DEFAULT 0,
  debit_total       NUMERIC(18,2) DEFAULT 0,
  credit_total      NUMERIC(18,2) DEFAULT 0,
  closing_balance   NUMERIC(18,2) DEFAULT 0,
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, account_id, fiscal_year, period)
)
```

**Closing balance calculation:**
- Assets/Expenses: `opening_balance + debit_total - credit_total`
- Liabilities/Revenue/Equity: `opening_balance - debit_total + credit_total`

```sql
journal_entry_view (
  id              UUID PK,
  tenant_id       UUID NOT NULL,
  journal_entry_id UUID FK → journal_entries,
  entry_number    TEXT NOT NULL,
  date            DATE NOT NULL,
  narration       TEXT NOT NULL,
  reference_type  ENUM (same as journal_entries),
  reference_id    UUID,
  status          ENUM (same as journal_entries),
  fiscal_year     TEXT NOT NULL,
  total_debit     NUMERIC(18,2),
  total_credit    NUMERIC(18,2),
  line_count      INTEGER,
  created_by_name TEXT,                       -- Denormalized from users
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ
)

fy_summaries (
  id                UUID PK,
  tenant_id         UUID NOT NULL,
  fiscal_year       TEXT NOT NULL,
  total_revenue     NUMERIC(18,2),
  total_expenses    NUMERIC(18,2),
  net_profit        NUMERIC(18,2),
  retained_earnings NUMERIC(18,2),
  closed_at         TIMESTAMPTZ,
  UNIQUE(tenant_id, fiscal_year)
)
```

### 4.8 Fiscal Years

```sql
fiscal_years (
  id          UUID PK,
  tenant_id   UUID NOT NULL,
  year        TEXT NOT NULL,            -- "2024-25"
  start_date  DATE NOT NULL,            -- 2024-04-01
  end_date    DATE NOT NULL,            -- 2025-03-31
  status      ENUM('open', 'closed'),
  closed_by   UUID FK → users,
  closed_at   TIMESTAMPTZ,
  UNIQUE(tenant_id, year)
)
```

**Rules:**
- No posting to a closed FY (command handler enforces)
- Up to **2 concurrent open FYs** allowed. This is essential for year-end transitions — businesses routinely need to post March entries in the old FY while April entries have started in the new FY.
- The older of the two open FYs has a configurable grace period (default: 90 days after the new FY opens). After the grace period, the system warns the user to close the old FY. After an additional 30-day hard deadline, the old FY auto-closes if all entries are posted. A system administrator can close it manually at any time.
- **Auto-close with drafts:** If the 30-day hard deadline is reached and draft entries still exist in the old FY, the system does **not** auto-close. Instead: (1) the FY is marked as `pending_close` in the UI — visible but non-blocking, (2) the user is notified with urgency (email + in-app banner), (3) drafts must be resolved before close — the user can either post them or delete them. The system will never auto-post or auto-delete drafts — that is a financial decision only the user can make. The `pending_close` state is a UI indicator only; it does not change the FY's `status` column (which remains `open`). This prevents the system from making irreversible financial decisions while still pressuring the user to act.
- FY close requires all entries posted or deleted (no drafts remain)
- FY close is irreversible in v1 — prior-period adjustments go in current year

### 4.9 Projector State

```sql
projector_state (
  id                      UUID PK,
  tenant_id               UUID NOT NULL,
  projector_name          TEXT NOT NULL,            -- 'AccountBalanceProjector', etc.
  last_processed_sequence BIGINT NOT NULL DEFAULT 0,
  updated_at              TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, projector_name)
)
```

Tracks the last event sequence each projector has consumed. Projector worker queries `event_store WHERE sequence > last_processed_sequence ORDER BY sequence SKIP LOCKED`.

**Fan-out model (v1):** A single worker process handles all tenants serially. The processing loop queries `event_store` across all tenants, ordered by `sequence` globally:

1. `SELECT * FROM event_store WHERE sequence > (SELECT MAX(last_processed_sequence) FROM projector_state WHERE projector_name = :name) ORDER BY sequence LIMIT 100 FOR UPDATE SKIP LOCKED`
2. For each event, apply projection + update `projector_state` for the event's `tenant_id` + projector, in a single transaction.
3. The `UNIQUE(tenant_id, projector_name)` in `projector_state` means each tenant tracks its own progress independently — if the worker restarts, it resumes from the lowest `last_processed_sequence` across all tenants and skips already-processed events (idempotent upserts handle this).

**Why serial, not per-tenant workers in v1:** Per-tenant workers require a dispatcher, tenant-aware routing, and scaling logic — all unnecessary at v1 scale (tens of tenants, not thousands). Serial processing within a single DB transaction per event keeps the code simple and consistent. The ceiling on throughput is ~1000 events/sec in a single-threaded loop — more than sufficient for v1. If throughput becomes a bottleneck, the worker can be sharded by tenant prefix later without changing the projector code.

### 4.10 Report Cache Version

```sql
report_cache_versions (
  id              UUID PK,
  tenant_id       UUID NOT NULL,
  fiscal_year     TEXT NOT NULL,
  cache_version   BIGINT NOT NULL,       -- Monotonically incremented on projection update
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, fiscal_year)
)
```

Projectors increment `cache_version` each time they update `account_balances` for a tenant+FY. Report queries check if the Redis-cached result's version matches the current `cache_version`. If stale → recompute.

### 4.11 Gapless Entry Number Mechanism

Entry numbers use a dedicated counter table instead of dynamic sequences. Dynamic `CREATE SEQUENCE` per tenant per FY pollutes `pg_class` over time and doesn't scale.

```sql
entry_number_counters (
  id           UUID PK,
  tenant_id    UUID NOT NULL,
  fiscal_year  TEXT NOT NULL,            -- "2024-25"
  next_val     BIGINT NOT NULL DEFAULT 1,
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, fiscal_year)
)
```

Command handler for `CreateJournalEntry`:

1. `SELECT next_val FROM entry_number_counters WHERE tenant_id = :tenant AND fiscal_year = :fy FOR UPDATE`
2. Use `next_val` as the entry number, then increment: `UPDATE entry_number_counters SET next_val = next_val + 1 WHERE ...`
3. The `FOR UPDATE` row lock guarantees gapless assignment within a transaction — no two entries can get the same number.

This provides the same gapless guarantee as sequences without schema pollution.

### 4.12 Entity-Relationship Summary

```
users ──1:N──▶ user_tenants ──N:1──▶ tenants
                │
                ├──1:N──▶ tenant_module_config
├──1:N──▶ accounts (CoA) ──1:N──▶ account_tags
│ ──1:N──▶ account_cash_flow_overrides
│ (cash_flow_default_mapping is global, not per-tenant)
                ├──1:N──▶ fiscal_years
├──1:N──▶ entry_number_counters
                ├──1:N──▶ journal_entries ──1:N──▶ journal_entry_lines
                │                                    ──1:N──▶ narration_corrections
                ├──1:N──▶ event_store
                ├──1:N──▶ snapshots
├──1:N──▶ account_balances (projection)
├──1:N──▶ journal_entry_view (projection)
├──1:N──▶ fy_summaries (projection)
├──1:N──▶ projector_state
└──1:N──▶ report_cache_versions
```

---

## 5. Projector Implementation

### 5.1 Architecture (v1)

No external message broker. Uses PostgreSQL `SKIP LOCKED` as a lightweight queue.

**Projector worker** runs as a dedicated long-running process (not a cron-called API route). This avoids the failure mode where a crash between "apply projection" and "update projector_state" causes data inconsistency.

**Deployment (v1):** The projector worker runs as a separate Node.js process alongside the Next.js web server. On v1 infrastructure (single-instance or small cluster):

| Environment | Deployment | Supervision | Restart |
|---|---|---|---|
| Development | `tsx` process via `pnpm dev:projector` | Manual (developer restarts) | N/A |
| Staging/Production | PM2 process manager (same host as web server) | PM2 watch + restart on crash/unhealthy | Auto-restart with exponential backoff (max 10 retries, then alert) |

**Why PM2, not systemd:** PM2 is Node.js-native, shares the same deployment artifact as the web server, and provides process monitoring + log aggregation out of the box. systemd requires separate service files and is OS-specific. If the project later moves to containerized deployment (Docker/K8s), the PM2 layer is simply replaced — the worker code stays the same.

**Health check:** The worker exposes a minimal HTTP endpoint (`GET /health`) on a separate port (e.g., 3100). PM2 probes this endpoint. If the worker is stuck (not processing events for >60s), the health check returns 503 → PM2 restarts it.

**Future:** At scale, the worker can be moved to a dedicated container with Kubernetes supervision, or split into per-tenant workers (see §4.9 note on fan-out). The processing loop code is agnostic to deployment model.

**Processing loop:**

1. `SELECT next unprocessed event FROM event_store ORDER BY sequence SKIP LOCKED` (scoped to tenant)
2. Begin a **single DB transaction** that wraps both:
   a. Apply the event to relevant projection tables (upsert patterns below)
   b. Update `projector_state.last_processed_sequence`
3. Commit the transaction. If it fails, the event is not marked as processed and will be retried.
4. If a projector crashes between steps, the `SKIP LOCKED` lock is released automatically, and another worker (or restart) picks up the same event.

**Idempotency guarantees per projector:**

| Projector | Idempotency Mechanism |
|---|---|
| AccountBalanceProjector | Upserts into `account_balances` using `ON CONFLICT (tenant_id, account_id, fiscal_year, period) DO UPDATE SET debit_total = EXCLUDED.debit_total, credit_total = EXCLUDED.credit_total, ...` |
| JournalEntryViewProjector | Upserts into `journal_entry_view` using `ON CONFLICT (journal_entry_id) DO UPDATE SET ...` |
| SnapshotProjector | Upserts into `snapshots` using `ON CONFLICT (aggregate_id, sequence) DO UPDATE SET state = EXCLUDED.state` |
| FYSummaryProjector | Upserts into `fy_summaries` using `ON CONFLICT (tenant_id, fiscal_year) DO UPDATE SET ...` |

All projectors use `ON CONFLICT ... DO UPDATE` (upsert) rather than `INSERT` — this means replaying an already-processed event produces the same result without errors or duplicates.

### 5.2 Projectors in v1

| Projector | Listens To | Updates |
|---|---|---|
| AccountBalanceProjector | All journal entry events | `account_balances` |
| JournalEntryViewProjector | All journal entry events | `journal_entry_view` |
| SnapshotProjector | Every 10th event per aggregate | `snapshots` |
| FYSummaryProjector | `fiscal_year_closed` | `fy_summaries` |

All projectors are **idempotent** — replaying the same event produces the same result.

### 5.3 Projection Drift Handling

Projections are derived data and can drift from the event store.

**Repair strategy:**
1. `verify_projection` job runs nightly — recomputes balances from event store, compares against `account_balances`
2. If drift detected → flag discrepancy, alert user, trigger re-projection for affected periods
3. Full re-projection available as admin action: wipe all projection tables, replay from event store from scratch

---

## 6. Financial Reports

### 6.1 Reports in v1

| Report | Input | Output |
|---|---|---|
| Trial Balance | FY + optional date range | Account-wise debit/credit totals |
| Profit & Loss | FY + period | Revenue - Expenses = Net Profit |
| Balance Sheet | FY + as-of date | Assets = Liabilities + Equity |
| Cash Flow | FY + period | Operating/Investing/Financing flows |
| Ledger (Account Register) | Account + date range | All transactions for one account |
| Day Book | Date | All transactions for a single day |

All reports query projections (`account_balances`, `journal_entry_view`), never the raw event store.

### 6.2 P&L Statement (Indian Format)

Two formats supported — selected during onboarding:

**Schedule III (Companies — Pvt Ltd, Public Ltd, LLP):**

```
I.   Revenue from Operations
       a. Sale of Products
       b. Sale of Services
       c. Other Operating Revenue
II.  Other Income
III. Total Revenue (I + II)
IV.  Expenses
       a. Cost of Materials Consumed
       b. Purchases of Stock-in-Trade
       c. Changes in Inventories
       d. Employee Benefit Expenses
       e. Finance Costs
       f. Depreciation & Amortization
       g. Other Expenses
V.   Profit Before Tax (III - IV)
VI.  Tax Expense
VII. Profit After Tax (V - VI)
```

**Proprietorship/Partnership (simpler):**

```
Revenue
  Sales
  Other Income
  Total Revenue
Less: Expenses
  Direct Expenses (Purchases, Wages, Freight, etc.)
  = Gross Profit
  Indirect Expenses (Rent, Salary, Utilities, etc.)
  = Net Profit
```

**Mapping to accounts:**

| P&L Line | Account Kind | Account Sub-Type | Tag (if applicable) |
|---|---|---|---|
| Revenue from Operations | Revenue | OperatingRevenue | — |
| Other Income | Revenue | OtherRevenue | — |
| Direct Expenses | Expense | DirectExpense | — |
| Indirect Expenses | Expense | IndirectExpense | — |
| Finance Costs | Expense | IndirectExpense | `finance_cost` |
| Depreciation | Expense | IndirectExpense | `depreciation` |
| Tax Expense | Expense | IndirectExpense | `tax` |
| Employee Benefits | Expense | DirectExpense/IndirectExpense | `employee_benefits` |

### 6.3 Balance Sheet (Indian Format)

**Schedule III structure:**

```
I. Equity & Liabilities
   A. Shareholders' Funds (Equity + Reserves)
   B. Share Application Money
   C. Non-Current Liabilities
   D. Current Liabilities
   E. Total (A+B+C+D)

II. Assets
   A. Non-Current Assets
      - Fixed Assets (Tangible + Intangible)
      - Long-term Investments
   B. Current Assets
      - Inventories
      - Trade Receivables
      - Cash & Cash Equivalents
      - Short-term Investments
   C. Total (A+B)

III. Check: I.E = II.C (MUST balance)
```

**Mapping:**

| BS Section | Account Kind | Account Sub-Type | Tag |
|---|---|---|---|
| Equity | Equity | Capital, Drawing, Reserves | — |
| Non-Current Liabilities | Liability | LongTermLiability | — |
| Current Liabilities | Liability | CurrentLiability | — |
| Fixed Assets | Asset | FixedAsset | — |
| Inventory | Asset | Inventory | — |
| Trade Receivables | Asset | CurrentAsset | `trade_receivable` |
| Cash & Bank | Asset | Cash, Bank | — |
| Other Current Assets | Asset | CurrentAsset | — |

**Retained Earnings:**

```
Retained Earnings = Opening Retained Earnings (from previous FY close)
                   + Net Profit for current period
                   - Drawings
```

When FY is closed, `fy_summaries` locks the net profit/loss, and the next FY's opening balances carry it forward.

### 6.4 Cash Flow Statement (Indirect Method)

Cash flows are classified by **purpose**, not just by account type. A single account like "Bank OD" could be operating or financing depending on context. To avoid misclassification, the system uses a two-tier mapping:

1. **`cash_flow_default_mapping`** — global defaults keyed on `sub_type`. Seeded once (not per-tenant). Covers the common case.
2. **`account_cash_flow_overrides`** — per-tenant, per-account overrides. When a user reclassifies a specific account's cash flow category via the UI, it's stored here.

**Resolution order:** If an override exists for `(tenant_id, account_id)`, use it. Otherwise, fall back to `cash_flow_default_mapping` for the account's `sub_type`.

**Default mapping (seeded globally, not per-tenant):**

| Sub-Type | Cash Flow Category | Rationale |
|---|---|---|
| Cash, Bank | Operating | Core business cash |
| CurrentAsset (trade_receivable) | Operating | Working capital |
| CurrentAsset (inventory) | Operating | Working capital |
| CurrentAsset (other) | Operating | Working capital |
| CurrentLiability (trade_payable) | Operating | Working capital |
| CurrentLiability (other) | Operating | Short-term obligations |
| LongTermLiability | Financing | Borrowings |
| FixedAsset | Investing | Asset purchases |
| Capital | Financing | Owner investment |
| Drawing | Financing | Owner withdrawal |
| Revenue | Operating | Operating income |
| Expense | Operating | Operating expense |

**Users can override** the default mapping per account via the UI. Overrides are stored in `account_cash_flow_overrides`. For example, a "Specific Loan" account (sub_type: LongTermLiability) used to purchase machinery could be reclassified as Investing if the business wants it that way. The override takes precedence over the `sub_type` default for that specific account.

**Indirect method computation:**

```
Operating Activities:
  Net Profit
  + Depreciation (non-cash)
  + Changes in Working Capital:
    - Increase/Decrease in Operating-classified current assets
    - Increase/Decrease in Operating-classified current liabilities
  = Cash from Operations

Investing Activities:
  Net change in Investing-classified accounts
  = Cash from Investing

Financing Activities:
  Net change in Financing-classified accounts
  = Cash from Financing

Net Cash Flow = Operating + Investing + Financing
```

All derived from `account_balances` period comparisons, filtered by resolved cash flow category (override → default).

### 6.5 Ledger / Account Register

| Date | Particulars | Voucher Type | Debit | Credit | Balance |
|---|---|---|---|---|---|
| 2024-04-01 | Opening Balance | — | — | — | ₹50,000 Dr |
| 2024-04-05 | Sales Invoice #12 | Invoice | ₹1,00,000 | — | ₹1,50,000 Dr |

Running balance computed via SQL window function — no extra table needed.

### 6.6 Report Caching

| Scenario | Cache Behavior |
|---|---|
| FY is closed | Cached indefinitely (data immutable) |
| FY is open, no new entries | Return cached result |
| FY is open, new entries posted | Invalidate + recompute |

**Mechanism:** Projector updates `account_balances` → writes `cache_version` timestamp per tenant per FY. Report query checks if `cache_version` changed since last cached result.

**Storage:** Redis with `tenant:fy:report_type` key. TTL: 1 hour for open FY, no expiry for closed FY.

---

## 7. Onboarding + Business Setup

### 7.1 Onboarding Flow

```
1. Sign Up (Auth) → 2. Business Profile → 3. Business Type (module activation)
→ 4. CoA Template → 5. FY + GST Setup → 6. Opening Balances → 7. Dashboard
```

### 7.2 Step 2: Business Profile

| Field | Type | Required | Notes |
|---|---|---|---|
| Business name | string | Yes | Display name |
| Legal name | string | No | If different from trading name |
| Business type | enum | Yes | Sole Proprietorship, Partnership, LLP, Pvt Ltd, Public Ltd, HUF |
| PAN | string | Yes | Regex validated: `AAAAA9999A` |
| GSTIN | string | Conditional | Required if GST registered. 15-digit format |
| Date of incorporation | date | No | For companies/LLPs |
| Address | text | Yes | For invoices + GST returns |
| State | enum | Yes | 28 states + 8 UTs |
| Industry | enum | Yes | Drives module activation |

### 7.3 Step 3: Module Activation Matrix

| Business Type | Accounting | Invoicing | Inventory | Payroll | GST | OCR | ITR |
|---|---|---|---|---|---|---|---|
| Retail/Trading | Core | Sales+Purchase | Simple stock | Basic | Mandatory | Yes | ITR-3/4 |
| Manufacturing | Core | Sales+Purchase | Full (BOM+WIP) | Full | Mandatory | Yes | ITR-3/4 |
| Services/Professional | Core | Sales only | None | Basic | Conditional* | Yes | ITR-3/4 |
| Freelancer/Consultant | Core | Sales only | None | None | Conditional* | Yes | ITR-3/4 |
| Regulated Professional | Core | Sales only | None | Basic | Conditional* | Yes | ITR-4/5 |

*Conditional GST: Below ₹20L (services) / ₹40L (goods) threshold — optional. Above — mandatory.

User can override auto-activation. Overrides stored in `tenant_module_config` with `set_by = 'manual'`.

### 7.4 Step 4: Chart of Accounts Templates

Template JSON files per business type + legal structure combination:

```
coa_templates/
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
```

Each template contains the full account tree with codes, names, kinds, sub_types, tags, and hierarchy.

**Manufacturing template** adds: BOM accounts, Work-in-Progress, Finished Goods, Raw Materials under Inventory.
**Services template** removes Purchases/Purchase Returns, adds Service Revenue.
**Private Limited** adds Share Capital, Reserves & Surplus, Provision for Taxation.

**User can customize the template before seeding:** tree view of all accounts, add/remove/rename, then confirm. Only after confirmation does the system seed the CoA.

### 7.5 Step 5: Fiscal Year + GST Setup

| Field | Type | Notes |
|---|---|---|
| First FY start date | date | Auto-set to current FY. User can change if migrating mid-year |
| GST registration type | enum | regular, composition, none |
| Applicable GST rates | multi-select | 0%, 5%, 12%, 18%, 28% |
| ITC eligible | boolean | Composition = no. Regular = yes. Auto-set, user override |
| TDS applicable | boolean | If yes, enables TDS section rates config |
| TDS section rates | jsonb | e.g., `{ "194C": 1, "194J": 10 }` |

### 7.6 Step 6: Opening Balances

**Two modes:**

| Mode | When | What |
|---|---|---|
| Fresh start | New business, first FY | All accounts at ₹0. Skip this step. |
| Migration | Existing business, switching systems | Enter opening balances per account. |

**Migration flow:**
1. Table of all balance sheet accounts with empty amount fields
2. User fills opening balances (debit for assets, credit for liabilities)
3. Live validation: total debits = total credits. Running difference shown.
4. On confirm → single journal entry with `reference_type = 'opening_balance'`
5. Entry is auto-posted. It **cannot be voided through the normal void flow** (system entry).

**Correction mechanism for opening balance errors:**

Opening balance entries are protected from voiding because they're foundational — but mistakes happen. The system provides an `amend_opening_balance` command:

- Available **only before any other transaction is posted** to the fiscal year. Once the FY has real entries, the opening balance is locked.
- When invoked: voids the original opening balance entry, creates a new corrected entry, and links them via `reversal_of`.
- If the FY already has posted entries, the user must create a separate correction journal entry (standard manual entry) to adjust the opening balances.
- This prevents accidental wipeout of foundational data while still providing an escape hatch for early-stage errors.

### 7.7 Step 7: Dashboard (v1 — Accounting Only)

| Widget | Source | Refresh |
|---|---|---|
| Total Revenue (MTD) | `account_balances` Revenue accounts | Real-time |
| Total Expenses (MTD) | `account_balances` Expense accounts | Real-time |
| Net Profit (MTD) | Revenue - Expenses | Real-time |
| Cash & Bank Balance | `account_balances` Cash + Bank accounts | Real-time |
| Outstanding Receivables | `account_balances` trade_receivable tagged | Real-time |
| Outstanding Payables | `account_balances` trade_payable tagged | Real-time |
| Recent Transactions | `journal_entry_view` last 10 entries | Real-time |
| FY Progress | Days elapsed vs total days in FY | Static |

**Note:** Receivables/Payables widgets will show ₹0 until the Invoicing sub-project (#3) is built, since those accounts will have no activity from manual journal entries alone. These widgets are included in the schema for forward compatibility.

---

## 8. Future Module Dependencies

| Future Module | Data It Needs | Where It Comes From |
|---|---|---|
| GST Returns (GSTR-1) | All taxable sales in a period | `journal_entry_view` filtered by `reference_type = 'invoice'` + GST tags |
| GST Returns (GSTR-3B) | ITC-eligible purchases + output tax | `journal_entry_view` filtered by GST-tagged accounts |
| ITR Generation | P&L + Balance Sheet + deductions | P&L/BS reports + tagged expense accounts |
| Invoicing | Revenue accounts + receivables | `accounts` with `kind = Revenue` + `sub_type = OperatingRevenue` |
| Inventory | Inventory asset accounts | `accounts` with `sub_type = Inventory` |
| Payroll | Salary expense accounts | `accounts` with tag `employee_benefits` |
| OCR Scan | Journal entries (draft) | Command handler for `CreateJournalEntry` |

All future modules query the same projections with different filters. No siloed data.

---

## 9. Sub-project Build Order

1. **Core Accounting Engine** ← this spec
2. **Onboarding + Business Setup**
3. **Invoicing + Receivables**
4. **OCR Scan (Image → Ledger)**
5. **Inventory + Warehousing**
6. **Payroll**
7. **GST Returns Generation**
8. **ITR Generation**

Each gets its own spec → plan → implementation cycle.

---

## 10. Data Retention & Tenant Lifecycle

### 10.1 Inactive Tenants

For a freemium SaaS, tenants will churn. The policy:

| Tenant State | Definition | Data Policy |
|---|---|---|
| Active | User logged in within last 90 days | Full access, all data retained |
| Dormant | No login for 90–365 days | Data retained, access requires re-authentication. No deletion. |
| Suspended | No login for >365 days, free tier only | Data retained for 1 more year. Email notice sent at 365-day mark. |
| Deleted | User explicitly deletes, or suspended for >1 year after notice | Hard delete after 30-day grace period. All tenant data removed. |

**Important:** Financial records in India must be retained for 7 years (Income Tax Act §286, Companies Act §128). The deletion policy must account for this:

- For suspended paid tenants: data retained indefinitely (they're paying for storage)
- For suspended free tenants: data retained for 7 years from the last FY closure, then deleted
- Explicit user deletion: 30-day grace period, then hard delete. User is warned that this is irreversible and may violate retention laws.

### 10.2 Data Export

Before any deletion, tenants can export a full backup:
- All journal entries + lines (CSV)
- Chart of accounts (CSV)
- Financial statements (PDF)
- Event store (JSON — for audit purposes)

### 10.3 Anonymization

For GDPR-like compliance (even though India-only, good practice):
- User PII (name, email) is anonymized on deletion
- Financial data (amounts, entries) is retained per the 7-year rule
- Tenant metadata (business name, PAN, GSTIN) is retained per the 7-year rule
