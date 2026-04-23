"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itrConfig = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const tenants_1 = require("./tenants");
exports.itrConfig = (0, pg_core_1.pgTable)("itr_config", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull().references(() => tenants_1.tenants.id),
    taxRegime: (0, enums_1.taxRegimeEnum)("tax_regime").notNull(),
    presumptiveScheme: (0, enums_1.presumptiveSchemeEnum)("presumptive_scheme").notNull().default("none"),
    presumptiveRate: (0, pg_core_1.numeric)("presumptive_rate", { precision: 5, scale: 2 }).default("0"),
    eligibleDeductions: (0, pg_core_1.jsonb)("eligible_deductions").default({}).notNull(),
    tdsApplicable: (0, pg_core_1.text)("tds_applicable").notNull().default("false"),
    advanceTaxApplicable: (0, pg_core_1.text)("advance_tax_applicable").notNull().default("false"),
    regimeOptOutDate: (0, pg_core_1.date)("regime_opt_out_date"),
    regimeLockinUntil: (0, pg_core_1.date)("regime_lockin_until"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("itr_config_tenant_id_unique").on(table.tenantId),
    (0, pg_core_1.index)("itr_config_tenant_id_idx").on(table.tenantId),
]);
//# sourceMappingURL=itr-config.js.map