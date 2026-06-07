import { pgTable, uuid, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const onboardingAuditLog = pgTable("onboarding_audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  stepNumber: integer("step_number").notNull(),
  stepKey: text("step_key").notNull(),
  action: text("action").notNull().default("save"),
  dataSnapshot: jsonb("data_snapshot").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
