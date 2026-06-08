import { eq } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { invoices, tenants } = _db;
import { appendEvent } from "../lib/event-store";
import { generateEwayBill } from "../services/eway-bill";

interface GenerateEwbResult {
  ewbNo: string;
  ewbValidTill: string;
}

export async function generateEwayBillForInvoice(
  db: Database,
  tenantId: string,
  actorId: string,
  invoiceId: string,
  distance: number,
  vehicleNo?: string,
): Promise<GenerateEwbResult> {
  // 1. Fetch invoice + tenant details
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.tenantId !== tenantId) throw new Error("Tenant mismatch");

  const [tenant] = await db
    .select({
      gstin: tenants.gstin,
      name: tenants.name,
    })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!tenant?.gstin) throw new Error("Tenant GSTIN not configured");

  // 2. Already has EWB? Return it (idempotent)
  if (invoice.ewbNo) {
    return {
      ewbNo: invoice.ewbNo,
      ewbValidTill: invoice.ewbValidTill
        ? invoice.ewbValidTill.toISOString()
        : new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
    };
  }

  const fromGstin = tenant.gstin;
  const toGstin = invoice.customerGstin || "";
  const fromTrdName = tenant.name;
  const toTrdName = invoice.customerName;

  // Aggregate GST rate from invoice totals
  const taxableValue = Number(invoice.subtotal);
  const totalGst =
    Number(invoice.cgstTotal) +
    Number(invoice.sgstTotal) +
    Number(invoice.igstTotal);
  const gstRate = taxableValue > 0 ? (totalGst / taxableValue) * 100 : 0;
  const cessRate = Number(invoice.cessAmount ?? 0) > 0 && taxableValue > 0
    ? (Number(invoice.cessAmount) / taxableValue) * 100
    : 0;

  // 3. Build Part A
  const result = await db.transaction(async (tx) => {
    const ewb = await generateEwayBill(
      {
        docType: "INV",
        docNo: invoice.invoiceNumber,
        docDate: invoice.date,
        fromGstin,
        fromTrdName,
        toGstin,
        toTrdName,
        totalValue: Number(invoice.grandTotal),
        gstRate: Math.round(gstRate * 100) / 100,
        cessRate: Math.round(cessRate * 100) / 100,
        transId: fromGstin,
        transName: fromTrdName,
        distance,
      },
      vehicleNo ? { vehicleNo, transportDocNo: "", transportDocDate: "" } : undefined,
    );

    // 4. Append event
    await appendEvent(
      tx,
      tenantId,
      "invoice",
      invoiceId,
      "ewaybill_generated",
      {
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        ewbNo: ewb.ewbNo,
        ewbDt: ewb.ewbDt,
        ewbValidTill: ewb.ewbValidTill,
        distance,
        vehicleNo: vehicleNo ?? null,
      },
      actorId,
    );

    // 5. Update invoice
    await tx
      .update(invoices)
      .set({
        ewbNo: ewb.ewbNo,
        ewbGeneratedAt: new Date(),
        ewbValidTill: new Date(ewb.ewbValidTill),
      })
      .where(eq(invoices.id, invoiceId));

    return { ewbNo: ewb.ewbNo, ewbValidTill: ewb.ewbValidTill };
  });

  return result;
}
