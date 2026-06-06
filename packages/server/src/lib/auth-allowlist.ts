/**
 * Service-role (Supabase SERVICE_ROLE_KEY) usage whitelist.
 *
 * The service-role key bypasses Postgres Row Level Security (RLS). For this
 * reason, it must never appear on any user-facing request path. It is only
 * permitted in the following server-side workers / services, which run
 * out-of-band with no direct user input.
 *
 * ALLOWED
 * - packages/server/src/projectors/worker.ts        — event projector loop
 * - packages/server/src/services/email-queue.ts     — outbound email worker
 * - packages/server/src/services/file-upload.ts     — Supabase Storage driver
 *                                                    (signed object reads/writes
 *                                                    are not gated by RLS)
 *
 * DENIED
 * - Anything under apps/web/**                       — Next.js app routes
 * - Any tRPC router in packages/server/src/routers/**
 * - Any HTTP API route handler
 *
 * ENFORCEMENT
 * - CI grep gate in .github/workflows/security-gate.yml fails the build if
 *   `SERVICE_ROLE_KEY` appears in apps/web/**.
 * - Code review must reject any new SERVICE_ROLE_KEY reference in
 *   apps/web/ or packages/server/src/routers/**.
 */
export const SERVICE_ROLE_ALLOWLIST = [
  "packages/server/src/projectors/worker.ts",
  "packages/server/src/services/email-queue.ts",
  "packages/server/src/services/file-upload.ts",
] as const;

export const SERVICE_ROLE_DENY_PREFIXES = [
  "apps/web/",
  "packages/server/src/routers/",
  "packages/server/src/commands/",
] as const;
