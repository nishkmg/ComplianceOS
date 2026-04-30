import { z } from "zod";
export declare const InventoryLayerSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    productId: z.ZodString;
    warehouseId: z.ZodNullable<z.ZodString>;
    batchNumber: z.ZodNullable<z.ZodString>;
    quantity: z.ZodString;
    remainingQuantity: z.ZodString;
    unitCost: z.ZodString;
    totalValue: z.ZodString;
    receiptDate: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId?: string;
    id?: string;
    createdAt?: Date;
    quantity?: string;
    productId?: string;
    warehouseId?: string;
    batchNumber?: string;
    remainingQuantity?: string;
    unitCost?: string;
    totalValue?: string;
    receiptDate?: string;
}, {
    tenantId?: string;
    id?: string;
    createdAt?: Date;
    quantity?: string;
    productId?: string;
    warehouseId?: string;
    batchNumber?: string;
    remainingQuantity?: string;
    unitCost?: string;
    totalValue?: string;
    receiptDate?: string;
}>;
export declare const StockMovementSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    productId: z.ZodString;
    warehouseId: z.ZodNullable<z.ZodString>;
    movementType: z.ZodEnum<["purchase_receipt", "sales_delivery", "stock_adjustment", "warehouse_transfer", "opening_balance"]>;
    quantity: z.ZodString;
    unitCost: z.ZodNullable<z.ZodString>;
    totalValue: z.ZodNullable<z.ZodString>;
    referenceType: z.ZodNullable<z.ZodString>;
    referenceId: z.ZodNullable<z.ZodString>;
    narration: z.ZodNullable<z.ZodString>;
    createdById: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId?: string;
    id?: string;
    createdAt?: Date;
    narration?: string;
    referenceType?: string;
    referenceId?: string;
    quantity?: string;
    productId?: string;
    warehouseId?: string;
    unitCost?: string;
    totalValue?: string;
    movementType?: "opening_balance" | "purchase_receipt" | "sales_delivery" | "stock_adjustment" | "warehouse_transfer";
    createdById?: string;
}, {
    tenantId?: string;
    id?: string;
    createdAt?: Date;
    narration?: string;
    referenceType?: string;
    referenceId?: string;
    quantity?: string;
    productId?: string;
    warehouseId?: string;
    unitCost?: string;
    totalValue?: string;
    movementType?: "opening_balance" | "purchase_receipt" | "sales_delivery" | "stock_adjustment" | "warehouse_transfer";
    createdById?: string;
}>;
export declare const CreatePurchaseReceiptInputSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    unitCost: z.ZodNumber;
    batchNumber: z.ZodOptional<z.ZodString>;
    receiptDate: z.ZodString;
    warehouseId: z.ZodOptional<z.ZodString>;
    narration: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    narration?: string;
    quantity?: number;
    productId?: string;
    warehouseId?: string;
    batchNumber?: string;
    unitCost?: number;
    receiptDate?: string;
}, {
    narration?: string;
    quantity?: number;
    productId?: string;
    warehouseId?: string;
    batchNumber?: string;
    unitCost?: number;
    receiptDate?: string;
}>;
export declare const CreateSalesDeliveryInputSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    warehouseId: z.ZodOptional<z.ZodString>;
    narration: z.ZodOptional<z.ZodString>;
    cogsAccountId: z.ZodString;
    inventoryAssetAccountId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    narration?: string;
    quantity?: number;
    productId?: string;
    warehouseId?: string;
    inventoryAssetAccountId?: string;
    cogsAccountId?: string;
}, {
    narration?: string;
    quantity?: number;
    productId?: string;
    warehouseId?: string;
    inventoryAssetAccountId?: string;
    cogsAccountId?: string;
}>;
export type InventoryLayer = z.infer<typeof InventoryLayerSchema>;
export type StockMovement = z.infer<typeof StockMovementSchema>;
export type CreatePurchaseReceiptInput = z.infer<typeof CreatePurchaseReceiptInputSchema>;
export type CreateSalesDeliveryInput = z.infer<typeof CreateSalesDeliveryInputSchema>;
//# sourceMappingURL=inventory.d.ts.map