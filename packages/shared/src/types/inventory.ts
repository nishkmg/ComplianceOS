import { z } from "zod";

export const InventoryLayerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  productId: z.string().uuid(),
  warehouseId: z.string().uuid().nullable(),
  batchNumber: z.string().nullable(),
  quantity: z.string(),
  remainingQuantity: z.string(),
  unitCost: z.string(),
  totalValue: z.string(),
  receiptDate: z.string(),
  createdAt: z.date(),
});

export const StockMovementSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  productId: z.string().uuid(),
  warehouseId: z.string().uuid().nullable(),
  movementType: z.enum(["purchase_receipt", "sales_delivery", "stock_adjustment", "warehouse_transfer", "opening_balance"]),
  quantity: z.string(),
  unitCost: z.string().nullable(),
  totalValue: z.string().nullable(),
  referenceType: z.string().nullable(),
  referenceId: z.string().uuid().nullable(),
  narration: z.string().nullable(),
  createdById: z.string().uuid(),
  createdAt: z.date(),
});

export const CreatePurchaseReceiptInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  unitCost: z.number().positive(),
  batchNumber: z.string().optional(),
  receiptDate: z.string(),
  warehouseId: z.string().uuid().optional(),
  narration: z.string().optional(),
});

export const CreateSalesDeliveryInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  warehouseId: z.string().uuid().optional(),
  narration: z.string().optional(),
});

export type InventoryLayer = z.infer<typeof InventoryLayerSchema>;
export type StockMovement = z.infer<typeof StockMovementSchema>;
export type CreatePurchaseReceiptInput = z.infer<typeof CreatePurchaseReceiptInputSchema>;
export type CreateSalesDeliveryInput = z.infer<typeof CreateSalesDeliveryInputSchema>;
