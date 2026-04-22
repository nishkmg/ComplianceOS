// packages/server/src/projectors/inventory-valuation.ts
import { eq, and } from "drizzle-orm";
import type { EventEnvelope, Projector } from "./types.js";
import { warehouseStock, inventoryLayers } from "@complianceos/db";

interface StockMovementPayload {
  productId: string;
  warehouseId?: string | null;
  movementType: string;
  quantity: string;
  unitCost?: string;
  totalValue?: string;
}

interface PurchaseReceiptPayload extends StockMovementPayload {
  layerId: string;
  batchNumber?: string;
  receiptDate: string;
}

async function handlePurchaseReceipt(event: EventEnvelope): Promise<void> {
  const payload = event.payload as unknown as PurchaseReceiptPayload;
  
  // Update warehouse stock - handled by FIFO service during command
  // Projector ensures consistency
  const whereConditions = [
    eq(warehouseStock.tenantId, event.tenantId),
    eq(warehouseStock.productId, payload.productId)
  ];
  
  if (payload.warehouseId) {
    whereConditions.push(eq(warehouseStock.warehouseId, payload.warehouseId));
  }
  
  const existing = await warehouseStock
    .select()
    .where(and(...whereConditions))
    .limit(1);
    
  if (existing.length === 0) {
    // Create new warehouse stock record
    await warehouseStock.insert({
      tenantId: event.tenantId,
      productId: payload.productId,
      warehouseId: payload.warehouseId ?? null,
      quantity: payload.quantity,
      weightedAverageCost: payload.unitCost ?? null,
      lastMovementAt: new Date(event.createdAt),
    });
  }
}

async function handleSalesDelivery(event: EventEnvelope): Promise<void> {
  const payload = event.payload as unknown as StockMovementPayload;
  
  // Update last movement timestamp
  const whereConditions = [
    eq(warehouseStock.tenantId, event.tenantId),
    eq(warehouseStock.productId, payload.productId)
  ];
  
  if (payload.warehouseId) {
    whereConditions.push(eq(warehouseStock.warehouseId, payload.warehouseId));
  }
  
  await warehouseStock
    .update({
      lastMovementAt: new Date(event.createdAt),
      updatedAt: new Date(),
    })
    .where(and(...whereConditions));
}

async function handleStockAdjustment(event: EventEnvelope): Promise<void> {
  const payload = event.payload as unknown as StockMovementPayload;
  
  const whereConditions = [
    eq(warehouseStock.tenantId, event.tenantId),
    eq(warehouseStock.productId, payload.productId)
  ];
  
  if (payload.warehouseId) {
    whereConditions.push(eq(warehouseStock.warehouseId, payload.warehouseId));
  }
  
  await warehouseStock
    .update({
      lastMovementAt: new Date(event.createdAt),
      updatedAt: new Date(),
    })
    .where(and(...whereConditions));
}

export const InventoryValuationProjector: Projector = {
  name: "inventory_valuation",
  handles: [
    "purchase_receipt_created",
    "sales_delivery_created",
    "stock_adjustment_created",
  ],
  process: async (db, event) => {
    // Switch on event type
    switch (event.eventType) {
      case "purchase_receipt_created":
        await handlePurchaseReceipt(event);
        break;
      case "sales_delivery_created":
        await handleSalesDelivery(event);
        break;
      case "stock_adjustment_created":
        await handleStockAdjustment(event);
        break;
    }
  },
};
