# Arthvahi / ComplianceOS — AGENTS.md

## Identity & Current State

Indian business compliance platform. Product name **Arthvahi**, repo/brand **ComplianceOS**. Modules shipped: double-entry accounting (event-sourced), invoicing + PDF, receivables, FIFO inventory, payroll (PF/ESI/TDS), GST (GSTR-1/2B/3B, e-invoice IRN, e-way bill, HSN master), ITR-3/4 + tax computation, OCR (Tesseract.js), onboarding.

In-flight work lives in **`docs/superpowers/plans/2026-06-06-production-hardening.md`** (auth rework off Supabase service-role, projector fixes, realtime, one-click PDF, GSP/e-filing adapters, HSN/IRN/e-way-bill depth, tests/observability) and **`docs/superpowers/plans/2026-05-02-ui-redesign-implementation.md`**. UI audit tracking: **`IMPECCABLE-AUDIT.md`** (P1–P4 polish). The older `2026-04-20-*` plan/spec files no longer exist — do not reference them.

## Commands (exact)

```bash
pnpm install                     # pnpm >=9, Node 20
pnpm dev                         # turbo: all workspaces (web on :3000)
pnpm build | lint | typecheck | test
pnpm db:generate | db:migrate | db:seed     # drizzle-kit via turbo
pnpm --filter @complianceos/web  ...        # scope: web | server | db | shared
pnpm --filter @complianceos/db db:seed:demo        # SEED_DEMO=true
pnpm --filter @complianceos/db db:seed:demo:clean  # removes demo tenant data
pnpm --filter @complianceos/server test -- src/commands/foo.test.ts   # single vitest file
pnpm --filter @complianceos/web test:e2e | test:e2e:headed | test:e2e:ui   # Playwright
```

Notes:
- `turbo test` runs only the vitest suites (web has no `test` script) — **e2e is never included**; run Playwright separately.
- `test:watch` exists only in `@complianceos/db`.
- README advertises `pnpm test:coverage` — no such root script; use package-level `vitest --coverage` if needed.
- Seeding is env-gated (`SEED_DEMO`, `ALLOW_SEED`, `ALLOW_PROD_SEED`): never seed prod without explicit flags.

## Monorepo

```
apps/web        Next.js 15 App Router. app/ groups: (app) (auth) (marketing) + api/
                middleware.ts, i18n via messages/, Sentry instrumentation
packages/server Command handlers (validation → append event), projectors/ + worker.ts,
                tRPC routers, services/ (efiling, gsp, calculators), __tests__/
packages/db     Drizzle schema (src/schema/index.ts), SQL migrations/ (29 files),
                RLS policies (rls.ts, rls-payroll.ts), seed/
packages/shared Types, Zod schemas, constants shared by all
config/         tsconfig.base.json (TS strict, no `any`)
ops/monitoring  alerting-rules.yml; ecosystem.config.cjs = PM2 (web + projector)
```

## Architecture rules (do not break)

- **Event store is the sole write path.** Commands validate → append event. Projectors (idempotent upserts, SKIP LOCKED) build reads — projectors must never be treated as source of truth or bypass event ordering.
- **RLS per tenant (`tenant_id` on all tables).** NEVER reach for `SUPABASE_SERVICE_ROLE_KEY` / bypass RLS for convenience: `security-gate.yml` bans it in `apps/web/**` and `packages/server/{routers,commands}` and CI fails. Keep service-role out of user paths (hardening Task 1.1).
- tRPC defaults to `protectedProcedure`; `publicProcedure` only where intended (hardening Task 1.5).
- No new `@ts-nocheck` — existing ones are being stripped (Task 1.6).
- Drizzle migration numbering: if a generated id collides, renumber to the next free (see `fix: renumber e-way-bill migration 0022->0024`), never reuse.

## Testing quirks

- Tests hit a **real PostgreSQL 16 + Redis 7**. CI (`.github/workflows/ci.yml`) spins services and exports `DATABASE_URL`/`REDIS_URL`; locally: `docker compose up -d` (or brew), `createdb complianceos_dev`, and run **`pnpm db:migrate` before `pnpm test`** — vitest configs load no dotenv.
- **This machine's local stack:** ports 5432/6379 belong to ANOTHER project's containers (`traceshield`). ComplianceOS runs in its own containers: postgres `localhost:5433` (complianceos/complianceos, db `complianceos_dev`) + redis `localhost:6380`. Root `.env` and `apps/web/.env.local` were stale (supabase-era) and now point at those ports. Note **`apps/web/.env.local` overrides `.env`** for Next — check both when env changes don't stick.
- `db:seed` (`SEED_DEMO=true`, requires `NODE_ENV=development` or `ALLOW_SEED=1`) **completes but never exits** — the pool stays open. Run with a timeout; verify `users`/`tenants` rows separately.
- Snapshot/PDF fixtures in `packages/server/src/__tests__/pdf-snapshots` — PDF output changes break them; review deliberately.
- Vitest excludes macOS `._*` junk (`exclude: **/._*.test.ts`).

## Repo gotchas

- Root is full of macOS `._*` AppleDouble files — gitignored, treated as absence. Don't delete; exclude from globs.
- `.opencode/agents/{advisor,builder,reviewer,coordinator}.md` are **symlinks to `~/.config/opencode/agents/*.md`** (the shared agent pool). They may resolve to nothing from odd sandboxes — read via the symlink target; do not materialize copies.
- Session memory auto-accumulates in **`.opencode/memory/`** (summary.md + session-*.md). On resume, read `summary.md` first — it holds task state, decisions, avoided regressions. Keep it updated when you finish a chunk of work.
- `.env`, `.env.test`, `.env.vercel` are gitignored. Template: `.env.example` (has SUPABASE/storage keys my need for OCR uploads). `docker-compose.yml` gives working defaults.
- **Auth reads the local DB now** (`lib/auth.ts` via `@complianceos/db`) — it previously called Supabase REST (`sbGet`, service-role) against a dead legacy project, so login could never work. Demo login: `demo@complianceos.test` / `demo123` (seed sets the bcrypt hash). Legacy `supabase-rest` calls remain in `app/api/*` routes — replacing those is pending hardening work; `AUTH_TRUST_HOST=true` is required to run `next start` on a non-3000 port.
- **All `app/api/*` legacy supabase-rest routes were rewritten to local DB (Aug 2026, Phase 4a)** — journal/entries, fiscal-years, accounts, coa, gst/returns, audit-log, employees, gst/ledger, gst/payments, payroll/runs, invoices, payments, inventory/*. If you find a remaining `supabaseRest` import in a route, rewrite it the same way (GET → drizzle select, keep response shape). `lib/supabase-rest.ts` still exists for stragglers.
- **API route rewrites must preserve legacy snake_case response keys** — pages were built against supabase REST (snake_case); drizzle select() returns camelCase (employeeCode), which silently renders empty cells + unnamed links (fixed in /api/employees; check the page's field names before "fixing" an empty table).
- **tRPC context trap**: `app/api/trpc/[trpc]/route.ts` used to hardcode `tenantId: ""` in `createContext` — every tRPC page 500'd with "Failed query ... tenant_id = $1" and EMPTY params. It reads tenantId from the session now; if tRPC queries fail with empty params again, check the context first.
- **Demo seed is sparse**: tenant + user + FY + 2 products + 1 employee — no accounts/journal/invoices/payments. Module pages show honest empty states. Seeding a demo CoA + journal entries is open work (coa-templates/ exist).
- **`event_store.sequence` is GLOBAL per tenant (migration 0026)** — it was per-aggregate while projectors track a single per-tenant cursor, so cross-aggregate order was undefined (payments processed before invoices). Do NOT revert to per-aggregate; `appendEvent` computes `max(sequence) WHERE tenant_id`.
- **Projectors must be replay-idempotent**: ReceivablesProjector recomputes from the event log; InvoiceViewProjector updates status on posted (delete+insert ran before the posted branch and nuked the row). When touching projectors, re-run `runProjectorsForTenant(tenantId)` (exported from `projectors/worker.ts`; health server is guarded by isMain) and verify views.
- **Demo financials seed**: `NODE_ENV=development SEED_DEMO=true node <tsx cli> packages/server/src/seed-demo-financials.ts` (70-account CoA + 4 JEs + 2 posted invoices + 1 payment, then projector replay; idempotent). Run the base `db:seed:demo` first so the tenant/user exist.
- **Design tokens live in `apps/web/styles/tokens.css`** (single `@theme` source + `[data-theme="dark"]` overrides). Do NOT re-introduce `:root` color duplicates in globals.css — that exact duplication was the old bug. `scripts/design-audit.mjs` verifies contrast in BOTH themes; run it before claiming UI work done.
- **Migrations were repaired (`fix(db): repair migration set…`)**: 0004_add_invoicing + 0003_add_tenants_onboarding deleted (full duplicates), journal rebuilt in dependency order (file-name order ≠ apply order), bogus FKs (text→uuid) stripped, 0010 rewritten against current tables, 0025 adds schema drift fixes. If a fresh `db:migrate` fails again, suspect *stale schema drift*, not ordering.
- **`drizzle-kit migrate` records applied state in schema `drizzle` (`__drizzle_migrations`)** — `DROP SCHEMA public CASCADE` does NOT reset it; drop `drizzle` schema too or re-runs skip everything and only new migrations apply (they fail, e.g. "relation users does not exist").
- Migration authoring: drizzle generates `CREATE TABLE IF NOT EXISTS` + `ADD COLUMN IF NOT EXISTS` in 0012+/0016+ style — when hand-editing old migration files, existing DBs that applied them skip them (journal hash), fresh DBs replay them — never re-apply applied files on fresh DBs unless both paths are verified.

## Style / workflow

- Caveman mode always on for chat; code, commits, and PRs in normal language. No filler drift.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, with scopes like `fix(ui): …`, `feat(tax): …`.
- TS strict; verify with `pnpm typecheck` (turbo) before claiming a change complete.
- Design conventions live in **`DESIGN.md`** (tokens, typography, primary `#D97706`) — UI changes should respect it; audit feedback in `IMPECCABLE-AUDIT.md`.
- Final commit per task, with the design polish convention `fix(ui): P<N> …` matching the audit phases.

## Self-healing / self-learning / self-improving (encode in every agent)

1. **Fix-first, prove-last.** Any failing verification (lint, typecheck, test, e2e, build) → fix the root cause and re-run the full relevant loop until green. No `@ts-nocheck`, no skipped/fake tests, no swallowed errors.
2. **Verify before marking done.** Every task trains the loop: query `typecheck` + affected tests; schema changes also `db:generate` + `db:migrate`; UI also `next build` and e2e spec when layout/routes touched.
3. **Learn in-place.** — Discover anything non-obvious (env, migration trap, RLS gap, naming collision) → add ONE line to the matching gotcha/structure list in this file same session. Repetitions of the same mistake across sessions are a failure of the file, not of re-telling; keep a diff surgical.
4. **Check the plan registry before inventing.** — `.opencode/memory/` and `.opencode/plans/` + `docs/superpowers/` define approved scope. Old-plans checkboxes in `docs/superpowers/plans/*.md` are often stale vs git history/status — trust committed code + git log over unchecked boxes; note the delta in summary.md.
5. **Recover cleanly.** — Projector worker or pre-committed migrations crash → root cause, replay idempotently, verify ledger invariants (debit=credit, gapless numbers) before proceeding; never carry partial state as truth.
6. **Route through known roles** — `coordinator` dispatches, `builder` implements, `reviewer` audits baseline-gated tasks, `advisor` for ambiguity. If a role is thin/unreliable, fall back to code review and verification instead of skipping the step.
7. **Contract with the user** — if a plan/backlog item would double down on a known-bad pattern (service-role anywhere, publicProcedure stretch), do not implement gold-plating; surface the conflict first (one question, not a barrage).

## CI

Push to `main` + `prod-hardening` and PRs → CI: lint → typecheck → build → test with postgres/redis services; build job depends on the rest. `security-gate.yml` blocks any `SUPABASE_SERVICE_ROLE_KEY` under `apps/web` and server routers/commands.