"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryConfig = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
exports.inventoryConfig = (0, pg_core_1.pgTable)("inventory_config", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    valuationMethod: (0, enums_1.valuationMethodEnum)("valuation_method").notNull().default("fifo"),
    defaultWarehouseId: (0, pg_core_1.uuid)("default_warehouse_id"),
    autoCreateJE: (0, pg_core_1.boolean)("auto_create_je").notNull().default(true),
    inventoryAssetAccountId: (0, pg_core_1.uuid)("inventory_asset_account_id"),
    cogsAccountId: (0, pg_core_1.uuid)("cogs_account_id"),
    adjustmentAccountId: (0, pg_core_1.uuid)("adjustment_account_id"),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("inventory_config_tenant_id_unique").on(table.tenantId),
]);
//# sourceMappingURL=inventory-config.js.map