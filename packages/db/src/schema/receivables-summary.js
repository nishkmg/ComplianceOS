"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receivablesSummary = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.receivablesSummary = (0, pg_core_1.pgTable)("receivables_summary", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    customerName: (0, pg_core_1.text)("customer_name").notNull(),
    customerGstin: (0, pg_core_1.text)("customer_gstin"),
    totalOutstanding: (0, pg_core_1.numeric)("total_outstanding", { precision: 18, scale: 2 }).notNull(),
    current030: (0, pg_core_1.numeric)("current_0_30", { precision: 18, scale: 2 }).notNull(),
    aging3160: (0, pg_core_1.numeric)("aging_31_60", { precision: 18, scale: 2 }).notNull(),
    aging6190: (0, pg_core_1.numeric)("aging_61_90", { precision: 18, scale: 2 }).notNull(),
    aging90Plus: (0, pg_core_1.numeric)("aging_90_plus", { precision: 18, scale: 2 }).notNull(),
    lastPaymentDate: (0, pg_core_1.date)("last_payment_date"),
    lastPaymentAmount: (0, pg_core_1.numeric)("last_payment_amount", { precision: 18, scale: 2 }),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("receivables_summary_tenant_id_customer_name_unique").on(table.tenantId, table.customerName),
]);
//# sourceMappingURL=receivables-summary.js.map