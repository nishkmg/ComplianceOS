"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itrSnapshots = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.itrSnapshots = (0, pg_core_1.pgTable)("itr_snapshots", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    returnId: (0, pg_core_1.uuid)("return_id"),
    financialYear: (0, pg_core_1.text)("financial_year").notNull(),
    snapshotType: (0, pg_core_1.text)("snapshot_type").notNull(),
    snapshotData: (0, pg_core_1.jsonb)("snapshot_data").notNull().default({}),
    generatedAt: (0, pg_core_1.timestamp)("generated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("itr_snapshots_tenant_id_fy_type_idx").on(table.tenantId, table.financialYear, table.snapshotType),
]);
//# sourceMappingURL=itr-snapshots.js.map