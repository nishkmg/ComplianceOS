import { supabaseRest } from "@/lib/supabase-rest";

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
    const { tenantId, type, customerName, date, paymentMethod, referenceNumber, amount, tdsAmount, createdBy } = body;

    if (!tenantId || !customerName || !date || !amount || !createdBy) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const paymentNumber = `PAY-${String(Date.now()).slice(-8)}`;

    const res = await supabaseRest("payments", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: {
        tenant_id: tenantId,
        payment_number: paymentNumber,
        date,
        amount: parseFloat(amount).toFixed(2),
        payment_method: paymentMethod || "online",
        reference_number: referenceNumber || null,
        customer_name: customerName.trim(),
        status: "recorded",
        created_by: createdBy,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to record payment: ${res.text.slice(0, 200)}`);
    }

    return Response.json({ success: true, paymentNumber }, { status: 201 });
  } catch (err: any) {
    console.error("[payments] POST error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
