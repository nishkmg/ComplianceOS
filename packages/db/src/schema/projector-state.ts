import {
  pgTable, uuid, text, timestamp,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";

export const projectorState = pgTable("projector_state", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  projectorName: text("projector_name").notNull(),
  lastProcessedSequence: text("last_processed_sequence").default("0").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("projector_state_tenant_name_unique").on(table.tenantId, table.projectorName),
  index("projector_state_tenant_idx").on(table.tenantId),
]);

export const reportCacheVersions = pgTable("report_cache_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  fiscalYear: text("fiscal_year").notNull(),
  cacheVersion: text("cache_version").default("0").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("report_cache_versions_tenant_fy_unique").on(table.tenantId, table.fiscalYear),
]);
