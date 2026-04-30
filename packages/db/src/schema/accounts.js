import { pgTable, uuid, text, boolean, timestamp, uniqueIndex, index, foreignKey, } from "drizzle-orm/pg-core";
import { accountKindEnum, accountSubTypeEnum, tagEnum, reconciliationAccountEnum, cashFlowCategoryEnum, } from "./enums";
export const accounts = pgTable("accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    kind: accountKindEnum("kind").notNull(),
    subType: accountSubTypeEnum("sub_type").notNull(),
    parentId: uuid("parent_id"),
    isSystem: boolean("is_system").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isLeaf: boolean("is_leaf").default(true).notNull(),
    reconciliationAccount: reconciliationAccountEnum("reconciliation_account").default("none").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    uniqueIndex("accounts_tenant_id_code_unique").on(table.tenantId, table.code),
    index("accounts_tenant_id_is_leaf_idx").on(table.tenantId, table.isLeaf),
    foreignKey({ columns: [table.parentId], foreignColumns: [table.id], name: "accounts_parent_id_fk" }),
]);
export const accountTags = pgTable("account_tags", {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id").notNull().references(() => accounts.id),
    tag: tagEnum("tag").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    uniqueIndex("account_tags_account_id_tag_unique").on(table.accountId, table.tag),
]);
export const cashFlowDefaultMapping = pgTable("cash_flow_default_mapping", {
    id: uuid("id").defaultRandom().primaryKey(),
    subType: accountSubTypeEnum("sub_type").notNull(),
    cashFlowCategory: cashFlowCategoryEnum("cash_flow_category").notNull(),
}, (table) => [
    uniqueIndex("cash_flow_default_mapping_sub_type_unique").on(table.subType),
]);
export const accountCashFlowOverrides = pgTable("account_cash_flow_overrides", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    accountId: uuid("account_id").notNull().references(() => accounts.id),
    cashFlowCategory: cashFlowCategoryEnum("cash_flow_category").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    uniqueIndex("account_cash_flow_overrides_tenant_id_account_id_unique").on(table.tenantId, table.accountId),
]);
//# sourceMappingURL=accounts.js.map