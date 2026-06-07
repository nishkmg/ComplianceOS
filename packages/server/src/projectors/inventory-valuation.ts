import { eq, and, sql } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { inventoryValuation, products } = _db;
import type { Projector } from "./types.js";

export const inventoryValuationProjector: Projector = {
  name: "InventoryValuationProjector",
  handles: ["purchase_posted", "purchase_voided", "invoice_posted", "invoice_voided"],
  async process(db: Database, event: any): Promise<void> {
    const payload = event.payload as any;
    const tenantId = event.tenantId;
    const sequence = Number(event.sequence);

    const isReverse = event.eventType === "purchase_voided" || event.eventType === "invoice_voided";
    const isStockIn = event.eventType === "purchase_posted" || event.eventType === "purchase_voided";
    const source = payload.purchase || payload.invoice;
    if (!source) return;

    const lines = source.lines || [];
    for (const line of lines) {
      if (!line.productId) continue;
      const qty = parseFloat(line.quantity || "0");
      const unitPrice = parseFloat(line.unitPrice || line.unitCost || "0");
      if (qty === 0) continue;
      const warehouseId = line.warehouseId || null;
      const direction = isStockIn ? 1 : -1;
      const deltaQty = isReverse ? -qty * direction : qty * direction;
      const deltaValue = unitPrice * deltaQty;

      await db.insert(inventoryValuation).values({
        tenantId,
        productId: line.productId,
        warehouseId,
        quantityOnHand: String(deltaQty),
        totalValue: String(deltaValue),
        cogsPerUnit: unitPrice > 0 ? String(unitPrice) : "0",
        lastEventSequence: BigInt(sequence),
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: [
          inventoryValuation.tenantId,
          inventoryValuation.productId,
          inventoryValuation.warehouseId,
        ],
        set: {
          quantityOnHand: sql`${inventoryValuation.quantityOnHand} + ${deltaQty}`,
          totalValue: sql`${inventoryValuation.totalValue} + ${deltaValue}`,
          cogsPerUnit: sql`CASE WHEN ${inventoryValuation.quantityOnHand} + ${deltaQty} = 0 THEN 0 ELSE (${inventoryValuation.totalValue} + ${deltaValue}) / (${inventoryValuation.quantityOnHand} + ${deltaQty}) END`,
          lastEventSequence: BigInt(sequence),
          updatedAt: new Date(),
        },
      });
    }
  },
};
