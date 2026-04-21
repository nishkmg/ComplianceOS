// packages/server/src/commands/create-sales-delivery.ts
import type { Database } from "@complianceos/db";
import { stockMovements } from "@complianceos/db";
import { CreateSalesDeliveryInputSchema } from "@complianceos/shared";
import { consumeFifoLayers } from "../services/fifo-valuation";
import { createJournalEntry } from "./create-journal-entry";

export async function createSalesDelivery(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    productId: string;
    quantity: number;
    warehouseId?: string;
    narration?: string;
    cogsAccountId: string;
    inventoryAssetAccountId: string;
  },
): Promise<{ movementId: string; cogs: { totalCost: number; averageCost: number } }> {
  const validated = CreateSalesDeliveryInputSchema.parse(input);
  
  const consumption = await consumeFifoLayers(
    db,
    tenantId,
    validated.productId,
    validated.quantity,
    validated.warehouseId
  );
  
  const [movement] = await db.insert(stockMovements).values({
    tenantId,
    productId: validated.productId,
    warehouseId: validated.warehouseId ?? null,
    movementType: "sales_delivery",
    quantity: String(validated.quantity),
    unitCost: String(consumption.averageCost),
    totalValue: String(consumption.totalCost),
    narration: validated.narration ?? null,
    createdById: actorId,
  }).returning();
  
  const year = new Date().getFullYear();
  const fy = year >= 4 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;
  
  await createJournalEntry(db, tenantId, actorId, fy, {
    date: new Date().toISOString().split("T")[0],
    narration: validated.narration ?? `COGS: ${validated.quantity} units @ avg ₹${consumption.averageCost.toFixed(2)}`,
    referenceType: "inventory",
    referenceId: movement.id,
    lines: [
      {
        accountId: input.cogsAccountId,
        debit: String(consumption.totalCost),
        credit: "0",
        description: `COGS: ${validated.quantity} units`,
      },
      {
        accountId: input.inventoryAssetAccountId,
        debit: "0",
        credit: String(consumption.totalCost),
        description: `Inventory out: ${validated.quantity} units`,
      },
    ],
  });
  
  return {
    movementId: movement.id,
    cogs: {
      totalCost: consumption.totalCost,
      averageCost: consumption.averageCost,
    },
  };
}
