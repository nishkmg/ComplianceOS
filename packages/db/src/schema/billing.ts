import { pgTable, uuid, text, bigint, timestamp } from "drizzle-orm/pg-core";
import { tenantPlanEnum } from "./tenants";

/**
 * Subscription state per tenant — the billing record behind the plan
 * column on tenants. Populated by the payment provider webhook (B4);
 * the tenants.plan column is the fast read path, this is the audit trail.
 */
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  plan: tenantPlanEnum("plan").notNull(),
  status: text("status", { enum: ["active", "past_due", "canceled", "trialing"] }).notNull().default("active"),
  provider: text("provider").notNull().default("razorpay"),
  providerSubscriptionId: text("provider_subscription_id"),
  amountPaise: bigint("amount_paise", { mode: "number" }).notNull().default(0),
  currency: text("currency").notNull().default("INR"),
  period: text("period", { enum: ["monthly", "annual"] }).notNull().default("monthly"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
