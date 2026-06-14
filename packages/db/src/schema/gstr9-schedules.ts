import {
  pgTable, uuid, text, numeric, integer, jsonb, timestamp, index,
} from "drizzle-orm/pg-core";

export const gstr9Schedules = pgTable("gstr9_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  returnId: uuid("return_id").notNull(),
  tenantId: uuid("tenant_id").notNull(),
  scheduleCode: text("schedule_code").notNull(),
  scheduleLabel: text("schedule_label").notNull(),
  totalTaxable: numeric("total_taxable", { precision: 15, scale: 2 }).default("0"),
  totalIgst: numeric("total_igst", { precision: 15, scale: 2 }).default("0"),
  totalCgst: numeric("total_cgst", { precision: 15, scale: 2 }).default("0"),
  totalSgst: numeric("total_sgst", { precision: 15, scale: 2 }).default("0"),
  totalCess: numeric("total_cess", { precision: 15, scale: 2 }).default("0"),
  lineCount: integer("line_count").default(0),
  data: jsonb("data").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_gstr9_schedules_return").on(table.returnId),
  index("idx_gstr9_schedules_tenant").on(table.tenantId),
]);
