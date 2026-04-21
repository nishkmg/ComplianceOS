import { eq, and, sql } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { stockMovements, inventoryLayers, warehouseStock, products } from "@complianceos/db";
import { createJournalEntry } from "./create-journal-entry";

export async function adjustInventory(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    productId: string;
    quantity: number;
    warehouseId?: string;
    reason: "damage" | "loss" | "gain" | "correction";
    narration?: string;
    adjustmentAccountId: string;
  },
): Promise<{ movementId: string; totalValue: number }> {
  const { productId, quantity, warehouseId, reason, narration, adjustmentAccountId } = input;
  
  let totalValue = 0;

  if (quantity < 0) {
    const whereConditions = [
      eq(inventoryLayers.tenantId, tenantId),
      eq(inventoryLayers.productId, productId)
    ];
    
    if (warehouseId !== undefined && warehouseId !== null) {
      whereConditions.push(eq(inventoryLayers.warehouseId, warehouseId));
    }

    const layers = await db.select()
      .from(inventoryLayers)
      .where(and(...whereConditions))
      .orderBy(inventoryLayers.receiptDate);

    let remaining = Math.abs(quantity);

    for (const layer of layers) {
      if (remaining <= 0) break;

      const layerRemaining = parseFloat(layer.remainingQuantity);
      const layerUnitCost = parseFloat(layer.unitCost);
      const consumeQty = Math.min(remaining, layerRemaining);
      const newRemaining = layerRemaining - consumeQty;
      
      totalValue += consumeQty * layerUnitCost;

      await db.update(inventoryLayers)
        .set({ remainingQuantity: String(newRemaining) })
        .where(eq(inventoryLayers.id, layer.id));

      remaining -= consumeQty;
    }
    
    // Update warehouseStock for losses
    const wsWhereConditions = [
      eq(warehouseStock.tenantId, tenantId),
      eq(warehouseStock.productId, productId)
    ];
    
    if (warehouseId !== undefined && warehouseId !== null) {
      wsWhereConditions.push(eq(warehouseStock.warehouseId, warehouseId));
    }
    
    await db.update(warehouseStock)
      .set({
        quantity: sql`quantity - ${Math.abs(quantity)}`,
        lastMovementAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(...wsWhereConditions));
  } else {
    // For gains, update warehouseStock
    const [product] = await db.select({ purchaseRate: products.purchaseRate })
      .from(products)
      .where(eq(products.id, productId));
    
    const unitCost = product?.purchaseRate ? parseFloat(product.purchaseRate) : 0;
    totalValue = quantity * unitCost;
    
    const wsWhereConditions = [
      eq(warehouseStock.tenantId, tenantId),
      eq(warehouseStock.productId, productId)
    ];
    
    if (warehouseId !== undefined && warehouseId !== null) {
      wsWhereConditions.push(eq(warehouseStock.warehouseId, warehouseId));
    }
    
    const existing = await db.select().from(warehouseStock).where(and(...wsWhereConditions));
    
    if (existing.length > 0) {
      await db.update(warehouseStock)
        .set({
          quantity: sql`quantity + ${quantity}`,
          lastMovementAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(...wsWhereConditions));
    } else {
      await db.insert(warehouseStock).values({
        tenantId,
        productId,
        warehouseId: warehouseId ?? null,
        quantity: String(quantity),
        weightedAverageCost: unitCost ? String(unitCost) : null,
        lastMovementAt: new Date(),
      });
    }
  }

  const [movement] = await db.insert(stockMovements).values({
    tenantId,
    productId,
    warehouseId: warehouseId ?? null,
    movementType: "stock_adjustment",
    quantity: String(Math.abs(quantity)),
    unitCost: totalValue > 0 ? String(totalValue / Math.abs(quantity)) : null,
    totalValue: totalValue > 0 ? String(totalValue) : null,
    narration: narration ?? `${reason}: ${quantity > 0 ? "Gain" : "Loss"}`,
    createdById: actorId,
  }).returning();

  const date = new Date().toISOString().split("T")[0];
  const year = new Date().getFullYear();
  const fy = year >= 4
    ? `${year}-${String(year + 1).slice(-2)}`
    : `${year - 1}-${String(year).slice(-2)}`;

  await createJournalEntry(db, tenantId, actorId, fy, {
    date,
    narration: narration ?? `Inventory ${reason}: ${Math.abs(quantity)} units @ ₹${(totalValue / Math.abs(quantity)).toFixed(2)}`,
    referenceType: "inventory",
    referenceId: movement.id,
    lines: [
      {
        accountId: adjustmentAccountId,
        debit: quantity > 0 ? String(totalValue) : "0",
        credit: quantity < 0 ? String(totalValue) : "0",
        description: `Inventory ${reason}: ${Math.abs(quantity)} units`,
      },
    ],
  });

  return { movementId: movement.id, totalValue };
}
