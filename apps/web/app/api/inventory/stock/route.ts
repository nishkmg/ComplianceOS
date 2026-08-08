import { db, inventoryLayers } from "@complianceos/db";
import { and, asc, desc, eq, sql } from "drizzle-orm";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const rows = await db.select({ id: inventoryLayers.id, product_id: inventoryLayers.productId, quantity: inventoryLayers.quantity, remaining_quantity: inventoryLayers.remainingQuantity, unit_cost: inventoryLayers.unitCost, total_value: inventoryLayers.totalValue, receipt_date: inventoryLayers.receiptDate }).from(inventoryLayers).where(eq(inventoryLayers.tenantId, tenantId)).orderBy(desc(inventoryLayers.receiptDate));
    return Response.json({ stock: rows });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}


