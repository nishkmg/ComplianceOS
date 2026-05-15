import { supabaseRest } from "@/lib/supabase-rest";
import { randomUUID } from "crypto";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const res = await supabaseRest(`invoice_view?tenant_id=eq.${encodeURIComponent(tenantId)}&order=date.desc,created_at.desc`, { method: "GET" });
    return Response.json({ invoices: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, invoiceNumber, date, dueDate, customerName, customerEmail, customerGstin, customerState, lines, fiscalYear, createdBy } = body;
    if (!tenantId || !customerName || !date || !lines?.length || !createdBy) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    let subtotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0, discountTotal = 0;
    for (const l of lines) {
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
    const invoiceId = randomUUID();
    const res = await supabaseRest("invoice_view", {
      method: "POST", headers: { Prefer: "return=representation" },
      body: { id: invoiceId, tenant_id: tenantId, invoice_id: invoiceId, invoice_number: invoiceNumber || `INV-${String(Date.now()).slice(-8)}`, date, due_date: dueDate || date, customer_name: customerName, customer_email: customerEmail || null, customer_gstin: customerGstin || null, customer_state: customerState || null, status: "draft", subtotal: subtotal.toFixed(2), cgst_total: cgstTotal.toFixed(2), sgst_total: sgstTotal.toFixed(2), igst_total: igstTotal.toFixed(2), discount_total: discountTotal.toFixed(2), grand_total: grandTotal.toFixed(2), fiscal_year: fiscalYear || "2026-27", created_by: createdBy },
    });
    if (!res.ok) throw new Error(`Failed to create invoice: ${res.text.slice(0, 200)}`);
    return Response.json({ success: true, invoiceId }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
