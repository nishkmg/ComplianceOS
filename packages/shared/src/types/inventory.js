"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSalesDeliveryInputSchema = exports.CreatePurchaseReceiptInputSchema = exports.StockMovementSchema = exports.InventoryLayerSchema = void 0;
const zod_1 = require("zod");
exports.InventoryLayerSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid(),
    warehouseId: zod_1.z.string().uuid().nullable(),
    batchNumber: zod_1.z.string().nullable(),
    quantity: zod_1.z.string(),
    remainingQuantity: zod_1.z.string(),
    unitCost: zod_1.z.string(),
    totalValue: zod_1.z.string(),
    receiptDate: zod_1.z.string(),
    createdAt: zod_1.z.date(),
});
exports.StockMovementSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid(),
    warehouseId: zod_1.z.string().uuid().nullable(),
    movementType: zod_1.z.enum(["purchase_receipt", "sales_delivery", "stock_adjustment", "warehouse_transfer", "opening_balance"]),
    quantity: zod_1.z.string(),
    unitCost: zod_1.z.string().nullable(),
    totalValue: zod_1.z.string().nullable(),
    referenceType: zod_1.z.string().nullable(),
    referenceId: zod_1.z.string().uuid().nullable(),
    narration: zod_1.z.string().nullable(),
    createdById: zod_1.z.string().uuid(),
    createdAt: zod_1.z.date(),
});
exports.CreatePurchaseReceiptInputSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().positive(),
    unitCost: zod_1.z.number().positive(),
    batchNumber: zod_1.z.string().optional(),
    receiptDate: zod_1.z.string(),
    warehouseId: zod_1.z.string().uuid().optional(),
    narration: zod_1.z.string().optional(),
});
exports.CreateSalesDeliveryInputSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().positive(),
    warehouseId: zod_1.z.string().uuid().optional(),
    narration: zod_1.z.string().optional(),
    cogsAccountId: zod_1.z.string().uuid(),
    inventoryAssetAccountId: zod_1.z.string().uuid(),
});
//# sourceMappingURL=inventory.js.map