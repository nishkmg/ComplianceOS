import { pgTable, uuid, boolean, uniqueIndex, } from "drizzle-orm/pg-core";
import { valuationMethodEnum } from "./enums";
export const inventoryConfig = pgTable("inventory_config", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    valuationMethod: valuationMethodEnum("valuation_method").notNull().default("fifo"),
    defaultWarehouseId: uuid("default_warehouse_id"),
    autoCreateJE: boolean("auto_create_je").notNull().default(true),
    inventoryAssetAccountId: uuid("inventory_asset_account_id"),
    cogsAccountId: uuid("cogs_account_id"),
    adjustmentAccountId: uuid("adjustment_account_id"),
}, (table) => [
    uniqueIndex("inventory_config_tenant_id_unique").on(table.tenantId),
]);
//# sourceMappingURL=inventory-config.js.map