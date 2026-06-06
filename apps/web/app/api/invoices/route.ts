import { getDb } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const { supabaseRest } = await import("@/lib/supabase-rest");
    const res = await supabaseRest(`invoice_view?tenant_id=eq.${encodeURIComponent(tenantId)}&order=date.desc,created_at.desc`, { method: "GET" });
    return Response.json({ invoices: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { tenantId, date, dueDate, customerName, customerEmail, customerGstin, customerState, lines, fiscalYear, createdBy } = body;
    if (!tenantId || !customerName || !date || !createdBy) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Recompute totals from flat line shape (qty * rate, tax as percentages).
    let subtotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0, discountTotal = 0;
    for (const l of lines ?? []) {
      const qty = parseFloat(l.quantity) || 1;
      const rate = parseFloat(l.rate) || 0;
      const amt = qty * rate;
      subtotal += amt;
      cgstTotal += amt * (parseFloat(l.cgst) || 0) / 100;
      sgstTotal += amt * (parseFloat(l.sgst) || 0) / 100;
      igstTotal += amt * (parseFloat(l.igst) || 0) / 100;
      discountTotal += amt * (parseFloat(l.discount) || 0) / 100;
    }
    const grandTotal = subtotal + cgstTotal + sgstTotal + igstTotal - discountTotal;

    const db = getDb();
    const { createInvoice } = await import("@complianceos/server");
    const result = await createInvoice(db, tenantId, createdBy, {
      date,
      dueDate: dueDate || date,
      customerName,
      customerEmail: customerEmail || undefined,
      customerGstin: customerGstin || undefined,
      customerState: customerState || "",
      summaryOnly: true,
      subtotal: subtotal.toFixed(2),
      cgstTotal: cgstTotal.toFixed(2),
      sgstTotal: sgstTotal.toFixed(2),
      igstTotal: igstTotal.toFixed(2),
      discountTotal: discountTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    } as any);

    return Response.json({ success: true, invoiceId: result.invoiceId, invoiceNumber: result.invoiceNumber }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
