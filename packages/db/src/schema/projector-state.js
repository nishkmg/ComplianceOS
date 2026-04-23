"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportCacheVersions = exports.projectorState = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.projectorState = (0, pg_core_1.pgTable)("projector_state", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    projectorName: (0, pg_core_1.text)("projector_name").notNull(),
    lastProcessedSequence: (0, pg_core_1.text)("last_processed_sequence").default("0").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("projector_state_tenant_name_unique").on(table.tenantId, table.projectorName),
    (0, pg_core_1.index)("projector_state_tenant_idx").on(table.tenantId),
]);
exports.reportCacheVersions = (0, pg_core_1.pgTable)("report_cache_versions", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    fiscalYear: (0, pg_core_1.text)("fiscal_year").notNull(),
    cacheVersion: (0, pg_core_1.text)("cache_version").default("0").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("report_cache_versions_tenant_fy_unique").on(table.tenantId, table.fiscalYear),
]);
//# sourceMappingURL=projector-state.js.map