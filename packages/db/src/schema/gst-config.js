"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gstrTableMappings = exports.gstConfig = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
exports.gstConfig = (0, pg_core_1.pgTable)("gst_config", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    gstin: (0, pg_core_1.text)("gstin").notNull(),
    legalName: (0, pg_core_1.text)("legal_name").notNull(),
    tradeName: (0, pg_core_1.text)("trade_name"),
    registrationDate: (0, pg_core_1.timestamp)("registration_date", { withTimezone: true }),
    stateCode: (0, pg_core_1.text)("state_code").notNull(),
    stateName: (0, pg_core_1.text)("state_name").notNull(),
    businessType: (0, pg_core_1.text)("business_type").notNull(),
    taxpayerType: (0, pg_core_1.text)("taxpayer_type").notNull(),
    filingFrequency: (0, pg_core_1.text)("filing_frequency").notNull(),
    isCompositionDealer: (0, pg_core_1.boolean)("is_composition_dealer").default(false),
    compositionLimit: (0, pg_core_1.numeric)("composition_limit", { precision: 18, scale: 2 }),
    aggregateTurnover: (0, pg_core_1.numeric)("aggregate_turnover", { precision: 18, scale: 2 }).default("0"),
    principalPlaceOfBusiness: (0, pg_core_1.text)("principal_place_of_business"),
    additionalPlacesOfBusiness: (0, pg_core_1.jsonb)("additional_places_of_business"),
    authorizedSignatory: (0, pg_core_1.text)("authorized_signatory"),
    email: (0, pg_core_1.text)("email"),
    phone: (0, pg_core_1.text)("phone"),
    mobile: (0, pg_core_1.text)("mobile"),
    apiCredentials: (0, pg_core_1.jsonb)("api_credentials"),
    isApiEnabled: (0, pg_core_1.boolean)("is_api_enabled").default(false),
    lastSyncAt: (0, pg_core_1.timestamp)("last_sync_at", { withTimezone: true }),
    createdBy: (0, pg_core_1.uuid)("created_by").notNull().references(() => users_1.users.id),
    updatedBy: (0, pg_core_1.uuid)("updated_by").references(() => users_1.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("gst_config_tenant_id_unique").on(table.tenantId),
    (0, pg_core_1.index)("gst_config_gstin_idx").on(table.gstin),
]);
exports.gstrTableMappings = (0, pg_core_1.pgTable)("gstr_table_mappings", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    returnType: (0, pg_core_1.text)("return_type").notNull(),
    tableNumber: (0, pg_core_1.text)("table_number").notNull(),
    tableDescription: (0, pg_core_1.text)("table_description").notNull(),
    accountIds: (0, pg_core_1.jsonb)("account_ids"),
    taxRate: (0, pg_core_1.numeric)("tax_rate", { precision: 5, scale: 2 }),
    taxType: (0, pg_core_1.text)("tax_type"),
    placeOfSupply: (0, pg_core_1.text)("place_of_supply"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdBy: (0, pg_core_1.uuid)("created_by").notNull().references(() => users_1.users.id),
    updatedBy: (0, pg_core_1.uuid)("updated_by").references(() => users_1.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("gstr_table_mappings_tenant_return_table_unique").on(table.tenantId, table.returnType, table.tableNumber),
    (0, pg_core_1.index)("gstr_table_mappings_return_type_idx").on(table.returnType),
]);
//# sourceMappingURL=gst-config.js.map