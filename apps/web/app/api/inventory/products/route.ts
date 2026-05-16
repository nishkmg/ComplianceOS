import { supabaseRest } from "@/lib/supabase-rest";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const res = await supabaseRest(`products?tenant_id=eq.${encodeURIComponent(tenantId)}&order=name.asc`, { method: "GET" });
    return Response.json({ products: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { tenantId, sku, name, description, hsnCode, unitOfMeasure, purchaseRate, salesRate, gstRate, createdBy } = await req.json();
    if (!tenantId || !sku || !name || !hsnCode) return Response.json({ error: "Missing required fields" }, { status: 400 });
    const res = await supabaseRest("products", {
      method: "POST", headers: { Prefer: "return=representation" },
      body: { tenant_id: tenantId, sku, name, description: description || null, hsn_code: hsnCode, unit_of_measure: unitOfMeasure || "nos", purchase_rate: purchaseRate || null, sales_rate: salesRate || null, gst_rate: gstRate || null, created_by: createdBy || null },
    });
    if (!res.ok) throw new Error(`Failed to create product: ${res.text.slice(0, 200)}`);
    return Response.json({ success: true }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
