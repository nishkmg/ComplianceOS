import { pgTable, uuid, text, date, timestamp, uniqueIndex, index, } from "drizzle-orm/pg-core";
import { fyStatusEnum } from "./enums";
export const fiscalYears = pgTable("fiscal_years", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    year: text("year").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: fyStatusEnum("status").default("open").notNull(),
    closedBy: uuid("closed_by"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
}, (table) => [
    uniqueIndex("fiscal_years_tenant_id_year_unique").on(table.tenantId, table.year),
    index("fiscal_years_tenant_status_idx").on(table.tenantId, table.status),
]);
export const entryNumberCounters = pgTable("entry_number_counters", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    fiscalYear: text("fiscal_year").notNull(),
    nextVal: text("next_val").default("1").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    uniqueIndex("entry_number_counters_tenant_fy_unique").on(table.tenantId, table.fiscalYear),
]);
//# sourceMappingURL=fiscal-years.js.map