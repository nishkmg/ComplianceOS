import { db, products } from "@complianceos/db";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const rows = await db.select().from(products).where(eq(products.tenantId, tenantId)).orderBy(asc(products.name));
    return Response.json({ products: rows });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { tenantId, sku, name, description, hsnCode, unitOfMeasure, purchaseRate, salesRate, gstRate } = await req.json();
    if (!tenantId || !sku || !name || !hsnCode) return Response.json({ error: "Missing required fields" }, { status: 400 });

    const db = getDb();
    const { createProduct } = await import("@complianceos/server");
    const result = await createProduct(db, tenantId, {
      sku,
      name,
      description: description || undefined,
      hsnCode,
      unitOfMeasure: unitOfMeasure || undefined,
      purchaseRate: purchaseRate ? Number(purchaseRate) : undefined,
      salesRate: salesRate ? Number(salesRate) : undefined,
      gstRate: gstRate ? Number(gstRate) : undefined,
    } as any);

    return Response.json({ success: true, productId: result.productId }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
