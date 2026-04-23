"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountCashFlowOverrides = exports.cashFlowDefaultMapping = exports.accountTags = exports.accounts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
exports.accounts = (0, pg_core_1.pgTable)("accounts", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    code: (0, pg_core_1.text)("code").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    kind: (0, enums_1.accountKindEnum)("kind").notNull(),
    subType: (0, enums_1.accountSubTypeEnum)("sub_type").notNull(),
    parentId: (0, pg_core_1.uuid)("parent_id"),
    isSystem: (0, pg_core_1.boolean)("is_system").default(false).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    isLeaf: (0, pg_core_1.boolean)("is_leaf").default(true).notNull(),
    reconciliationAccount: (0, enums_1.reconciliationAccountEnum)("reconciliation_account").default("none").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("accounts_tenant_id_code_unique").on(table.tenantId, table.code),
    (0, pg_core_1.index)("accounts_tenant_id_is_leaf_idx").on(table.tenantId, table.isLeaf),
    (0, pg_core_1.foreignKey)({ columns: [table.parentId], foreignColumns: [table.id], name: "accounts_parent_id_fk" }),
]);
exports.accountTags = (0, pg_core_1.pgTable)("account_tags", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    accountId: (0, pg_core_1.uuid)("account_id").notNull().references(() => exports.accounts.id),
    tag: (0, enums_1.tagEnum)("tag").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("account_tags_account_id_tag_unique").on(table.accountId, table.tag),
]);
exports.cashFlowDefaultMapping = (0, pg_core_1.pgTable)("cash_flow_default_mapping", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    subType: (0, enums_1.accountSubTypeEnum)("sub_type").notNull(),
    cashFlowCategory: (0, enums_1.cashFlowCategoryEnum)("cash_flow_category").notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("cash_flow_default_mapping_sub_type_unique").on(table.subType),
]);
exports.accountCashFlowOverrides = (0, pg_core_1.pgTable)("account_cash_flow_overrides", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    accountId: (0, pg_core_1.uuid)("account_id").notNull().references(() => exports.accounts.id),
    cashFlowCategory: (0, enums_1.cashFlowCategoryEnum)("cash_flow_category").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("account_cash_flow_overrides_tenant_id_account_id_unique").on(table.tenantId, table.accountId),
]);
//# sourceMappingURL=accounts.js.map