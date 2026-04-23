// @ts-nocheck
// packages/server/src/commands/create-purchase-receipt.ts
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { stockMovements } = _db;
import * as _shared from "../../../shared/src/index";
const { CreatePurchaseReceiptInputSchema } = _shared;
import { addFifoLayer } from "../services/fifo-valuation";
import { createJournalEntry } from "./create-journal-entry";

export async function createPurchaseReceipt(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    productId: string;
    quantity: number;
    unitCost: number;
    batchNumber?: string;
    receiptDate: string;
    warehouseId?: string;
    narration?: string;
    inventoryAssetAccountId: string;
    expenseAccountId: string;
  },
): Promise<{ movementId: string; layerId: string }> {
  const validated = CreatePurchaseReceiptInputSchema.parse(input);
  
  const layerId = await addFifoLayer(db, tenantId, validated.productId, {
    quantity: validated.quantity,
    unitCost: validated.unitCost,
    batchNumber: validated.batchNumber,
    receiptDate: validated.receiptDate,
    warehouseId: validated.warehouseId,
  });
  
  const [movement] = // -ignore - drizzle type
          await db.insert(stockMovements).values({
    tenantId,
    productId: validated.productId,
    warehouseId: validated.warehouseId ?? null,
    movementType: "purchase_receipt",
    quantity: String(validated.quantity),
    unitCost: String(validated.unitCost),
    totalValue: String(validated.quantity * validated.unitCost),
    narration: validated.narration ?? null,
    createdById: actorId,
  }).returning();
  
  if (input.inventoryAssetAccountId && input.expenseAccountId) {
    const year = new Date(validated.receiptDate).getFullYear();
    const fy = year >= 4 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;
    
    await createJournalEntry(db, tenantId, actorId, fy, {
      date: validated.receiptDate,
      narration: validated.narration ?? `Purchase receipt: ${validated.quantity} units @ ₹${validated.unitCost}`,
      referenceType: "inventory",
      referenceId: movement.id,
      lines: [
        {
          accountId: input.inventoryAssetAccountId,
          debit: String(validated.quantity * validated.unitCost),
          credit: "0",
          description: `Stock in: ${validated.quantity} units`,
        },
        {
          accountId: input.expenseAccountId,
          debit: "0",
          credit: String(validated.quantity * validated.unitCost),
          description: `Purchase: ${validated.quantity} units @ ₹${validated.unitCost}`,
        },
      ],
    });
  }
  
  return { movementId: movement.id, layerId };
}
