import {
  pgTable, uuid, text, timestamp, jsonb,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const itrSnapshots = pgTable("itr_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  returnId: uuid("return_id"),
  financialYear: text("financial_year").notNull(),
  snapshotType: text("snapshot_type").notNull(),
  snapshotData: jsonb("snapshot_data").notNull().default({}),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("itr_snapshots_tenant_id_fy_type_idx").on(table.tenantId, table.financialYear, table.snapshotType),
]);
