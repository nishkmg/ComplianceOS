import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { stockMovements, inventoryLayers } from "@complianceos/db";
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
): Promise<{ movementId: string }> {
  const { productId, quantity, warehouseId, reason, narration, adjustmentAccountId } = input;

  if (quantity < 0) {
    const warehouseCondition = warehouseId
      ? eq(inventoryLayers.warehouseId, warehouseId)
      : eq(inventoryLayers.warehouseId, null as unknown as string);

    const layers = await db.select()
      .from(inventoryLayers)
      .where(
        and(
          eq(inventoryLayers.tenantId, tenantId),
          eq(inventoryLayers.productId, productId),
          warehouseCondition
        )
      )
      .orderBy(inventoryLayers.receiptDate);

    let remaining = Math.abs(quantity);

    for (const layer of layers) {
      if (remaining <= 0) break;

      const layerRemaining = parseFloat(layer.remainingQuantity);
      const consumeQty = Math.min(remaining, layerRemaining);
      const newRemaining = layerRemaining - consumeQty;

      await db.update(inventoryLayers)
        .set({ remainingQuantity: String(newRemaining) })
        .where(eq(inventoryLayers.id, layer.id));

      remaining -= consumeQty;
    }
  }

  const [movement] = await db.insert(stockMovements).values({
    tenantId,
    productId,
    warehouseId: warehouseId ?? null,
    movementType: "stock_adjustment",
    quantity: String(Math.abs(quantity)),
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
    narration: narration ?? `Inventory ${reason}: ${Math.abs(quantity)} units`,
    referenceType: "inventory",
    referenceId: movement.id,
    lines: [
      {
        accountId: adjustmentAccountId,
        debit: quantity < 0 ? "0" : "1",
        credit: quantity < 0 ? "1" : "0",
        description: `Inventory ${reason}`,
      },
    ],
  });

  return { movementId: movement.id };
}
