"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantModuleConfig = exports.tenants = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
exports.tenants = (0, pg_core_1.pgTable)("tenants", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    legalName: (0, pg_core_1.text)("legal_name"),
    businessType: (0, enums_1.businessTypeEnum)("business_type"),
    pan: (0, pg_core_1.text)("pan").notNull(),
    gstin: (0, pg_core_1.text)("gstin"),
    address: (0, pg_core_1.text)("address").notNull(),
    state: (0, enums_1.stateEnum)("state").notNull(),
    industry: (0, enums_1.industryEnum)("industry"),
    gstRegistration: (0, enums_1.gstRegistrationEnum)("gst_registration"),
    onboardingStatus: (0, pg_core_1.text)("onboarding_status").notNull().default("in_progress"),
    dateOfIncorporation: (0, pg_core_1.date)("date_of_incorporation"),
    onboardingData: (0, pg_core_1.jsonb)("onboarding_data").default({}).notNull(),
    gstConfig: (0, pg_core_1.jsonb)("gst_config").default({}).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
exports.tenantModuleConfig = (0, pg_core_1.pgTable)("tenant_module_config", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull().references(() => exports.tenants.id),
    module: (0, enums_1.moduleEnum)("module").notNull(),
    enabled: (0, pg_core_1.text)("enabled").notNull().default("false"),
    config: (0, pg_core_1.jsonb)("config").default({}),
    setBy: (0, enums_1.setByEnum)("set_by").default("auto"),
}, (table) => ({
    tenantModuleUnique: { fields: [table.tenantId, table.module], name: "tenant_module_config_tenant_id_module_unique" },
}));
//# sourceMappingURL=tenants.js.map