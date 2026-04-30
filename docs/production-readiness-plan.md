# Production Readiness Remediation Plan

**ComplianceOS** — Double-entry accounting engine with event sourcing for Indian businesses.

Generated: 2026-04-28

---

## Project Summary

ComplianceOS is a full-stack double-entry accounting engine with event sourcing for Indian businesses serving sole proprietors through mid-size companies, covering accounting, GST/ITR generation, invoicing, inventory, and payroll. Tech stack: Next.js 15 + React 19 + TypeScript 5 + tRPC v11 + Drizzle ORM + PostgreSQL 16 + Redis 7, deployed on Railway via Docker.

Success criteria: gapless journal entry numbering per fiscal year, zero-data-loss event sourcing with idempotent projectors, multi-tenant isolation via PostgreSQL RLS, <500ms P95 API response times for common queries, <5% error rate on CEI-computed reports, automated deployment with rollback capability.

---

## Code Review Findings

### Structured logging missing across all server layers (HIGH, 2 days)

Every `console.log`, `console.error`, and `showToast` call must be replaced with a structured logger (Pino or Winston) emitting JSON with correlation IDs. This applies to all server-side code in `packages/server/`, `apps/web/lib/api/`, and Next.js API routes. The projector worker (`packages/server/src/projectors/worker.ts`) has zero diagnostic output — when it crashes there is no trace.

### No React error boundaries on app pages (HIGH, 1 day)

Many pages in `apps/web/app/(app)/` lack error boundaries. A single uncaught exception crashes the entire page to a white screen. Every page segment must be wrapped in an `ErrorBoundary` component rendering a graceful fallback with a "Retry" button and auto-captured error report.

### tRPC input validation needs hardening beyond Zod defaults (MEDIUM, 1 day)

All Zod schemas in `packages/shared/src/validation/` need: max string lengths (narration capped at 1000 chars), amount precision checks (max 2 decimal places), XSS prevention (strip HTML tags from all text inputs).

### Command handlers not idempotent (HIGH, 1 day)

If a command handler crashes after appending to the event store but before returning a response, the client retries and creates a duplicate event. Every CREATE command must check the event store's `(aggregate_id, sequence)` unique constraint and return the existing event on retry detection.

### Projector worker missing health check endpoint (MEDIUM, 0.5 days)

Per spec §5.1, expose `GET /health` on a separate port (3100) returning 503 if no events processed in the last 60 seconds. Specified in design doc but not implemented.

### Duplicate CSS utility class definitions (LOW, 0.5 days)

Classes like `.font-display-xl`, `.text-display-xl`, `.font-ui-sm` defined in both `tailwind.config.ts` and `globals.css`. Choose one source of truth.

### Hardcoded color values instead of CSS variables (MEDIUM, 1 day)

Dialogs in `apps/web/components/dialogs/` use `bg-[#C8860A]` etc. Should reference CSS variables like `bg-primary-container` for theme propagation.

### `// @ts-nocheck` suppression in nearly every page (LOW, 2 days)

Track as tech debt with phased removal plan: fix underlying type issues file by file, remove suppression comment.

### Dockerfile does not run migrations at startup (HIGH, 0.5 days)

Production Dockerfile runs Next.js server directly. If a migration hasn't been applied, the app crashes with schema errors. Add migration step to entrypoint with locking to prevent concurrent runs.

---

## Testing Strategy

### Unit tests (3 days)

- Zod validation schemas in `packages/shared/src/validation/`: test valid inputs, invalid inputs (empty required, wrong types), boundary values (max lengths, negative amounts), edge cases (special chars, very long strings). Use Vitest.
- Drizzle schema files in `packages/db/src/schema/`: test table constraints (unique indexes, foreign keys, check constraints), enum value completeness matching the spec, `is_leaf` trigger behavior.

### Integration tests (5 days)

Set up PostgreSQL via Testcontainers or CI service. Write tests that:

- Create a tenant, seed CoA, create a journal entry, post it, verify balance projection updated
- Multi-tenant isolation — create two tenants with same account code, verify no interference
- Gapless entry numbers — concurrently create 50 entries, verify no gaps or duplicates
- RLS policies — attempt cross-tenant data access, verify blocked
- Fiscal year enforcement — post entry to closed FY, verify rejected

Use `packages/db/src/index.ts` for connection, run inside transaction rolled back after each test.

### End-to-end tests (4 days)

Expand existing Playwright setup (`apps/web/playwright.config.ts`) to cover:

- Login → dashboard → create entry → post → verify entry in list
- Login → create invoice → verify in GST liability
- Error case: post unbalanced entry, verify error message
- Boundary: special characters in narration fields
- Multi-tab: verify optimistic UI updates correctly

Run against dedicated Railway preview deployment or local Next.js with seeded test database.

### Performance tests (3 days)

Load test using k6:

- 50 concurrent users creating journal entries (tests gapless numbering under load)
- 100 concurrent users viewing dashboard (tests query performance)
- Projector processing 10,000 historical events (tests catch-up speed)

Baselines: P95 < 500ms API, projector > 1000 events/sec, zero duplicate entry numbers under load.

---

## Gap Analysis

### Missing features from the spec

- `pending_close` fiscal year state (spec §4.8) — only `open` and `closed` exist
- 90-day grace period + 30-day hard deadline auto-close mechanism
- Nightly `verify_projection` job (spec §5.3) that recomputes balances from event store

### Documentation gaps

- No API documentation beyond tRPC router structure in spec
- No projector worker runbook (what to do when it stalls, how to re-project, how to fix drifted balance)
- No architecture diagram showing event flow: command → event store → projector → read model
- No deployment instructions for junior developers

### Configuration omissions

- No `.env.production` template or startup validation for required variables (missing `NEXTAUTH_SECRET` silently fails at login)
- No rate limiting configuration
- No CORS configuration — Dockerfile doesn't expose health check ports

### Operational concerns

- No centralized error tracking — when a user reports a bug, no way to find the corresponding error
- CI runs tests but not `pnpm audit` or container vulnerability scans
- PostgreSQL backup strategy undocumented (Railway has automated backups, but restoration procedures unwritten)
- No SLI/SLO tracking or alerting for projector worker — if it stalls, system silently serves stale data

---

## Production Readiness Checklist

- [ ] **Environment parity**: `docker-compose.yml` mirroring Railway production (PostgreSQL 16 + Redis 7 + Next.js + projector worker)
- [ ] **CI/CD hardening**: add `pnpm audit --audit-level=high`, container image scanning (Trivy/Snyk), DB migration as CI step
- [ ] **Version tagging**: automated semantic version tags, Docker image tags matching git tags, release notes from conventional commits
- [ ] **Rollback procedures**: documented steps `git revert` + `railway rollback`, migration rollback scripts for last 3 migrations, feature flags
- [ ] **Security hardening**: CSP headers in `next.config.js`, rate limiting via Redis, API key rotation schedule, CORS whitelist
- [ ] **Compliance**: GDPR/IT Act data retention (7-year rule), automated data anonymization on tenant deletion, admin audit log
- [ ] **Performance benchmarks**: Lighthouse CI (min 80 mobile, 90 desktop), API P95 < 500ms, bundle budgets < 150KB gzipped initial JS
- [ ] **Monitoring**: Sentry error tracking with source maps, DataDog/Grafana APM traces, uptime monitoring, dashboard for projector lag and event throughput
- [ ] **Alerting**: PagerDuty/Opsgenie for projector stall (>60s), error rate spike (>5%), DB pool exhaustion (>80%), cert expiry (>30 days)
- [ ] **Logging**: structured JSON (Pino), 30-day hot retention, 1-year cold, centralized search (Grafana Loki)

---

## Execution Guide

### Prerequisites

- Node.js 20+, pnpm 9.15+, Docker Desktop, Railway CLI (`npm i -g @railway/cli`)
- Access to `complianceos` Railway project (ask engineering lead for team invite)
- Clone repo, run `pnpm install` from root

### Required Tools

- VS Code with ESLint + Prettier extensions
- Database client: TablePlus or DBeaver
- API testing: Bruno or HTTPie
- Load testing: `brew install k6`
- Testing: Vitest (unit/integration), Playwright (E2E)

### Week 1 — Logging and Error Handling

1. Add Pino logger to `packages/server/src/lib/logger.ts` with request correlation ID support
2. Replace all `console.error` in server package with structured logger calls
3. Create `ErrorBoundary` component in `apps/web/components/ui/error-boundary.tsx`
4. Wrap each page segment in `apps/web/app/(app)/` with the boundary
5. Set up Sentry: create `sentry.client.config.ts` + `sentry.server.config.ts`, add `NEXT_PUBLIC_SENTRY_DSN` to Railway

Checkpoint: deploy to Railway staging, force an error in a page, confirm Sentry captures it with full stack trace.

### Week 2 — Database and API Hardening

1. Audit all Zod schemas in `packages/shared/src/validation/` — max lengths, precision, HTML stripping
2. Add idempotency to command handlers — check `(aggregate_id, sequence)` before appending
3. Add health check to projector worker (`GET /health` port 3100, 503 if no events in 60s)
4. Update Dockerfile to run `pnpm db:migrate` before starting server
5. Remove duplicate CSS utility classes from `globals.css`

Checkpoint: run `pnpm test` — all pass. Create entry via API, crash server mid-request, retry, confirm no duplicate.

### Week 3 — Tests

1. Unit tests for all Zod validation schemas (valid, invalid, boundary, edge cases)
2. Integration tests for event store (create → post → read projection → verify balance)
3. Integration tests for multi-tenant isolation
4. Integration tests for gapless numbering under concurrency
5. Playwright E2E tests for create → post → verify flow
6. k6 load test scripts for concurrent journal entry creation

Checkpoint: `k6 run scripts/load-test.js` — P95 < 500ms at 50 concurrent users, zero duplicate entry numbers, no gaps.

### Week 4 — Production Hardening

1. Implement `pending_close` FY state and auto-close mechanism per spec §4.8
2. Create nightly `verify_projection` job
3. Add CSP headers, rate limiting, CORS to Next.js
4. Create `docker-compose.yml` for local dev
5. Document rollback procedures in `docs/rollback.md`
6. Add env var validation at startup — fail fast with clear message
7. Run `pnpm audit --audit-level=high`, fix reported vulnerabilities

Checkpoint: `docker-compose up` — local env starts without errors. Test rollback: deploy bad migration, run rollback script, confirm data intact.

### Escalation Paths

- **Internal docs**: `docs/` for guides, especially `docs/superpowers/specs/` and `docs/superpowers/plans/`
- **GitHub Issues**: search repo for related issues
- **Senior frontend engineer**: React/Next.js/tRPC — @kiran in #frontend Slack
- **Senior backend engineer**: database/event sourcing/projector — @arjun in #backend Slack
- **DevOps lead**: Docker/Railway/CI-CD — @priya in #infra Slack
- **P0 incidents**: escalate to engineering lead + CTO immediately regardless of time. On-call rotation in `docs/oncall.md`. For migration data corruption: stop deploys, restore from Railway automated backup (procedure in `docs/disaster-recovery.md`).
