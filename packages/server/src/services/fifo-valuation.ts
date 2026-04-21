// packages/server/src/services/fifo-valuation.ts
import { eq, and, sql } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { inventoryLayers, warehouseStock, products } from "@complianceos/db";

export interface FifoConsumption {
  layers: Array<{
    layerId: string;
    quantityConsumed: number;
    unitCost: number;
    totalCost: number;
  }>;
  totalQuantity: number;
  totalCost: number;
  averageCost: number;
}

export async function addFifoLayer(
  db: Database,
  tenantId: string,
  productId: string,
  input: {
    quantity: number;
    unitCost: number;
    batchNumber?: string;
    receiptDate: string;
    warehouseId?: string;
  },
): Promise<string> {
  const totalValue = input.quantity * input.unitCost;
  
  const [layer] = await db.insert(inventoryLayers).values({
    tenantId,
    productId,
    warehouseId: input.warehouseId ?? null,
    batchNumber: input.batchNumber ?? null,
    quantity: String(input.quantity),
    remainingQuantity: String(input.quantity),
    unitCost: String(input.unitCost),
    totalValue: String(totalValue),
    receiptDate: input.receiptDate,
  }).returning();
  
  await upsertWarehouseStock(db, tenantId, productId, input.warehouseId, input.quantity, input.unitCost);
  
  return layer.id;
}

export async function consumeFifoLayers(
  db: Database,
  tenantId: string,
  productId: string,
  quantityToConsume: number,
  warehouseId?: string,
): Promise<FifoConsumption> {
  // Get oldest layers first (FIFO)
  const layers = await db.select()
    .from(inventoryLayers)
    .where(
      and(
        eq(inventoryLayers.tenantId, tenantId),
        eq(inventoryLayers.productId, productId),
        warehouseId !== undefined 
          ? eq(inventoryLayers.warehouseId, warehouseId)
          : undefined,
        sql`${inventoryLayers.remainingQuantity} > 0`
      )
    )
    .orderBy(inventoryLayers.receiptDate);
  
  let remaining = quantityToConsume;
  const consumedLayers: FifoConsumption["layers"] = [];
  let totalCost = 0;
  
  for (const layer of layers) {
    if (remaining <= 0) break;
    
    const layerRemaining = parseFloat(layer.remainingQuantity);
    const layerUnitCost = parseFloat(layer.unitCost);
    
    const consumeQty = Math.min(remaining, layerRemaining);
    const consumeCost = consumeQty * layerUnitCost;
    
    consumedLayers.push({
      layerId: layer.id,
      quantityConsumed: consumeQty,
      unitCost: layerUnitCost,
      totalCost: consumeCost,
    });
    
    totalCost += consumeCost;
    remaining -= consumeQty;
    
    await db.update(inventoryLayers)
      .set({ remainingQuantity: String(layerRemaining - consumeQty) })
      .where(eq(inventoryLayers.id, layer.id));
  }
  
  if (remaining > 0) {
    throw new Error(`Insufficient stock: only ${quantityToConsume - remaining} units available, requested ${quantityToConsume}`);
  }
  
  await upsertWarehouseStock(db, tenantId, productId, warehouseId, -quantityToConsume);
  
  return {
    layers: consumedLayers,
    totalQuantity: quantityToConsume,
    totalCost,
    averageCost: totalCost / quantityToConsume,
  };
}

async function upsertWarehouseStock(
  db: Database,
  tenantId: string,
  productId: string,
  warehouseId: string | null | undefined,
  quantityDelta: number,
  unitCost?: number,
): Promise<void> {
  const existing = await db.select()
    .from(warehouseStock)
    .where(
      and(
        eq(warehouseStock.tenantId, tenantId),
        eq(warehouseStock.productId, productId),
        warehouseId !== undefined && warehouseId !== null
          ? eq(warehouseStock.warehouseId, warehouseId)
          : undefined
      )
    );
  
  if (existing.length > 0) {
    const currentQty = parseFloat(existing[0].quantity);
    const newQty = currentQty + quantityDelta;
    
    if (newQty < 0) {
      throw new Error("Stock cannot be negative");
    }
    
    let newWac = existing[0].weightedAverageCost;
    if (quantityDelta > 0 && unitCost) {
      const currentValue = currentQty * parseFloat(existing[0].weightedAverageCost ?? "0");
      const addedValue = quantityDelta * unitCost;
      newWac = String((currentValue + addedValue) / newQty);
    }
    
    await db.update(warehouseStock)
      .set({
        quantity: String(newQty),
        weightedAverageCost: newWac,
        lastMovementAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(warehouseStock.id, existing[0].id));
  } else if (quantityDelta > 0) {
    await db.insert(warehouseStock).values({
      tenantId,
      productId,
      warehouseId: warehouseId ?? null,
      quantity: String(quantityDelta),
      weightedAverageCost: unitCost ? String(unitCost) : null,
      lastMovementAt: new Date(),
    });
  }
}

export async function getStockSummary(
  db: Database,
  tenantId: string,
  productId?: string,
): Promise<Array<{
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  totalValue: number;
  averageCost: number;
}>> {
  const results = await db.select({
    productId: warehouseStock.productId,
    quantity: warehouseStock.quantity,
    weightedAverageCost: warehouseStock.weightedAverageCost,
  })
    .from(warehouseStock)
    .where(
      productId 
        ? and(eq(warehouseStock.tenantId, tenantId), eq(warehouseStock.productId, productId))
        : eq(warehouseStock.tenantId, tenantId)
    );
  
  const enriched = await Promise.all(
    results.map(async (row) => {
      const [product] = await db.select()
        .from(products)
        .where(eq(products.id, row.productId));
      
      const qty = parseFloat(row.quantity);
      const wac = row.weightedAverageCost ? parseFloat(row.weightedAverageCost) : 0;
      
      return {
        productId: row.productId,
        productName: product?.name ?? "Unknown",
        sku: product?.sku ?? "",
        quantity: qty,
        totalValue: qty * wac,
        averageCost: wac,
      };
    })
  );
  
  return enriched;
}
