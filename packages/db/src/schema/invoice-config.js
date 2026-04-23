"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceConfig = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.invoiceConfig = (0, pg_core_1.pgTable)("invoice_config", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    prefix: (0, pg_core_1.text)("prefix").notNull().default("INV"),
    nextNumber: (0, pg_core_1.bigint)("next_number", { mode: "number" }).notNull().default(1),
    logoUrl: (0, pg_core_1.text)("logo_url"),
    companyName: (0, pg_core_1.text)("company_name"),
    companyAddress: (0, pg_core_1.text)("company_address"),
    companyGstin: (0, pg_core_1.text)("company_gstin"),
    paymentTerms: (0, pg_core_1.text)("payment_terms"),
    bankDetails: (0, pg_core_1.jsonb)("bank_details"),
    notes: (0, pg_core_1.text)("notes"),
    terms: (0, pg_core_1.text)("terms"),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("invoice_config_tenant_id_unique").on(table.tenantId),
]);
//# sourceMappingURL=invoice-config.js.map