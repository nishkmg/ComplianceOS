import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

/**
 * Login/signup attempt limiting (DB-backed — serverless-safe, unlike the old
 * in-memory map). No tenant_id: this is global auth-state, RLS intentionally
 * skipped (documented exception in rls-coverage.test.ts).
 */
export const loginAttempts = pgTable("login_attempts", {
  email: text("email").notNull(),
  ip: text("ip").notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [{
  pk: { name: "login_attempts_pk", columns: [t.email, t.ip] },
}]);

export type LoginAttempt = typeof loginAttempts.$inferSelect;
