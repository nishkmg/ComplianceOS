"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entryNumberCounters = exports.fiscalYears = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
exports.fiscalYears = (0, pg_core_1.pgTable)("fiscal_years", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    year: (0, pg_core_1.text)("year").notNull(),
    startDate: (0, pg_core_1.date)("start_date").notNull(),
    endDate: (0, pg_core_1.date)("end_date").notNull(),
    status: (0, enums_1.fyStatusEnum)("status").default("open").notNull(),
    closedBy: (0, pg_core_1.uuid)("closed_by"),
    closedAt: (0, pg_core_1.timestamp)("closed_at", { withTimezone: true }),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("fiscal_years_tenant_id_year_unique").on(table.tenantId, table.year),
    (0, pg_core_1.index)("fiscal_years_tenant_status_idx").on(table.tenantId, table.status),
]);
exports.entryNumberCounters = (0, pg_core_1.pgTable)("entry_number_counters", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    fiscalYear: (0, pg_core_1.text)("fiscal_year").notNull(),
    nextVal: (0, pg_core_1.text)("next_val").default("1").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("entry_number_counters_tenant_fy_unique").on(table.tenantId, table.fiscalYear),
]);
//# sourceMappingURL=fiscal-years.js.map