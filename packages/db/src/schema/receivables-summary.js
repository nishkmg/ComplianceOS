import { pgTable, uuid, text, numeric, date, uniqueIndex, } from "drizzle-orm/pg-core";
export const receivablesSummary = pgTable("receivables_summary", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    customerName: text("customer_name").notNull(),
    customerGstin: text("customer_gstin"),
    totalOutstanding: numeric("total_outstanding", { precision: 18, scale: 2 }).notNull(),
    current030: numeric("current_0_30", { precision: 18, scale: 2 }).notNull(),
    aging3160: numeric("aging_31_60", { precision: 18, scale: 2 }).notNull(),
    aging6190: numeric("aging_61_90", { precision: 18, scale: 2 }).notNull(),
    aging90Plus: numeric("aging_90_plus", { precision: 18, scale: 2 }).notNull(),
    lastPaymentDate: date("last_payment_date"),
    lastPaymentAmount: numeric("last_payment_amount", { precision: 18, scale: 2 }),
}, (table) => [
    uniqueIndex("receivables_summary_tenant_id_customer_name_unique").on(table.tenantId, table.customerName),
]);
//# sourceMappingURL=receivables-summary.js.map