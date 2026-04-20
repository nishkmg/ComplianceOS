# Onboarding + Business Setup — Implementation Plan

> **For agentic workers:** Use subagent-driven-development for parallel execution.

**Goal:** Complete the onboarding flow so new businesses can set up their tenant, activate modules, seed a chart of accounts, configure their fiscal year/GST, and optionally enter opening balances.

**Architecture decisions (from user confirmation):**
- CoA customization: Review & Refine step — rename, toggle visibility, add sub-account via tree UI. Validate entire tree as JSON before seeding.
- Opening balances: Full table UI, BS accounts only, grouped by Kind, sticky "Running Difference" widget blocking confirm until diff = 0.
- Persistence: Save progress after each step, allow resume on page refresh/return.

---

## File Structure

```
packages/db/src/schema/
  tenants.ts                    # MODIFY: add onboarding_status, onboarding_data, gst_config columns

packages/server/src/commands/
  create-tenant.ts               # CREATE: create tenant + user_tenant, emit event
  seed-coa.ts                   # CREATE: load template JSON, create accounts hierarchy, emit events
  setup-opening-balances.ts      # CREATE: create opening balance JE if migration mode
  create-fiscal-year.ts         # EXISTS: ensure works with new tenant context

packages/server/src/routers/
  onboarding.ts                 # MODIFY: flesh out seedBusiness, add createTenant, seedCoA, setupOpeningBalances, getOnboardingStatus, saveProgress procedures

packages/shared/src/types/
  onboarding.ts                 # MODIFY: add Zod schemas for all onboarding steps

apps/web/app/(app)/onboarding/
  components/
    account-tree.tsx            # CREATE: expandable tree with rename, toggle, add-sub-account
  step-business-profile.tsx    # MODIFY: real form with tRPC call + validation
  step-module-activation.tsx    # MODIFY: real toggle with auto-recommend logic
  step-coa-template.tsx        # MODIFY: template selector (small refactor)
  step-coa-review.tsx           # CREATE: new step — review & refine tree
  step-fy-gst.tsx               # MODIFY: real form with tRPC call
  step-opening-balances.tsx     # MODIFY: full table UI with running diff
  page.tsx                      # MODIFY: wire up tRPC, step state, persistence, redirect
  use-onboarding.ts             # CREATE: shared hook for step state + persistence
```

---

## Task 1: Database Schema — Add Onboarding Columns to Tenants

**Files:**
- `packages/db/src/schema/tenants.ts`

**Steps:**
- [ ] Add `onboardingStatus` column: `onboarding_status text default 'in_progress' not null` (values: 'in_progress', 'complete')
- [ ] Add `onboardingData` column: `onboarding_data jsonb default '{}' not null` — stores partial step data per step key
- [ ] Add `gstConfig` column: `gst_config jsonb default '{}' not null` — stores `{gstRegistration, itcEligible, tdsApplicable, tdsSectionRates}`
- [ ] Add `industry` column if not already present
- [ ] Run `pnpm db:generate`
- [ ] Commit

---

## Task 2: Shared Types — Onboarding Zod Schemas

**Files:**
- `packages/shared/src/types/onboarding.ts`

**Steps:**
- [ ] `BusinessProfileInputSchema` — name, legalName, businessType, pan, gstin (optional), address, state, industry, dateOfIncorporation (optional)
- [ ] `ModuleActivationInputSchema` — modules: array of {module, enabled}
- [ ] `CoARefinementsSchema` — accounts: array of {originalCode, name, isEnabled, children[]}
- [ ] `FYGstInputSchema` — fiscalYearStart, gstRegistration, applicableGstRates[], itcEligible, tdsApplicable, tdsSectionRates (optional)
- [ ] `OpeningBalancesInputSchema` — mode: 'fresh_start' | 'migration', balances: array of {accountId, accountCode, name, kind, openingBalance}
- [ ] `OnboardingProgressSchema` — currentStep, completedSteps[], data: BusinessProfileInput | ModuleActivationInput | CoARefinements | FYGstInput | OpeningBalancesInput
- [ ] Commit

---

## Task 3: Command Handlers — createTenant, seedCoA, setupOpeningBalances

**Files:**
- `packages/server/src/commands/create-tenant.ts`
- `packages/server/src/commands/seed-coa.ts`
- `packages/server/src/commands/setup-opening-balances.ts`

**Steps:**

### create-tenant.ts
- [ ] Create `createTenant(input)` function
- [ ] Validate business profile (PAN format, GSTIN format if provided)
- [ ] Create `tenants` record with onboarding_status = 'in_progress', onboarding_data = {businessProfile: input}
- [ ] Create `user_tenants` record linking user to tenant
- [ ] Create tenant module config rows based on business type + industry
- [ ] Append `tenant_created` event to event store
- [ ] Return `{ tenantId, userTenantId }`

### seed-coa.ts
- [ ] Create `seedCoa(tenantId, refinements)` function
- [ ] Load template JSON from `coa-templates/{businessType}_{industry}.json` (fallback to sole_proprietorship_trading)
- [ ] Flatten tree into array, apply refinements (rename, toggle isEnabled)
- [ ] Recursively create accounts with codes, respecting hierarchy (parent_id FK chain)
- [ ] For each root account created, append `account_created` event
- [ ] Set `onboarding_data.coa = { seeded: true, accountCount }`
- [ ] Return `{ accountCount }`

### setup-opening-balances.ts
- [ ] Create `setupOpeningBalances(tenantId, input)` function
- [ ] If mode === 'fresh_start': set `onboarding_data.openingBalances = { mode: 'fresh_start' }`, return early
- [ ] If mode === 'migration': validate total debits === total credits
- [ ] Create opening balance JE with reference_type = 'opening_balance', auto-posted
- [ ] Set `onboarding_data.openingBalances = { mode: 'migration', entryId, totalAmount }`
- [ ] Append `journal_entry_posted` event
- [ ] Return `{ entryId, totalAmount }`

### create-fiscal-year.ts (verify)
- [ ] Ensure it works with tenant context set before calling
- [ ] Validate only 2 open FYs max
- [ ] Commit

---

## Task 4: tRPC Router — Onboarding

**Files:**
- `packages/server/src/routers/onboarding.ts`

**Procedures:**
- [ ] `createTenant` — calls command, returns tenantId
- [ ] `seedCoa` — calls command, returns accountCount
- [ ] `setupOpeningBalances` — calls command, returns entryId
- [ ] `saveProgress` — updates `onboarding_data` JSONB column with current step data
- [ ] `getProgress` — reads `onboarding_status` + `onboarding_data`, returns full state
- [ ] `completeOnboarding` — sets `onboarding_status = 'complete'`
- [ ] Commit

---

## Task 5: Frontend — Shared Onboarding Hook + Persistence

**Files:**
- `apps/web/app/(app)/onboarding/use-onboarding.ts`

**Steps:**
- [ ] `useOnboarding()` hook — manages current step (1-5), calls `getProgress` on mount
- [ ] `saveProgress(step, data)` — calls tRPC `saveProgress` after each step
- [ ] Step state persisted to localStorage as fallback (if tRPC fails)
- [ ] `useOnboardingRedirect()` — redirects to /onboarding if `onboardingStatus !== 'complete'` and user is on dashboard
- [ ] Commit

---

## Task 6: Frontend — Step 1: Business Profile

**Files:**
- `apps/web/app/(app)/onboarding/step-business-profile.tsx`

**Steps:**
- [ ] Form fields: businessName, legalName, businessType (select), pan (with AAAAA9999A regex), gstin (conditional), address, state (select from 36 options), industry (select)
- [ ] Validation with Zod (same schema as shared)
- [ ] On submit: call `onboardingRouter.createTenant`, save progress, advance to step 2
- [ ] Pre-fill from saved progress if resuming
- [ ] Use Shadcn Input, Select, Textarea components
- [ ] Commit

---

## Task 7: Frontend — Step 2: Module Activation

**Files:**
- `apps/web/app/(app)/onboarding/step-module-activation.tsx`

**Steps:**
- [ ] Auto-recommend based on business type + industry (matrix from §7.3 of spec)
- [ ] Toggle switches per module (Accounting always on, locked)
- [ ] Save to `tenant_module_config` via tRPC call on step advance
- [ ] Commit

---

## Task 8: Frontend — Step 3a: CoA Template Selection (Refactor existing)

**Files:**
- `apps/web/app/(app)/onboarding/step-coa-template.tsx` (refactor)

**Steps:**
- [ ] Template cards based on business type selection from Step 1
- [ ] Show 4-5 relevant templates as cards with preview description
- [ ] On select: load template JSON, save to step data, advance to Step 3b (Review & Refine)
- [ ] Commit

---

## Task 9: Frontend — Step 3b: CoA Review & Refine (NEW)

**Files:**
- `apps/web/app/(app)/onboarding/components/account-tree.tsx`
- `apps/web/app/(app)/onboarding/step-coa-review.tsx`

**Steps:**

### account-tree.tsx
- [ ] Flattened tree with Accordion (shadcn/ui Accordion.Root + AccordionItem per parent)
- [ ] Each item: account code, name (inline edit on double-click or pencil icon), enabled toggle (switch), "Add sub-account" button
- [ ] Add sub-account: inline input appears below parent, enter to add
- [ ] Visual grouping by Kind (Assets collapsible, Liabilities collapsible, etc.)
- [ ] Show enabled/disabled count per section

### step-coa-review.tsx
- [ ] Loads template from step data, renders AccountTree
- [ ] "Validate Tree" button — serializes tree to JSON, sends to `seedCoa` tRPC call
- [ ] On success: save progress, advance to Step 4
- [ ] Error handling: show specific validation errors (e.g., "duplicate codes")
- [ ] Commit

---

## Task 10: Frontend — Step 4: FY + GST Setup

**Files:**
- `apps/web/app/(app)/onboarding/step-fy-gst.tsx`

**Steps:**
- [ ] FY start date (default to April 1 of current year)
- [ ] GST registration type (none/regular/composition)
- [ ] GST rates (multi-select checkboxes: 0%, 5%, 12%, 18%, 28%)
- [ ] ITC eligible (auto-set based on composition, allow override)
- [ ] TDS applicable (toggle)
- [ ] TDS section rates (conditional, key-value pairs)
- [ ] On submit: call `createFiscalYear` command + save GST config to tenant
- [ ] Commit

---

## Task 11: Frontend — Step 5: Opening Balances

**Files:**
- `apps/web/app/(app)/onboarding/step-opening-balances.tsx`

**Steps:**
- [ ] Two modes: "Fresh Start" (radio) and "Migration" (radio)
- [ ] Fresh Start: simple confirmation card, set mode in data, skip to complete
- [ ] Migration: Table UI grouped by Kind
  - Filter to BS accounts only (kind: Asset, Liability, Equity)
  - Columns: Account Code, Name, Opening Balance (Dr/Cr toggle)
  - Group by Kind: Assets, Liabilities, Equity — each in a collapsible section
  - "Add" button per row for custom amounts
- [ ] Sticky footer widget: "Running Difference: ₹X.XX Dr / Cr" — red if non-zero, green if zero
- [ ] "Confirm" button disabled until Running Difference = 0
- [ ] On confirm: call `setupOpeningBalances`, then `completeOnboarding`, redirect to /dashboard
- [ ] Commit

---

## Task 12: Onboarding Completion + Middleware Guard

**Files:**
- `apps/web/middleware.ts` (update)
- `apps/web/app/(app)/onboarding/page.tsx` (update)

**Steps:**
- [ ] `completeOnboarding` tRPC call sets `onboarding_status = 'complete'` in DB
- [ ] Middleware: on any request to `/(app)/*` (except /onboarding), check if user has `tenant.onboardingStatus === 'complete'` — if not, redirect to /onboarding
- [ ] Onboarding page: on mount, call `getProgress` — if already complete, redirect to /dashboard
- [ ] Update onboarding page to use `useOnboarding` hook for step state management
- [ ] Commit

---

## Task 13: Add Missing CoA Templates

**Files:**
- `packages/db/src/seed/coa-templates/*.json` (7 more files)

**Templates needed:**
- [ ] `partnership_trading.json`
- [ ] `partnership_services.json`
- [ ] `llp_services.json`
- [ ] `huf_trading.json`
- [ ] `regulated_professional.json`
- [ ] `private_limited_trading.json`
- [ ] `private_limited_manufacturing.json` (already exists)

**Approach:** Copy sole_proprietorship_trading as base, adapt for each business type (add Share Capital for pvt Ltd, Partnership capital accounts for partnership, etc.)
- [ ] Commit

---

## Task 14: Verification

**Steps:**
- [ ] `pnpm turbo typecheck` — all packages pass
- [ ] `pnpm turbo test` — all tests pass
- [ ] Manual smoke test: sign up, go through all 5 steps, verify redirect to dashboard
- [ ] Test resume: refresh page mid-onboarding, verify correct step restored
- [ ] Test running diff: enter unbalanced opening balances, verify Confirm is disabled
- [ ] Commit final
