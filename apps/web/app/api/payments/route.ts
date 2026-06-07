import { supabaseRest } from "@/lib/supabase-rest";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) {
      return Response.json({ error: "tenantId is required" }, { status: 400 });
    }
    const res = await supabaseRest(
      `payments?tenant_id=eq.${encodeURIComponent(tenantId)}&order=date.desc,created_at.desc`,
      { method: "GET" }
    );
    return Response.json({ payments: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) {
    console.error("[payments] GET error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, customerName, date, paymentMethod, referenceNumber, amount, allocations, createdBy } = body;

    if (!tenantId || !customerName || !date || !amount || !createdBy) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    const { recordPayment } = await import("@complianceos/server");

    // Route does not pass allocations; command supports unallocated payment (insert only, no JE).
    // Allocations (if any) must be an array of { invoiceId, allocatedAmount }.
    const result = await recordPayment(db, tenantId, createdBy, "2026-27", {
      date,
      customerName: customerName.trim(),
      amount: parseFloat(amount).toFixed(2),
      paymentMethod: paymentMethod || "online",
      referenceNumber: referenceNumber || undefined,
      allocations: Array.isArray(allocations) ? allocations : [],
    } as any);

    return Response.json({ success: true, paymentId: result.paymentId, paymentNumber: result.paymentNumber }, { status: 201 });
  } catch (err: any) {
    console.error("[payments] POST error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
