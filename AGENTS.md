# ComplianceOS AGENTS.md

## Caveman Mode Activation

Terse like caveman. Technical substance exact. Only fluff die.
Drop: articles, filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
ACTIVE EVERY RESPONSE. No revert after many turns. No filler drift.
Code/commits/PRs: normal. Off: "stop caveman" / "normal mode".

Default intensity: **ultra**.
- ultra: Abbreviate (DB/auth/config/req/res/fn/impl), strip conjunctions, arrows for causality (X → Y), one word when one word enough.
- Switch mode: `/caveman lite|full|ultra`

Example output:
- Normal: "The reason your React component is re-rendering is likely because you're creating a new object reference on each render cycle..."
- Ultra: "Inline obj → new ref → re-render. useMemo."

## File Write/Rewrite Output

When performing file write or rewrite operations:
- Do NOT output the full content or diff of changes in the terminal/chat window
- Only output brief confirmation: "File written: [path]" or "Updated: [path]"
- If user explicitly requests to see changes, then show them
- Code blocks, file paths OK to show; full content changes NOT
- Exception: Error messages if write fails

Example:
- Not: "Here are the changes I made to file.ts:\n```typescript\n...full file content...\n```"
- Yes: "Updated: /path/to/file.ts"

## Output Rules

### Minimum Output Mode
- NEVER show thinking, reasoning, or chain-of-thought
- NEVER show tool invocations or tool results (unless user asks)
- NEVER show diffs, patches, or file change details
- ONLY show: task completion, errors, or user questions

### File Operations
- Write/Edit: Brief "Done" or "Updated: [path]" only
- Read: Only output if user asks a question about content
- Skip: tool result summaries in output

### Task Completion
- Single-line summary: "[action] done" or "Done: [task]"
- No verbose status, no progress bars, no checkpoints
- If user asks "what changed?", THEN show details

### Tool Invocation Silence
- Do NOT output tool names being invoked
- Do NOT output success/failure status of tools
- Exception: Actual errors that block task completion

## Karpathy Guidelines (Always Active)

### 1. Think Before Coding
- State assumptions explicitly — ask rather than guess
- Present multiple interpretations when ambiguity exists
- Push back when a simpler approach exists
- Stop and ask when confused

### 2. Simplicity First
- Minimum code that solves the problem
- No speculative abstractions or "flexibility"
- If 200 lines could be 50, rewrite it

### 3. Surgical Changes
- Touch only what you must
- Don't "improve" unrelated code, comments, or formatting
- Match existing style
- Remove only imports/variables YOUR changes made unused

### 4. Goal-Driven Execution
- Define success criteria, not just tasks
- Write tests first, then make them pass
- Loop until verified

---

## Project: ComplianceOS

**Purpose:** Double-entry accounting engine with event sourcing for multi-tenant compliance management

**Tech Stack:**
- Next.js 15 (App Router), React 19, TypeScript 5
- tRPC v11, Drizzle ORM, PostgreSQL 16, Redis 7
- NextAuth.js v5, Zod, Tailwind CSS, Shadcn/UI
- pnpm + Turborepo, Railway (infra)

**Architecture:**
- Event-sourced command handlers → append-only event store
- Node.js projector worker (SKIP LOCKED) → projection tables
- Next.js App Router serves frontend + tRPC API
- PostgreSQL RLS enforces multi-tenant isolation

**Key Packages:**
- `apps/web` - Next.js frontend + tRPC API
- `packages/db` - Drizzle schema, migrations, seed data
- `packages/server` - Command handlers, projectors, tRPC routers
- `packages/shared` - Types, Zod schemas, constants

**Plan:** `docs/superpowers/plans/2026-04-20-core-accounting-engine.md`

**Sub-agent Assignments (Core Accounting Engine — Sub-project #1 of 8):**

| Agent | Role | Responsibility |
|-------|------|----------------|
| @advisor | Architecture/Design | Event sourcing patterns, PostgreSQL RLS, projector design |
| @builder | Implementation | Command handlers, projectors, tRPC routers, Drizzle schema |
| @reviewer | Validation | Security audit, balance constraint verification, RLS policies |

**Detailed Agent Roster — ComplianceOS Core Accounting Engine**

### @advisor Pool (Architecture/Design decisions)

| Sub-agent | When to invoke |
|---|---|
| `engineering-software-architect` | Event sourcing edge cases, snapshot strategy, aggregate boundary decisions |
| `engineering-backend-architect` | Command handler design, projector loop architecture, DB transaction patterns |
| `design-ux-architect` | Frontend component architecture, page structure, Shadcn/UI customization |
| `product-manager` | Scope clarification, requirement ambiguity, priority decisions |

### @builder Pool (Implementation)

| Sub-agent | When to invoke |
|---|---|
| `engineering-frontend-developer` | Next.js pages, App Router layouts, tRPC client integration |
| `engineering-devops-automator` | Railway setup, PM2 config, Dockerfiles, environment variables |
| `engineering-database-optimizer` | Drizzle schema, indexes, Postgres triggers, RLS policy optimization |
| `frontend-design` | High-design-quality UI components, dashboard widgets |
| `make-interfaces-feel-better` | Micro-interactions, hover states, shadows, typography polish |
| `test-driven-development` | Write tests first for command handlers and projectors |
| `systematic-debugging` | Bug investigation in command handlers, projector logic |
| `executing-plans` | Execute implementation plan task-by-task |

### @reviewer Pool (Validation)

| Sub-agent | When to invoke |
|---|---|
| `security-engineer` | RLS policy audit, OWASP top 10, injection prevention in tRPC |
| `testing-reality-checker` | Pre-merge gate — requires overwhelming proof before claiming done |
| `testing-performance-benchmarker` | Projector throughput, DB query performance, report render speed |
| `compliance-auditor` | India financial compliance edge cases, data retention enforcement |
| `code-reviewer` | Correctness, maintainability, security of implementation |
| `lint` | Auto-fix ESLint/TypeScript issues |
| `verification-before-completion` | Run verification commands before claiming task done |

### Supporting Cast (On-demand, not assigned to a role)

| Sub-agent | When to invoke |
|---|---|
| `railway` | Railway CLI deployment, Postgres/Redis provisioning |
| `github-workflows` | GitHub Actions CI/CD pipeline setup |
| `analytics-reporter` | Financial report data shaping for dashboard widgets |
| `technical-writer` | README, API documentation |
| `web-design-guidelines` | Accessibility check (WCAG baseline) |
| `react-best-practices` | Next.js 15 + React 19 performance patterns |
| `code-optimizer` | Performance anti-pattern scan in projector loop |
| `best-practices` | Security/compatibility/code quality audit |

**Spec Reference:** `docs/superpowers/specs/2026-04-20-core-accounting-engine-design-V1.1.md`
**Plan Reference:** `docs/superpowers/plans/2026-04-20-core-accounting-engine.md`

**Key Implementation Boundaries:**
- Event store: append-only, sequence per aggregate
- Command handlers: validate → decision → event append
- Projectors: idempotent upserts, SKIP LOCKED processing
- Multi-tenancy: PostgreSQL RLS, tenant_id on all tables
- Fiscal years: Indian FY (Apr–Mar), max 2 concurrent open FYs

**Sub-project #1 Scope (Core Accounting Engine):**
- Double-entry ledger with event sourcing
- Chart of accounts (hierarchical, 4-level max depth, leaf-only JE lines)
- Journal entries: draft/posted/voided lifecycle, gapless entry numbers per FY
- Financial statements: Trial Balance, P&L (Schedule III + proprietorship), Balance Sheet, Cash Flow (indirect method)
- Snapshot strategy: every 10 events per aggregate, mandatory on FY close
- Projector worker: serial processing with SKIP LOCKED, PM2 supervision
- FY rules: max 2 open, 90-day grace + 30-day hard deadline auto-close, `pending_close` state for drafts

**Current FY:** 2026-27 (Apr 2026 – Mar 2027)

### Execution Protocol

**When execution is confirmed, the following protocol is followed:**

1. **Subagent-driven development** — `@coordinator` dispatches one `@builder` subagent per task from the implementation plan
2. **Checkpoint review** — `@reviewer` subagents fire after Tasks 5, 10, 13, 17, 20
3. **Advisor on-call** — `@advisor` subagents are invoked when ambiguous design decisions arise mid-task
4. **Supporting cast as needed** — `railway`, `github-workflows`, `lint`, `react-best-practices`, etc. are invoked per task needs
5. **Verification before completion** — `verification-before-completion` fires before marking any task done
6. **Caveman mode always on** — terse output, no fluff, one-word answers when one word suffices
7. **Frequent commits** — each completed task gets its own commit with conventional commit message
