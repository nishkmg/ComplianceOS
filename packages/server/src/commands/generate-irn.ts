import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { invoices, invoiceLines, invoiceConfig } = _db;
import { appendEvent } from "../lib/event-store";
import { generateIrn } from "../services/einvoice-irp";

export async function generateInvoiceIrn(
  db: Database,
  tenantId: string,
  invoiceId: string,
  actorId: string,
): Promise<{ irn: string; signedQrCode: string }> {
  // 1. Fetch invoice
  const invoice = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)))
    .limit(1);

  if (!invoice[0]) {
    throw new Error("Invoice not found");
  }

  const inv = invoice[0];

  // 2. Already has IRN — idempotent return
  if (inv.irn) {
    return { irn: inv.irn, signedQrCode: inv.signedQrCode || "" };
  }

  // 3. Fetch seller company GSTIN from invoiceConfig
  const config = await db
    .select()
    .from(invoiceConfig)
    .where(eq(invoiceConfig.tenantId, tenantId))
    .limit(1);

  const sellerGstin = config[0]?.companyGstin;
  if (!sellerGstin) {
    throw new Error("Seller GSTIN not configured in invoice settings");
  }

  // 4. Fetch invoice lines
  const lines = await db
    .select()
    .from(invoiceLines)
    .where(eq(invoiceLines.invoiceId, invoiceId));

  // 5. Build e-invoice JSON per NIC schema v1.03
  const sellerInfo = {
    gstin: sellerGstin,
    legalName: config[0]?.companyName || "",
    address: config[0]?.companyAddress || "",
  };
  const einvoiceData = buildEinvoicePayload(inv, lines, sellerInfo);

  // 6. Call IRP
  const result = await generateIrn(einvoiceData, sellerGstin);

  // 7. Append event + update invoice in transaction
  await db.transaction(async (tx) => {
    await appendEvent(tx, tenantId, "invoice", invoiceId, "invoice_irn_generated", {
      invoiceId,
      invoiceNumber: inv.invoiceNumber,
      irn: result.irn,
      ackNo: result.ackNo,
      ackDt: result.ackDt,
    }, actorId);

    await tx
      .update(invoices)
      .set({
        irn: result.irn,
        irnGeneratedAt: new Date(result.irnGeneratedAt),
        signedQrCode: result.signedQrCode,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));
  });

  return { irn: result.irn, signedQrCode: result.signedQrCode };
}

type SellerInfo = {
  gstin: string;
  legalName: string;
  address: string;
};

function buildEinvoicePayload(
  inv: typeof invoices.$inferSelect,
  lines: (typeof invoiceLines.$inferSelect)[],
  seller: SellerInfo,
): Record<string, unknown> {
  return {
    Version: "1.03",
    TranDtls: {
      TaxSch: "GST",
      SupTyp: "B2B",
      RegRev: "N",
      EcmGstin: null,
      IgstOnIntra: "N",
    },
    DocDtls: {
      Typ: "INV",
      No: inv.invoiceNumber,
      Dt: inv.date,
    },
    SellerDtls: {
      Gstin: seller.gstin,
      LglNm: seller.legalName,
      Addr1: seller.address,
      Loc: "",
      Pin: 0,
      Stcd: "",
    },
    BuyerDtls: {
      Gstin: inv.customerGstin || "URP",
      LglNm: inv.customerName,
      Addr1: inv.customerAddress || "",
      Loc: inv.customerState || "",
      Pin: 0,
      Stcd: inv.customerState || "",
    },
    ItemList: lines.map((line, idx) => ({
      SlNo: idx + 1,
      PrdDesc: line.description,
      IsServc: "N",
      HsnCd: "",
      Qty: Number(line.quantity),
      UnitPrice: Number(line.unitPrice),
      TotAmt: Number(line.amount),
      Discount: Number(line.discountAmount),
      AssAmt: Number(line.amount) - Number(line.discountAmount),
      GstRt: Number(line.gstRate),
      CgstAmt: Number(line.cgstAmount),
      SgstAmt: Number(line.sgstAmount),
      IgstAmt: Number(line.igstAmount),
      TotItemVal: Number(line.amount) - Number(line.discountAmount),
    })),
    ValDtls: {
      AssVal: Number(inv.subtotal),
      CgstVal: Number(inv.cgstTotal),
      SgstVal: Number(inv.sgstTotal),
      IgstVal: Number(inv.igstTotal),
      Discount: Number(inv.discountTotal),
      TotInvVal: Number(inv.grandTotal),
    },
  };
}
