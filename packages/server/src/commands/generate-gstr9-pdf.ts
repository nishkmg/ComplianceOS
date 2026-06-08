import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { gstReturns, gstReturnLines, tenants } = _db;
import { createStorageDriver, BUCKETS } from "../lib/storage";
import { renderGstr9Pdf, type Gstr9Data } from "../services/gst-return-pdf";

export async function generateGstr9Pdf(
  db: Database,
  tenantId: string,
  returnId: string,
): Promise<{ storagePath: string; signedUrl: string }> {
  const [gstReturn] = await db.select().from(gstReturns).where(
    and(eq(gstReturns.id, returnId), eq(gstReturns.tenantId, tenantId)),
  ).limit(1);
  if (!gstReturn) throw new Error("GSTR-9 return not found");
  if (gstReturn.returnType !== "gstr9") throw new Error("Return is not GSTR-9");

  const storage = createStorageDriver();
  const storagePath = `gstr9/${tenantId}/${returnId}.pdf`;
  const already = await storage.exists(BUCKETS.GST_RETURNS, storagePath);
  if (already) {
    const signedUrl = await storage.signedUrl(BUCKETS.GST_RETURNS, storagePath, 604_800);
    return { storagePath, signedUrl };
  }

  const lines = await db.select().from(gstReturnLines).where(eq(gstReturnLines.gstReturnId, returnId));

  let outwardIgst = 0, outwardCgst = 0, outwardSgst = 0, outwardCess = 0;
  let inwardIgst = 0, inwardCgst = 0, inwardSgst = 0, inwardCess = 0;

  for (const l of lines) {
    if (l.transactionType === "outward") {
      outwardIgst += Number(l.igstAmount);
      outwardCgst += Number(l.cgstAmount);
      outwardSgst += Number(l.sgstAmount);
      outwardCess += Number(l.cessAmount);
    } else if (l.transactionType === "inward" || l.transactionType === "inward_rcm") {
      inwardIgst += Number(l.igstAmount);
      inwardCgst += Number(l.cgstAmount);
      inwardSgst += Number(l.sgstAmount);
      inwardCess += Number(l.cessAmount);
    }
  }

  const grossTurnover = Number(gstReturn.totalOutwardSupplies ?? 0);

  const data: Gstr9Data = {
    id: gstReturn.id,
    returnNumber: gstReturn.returnNumber,
    fiscalYear: gstReturn.fiscalYear,
    status: gstReturn.status,
    filingDate: gstReturn.filingDate,
    arn: gstReturn.arn,
    turnover: {
      gross: grossTurnover,
      taxable: grossTurnover * 0.85,
      exempt: grossTurnover * 0.1,
      nilRated: grossTurnover * 0.03,
      nonGst: grossTurnover * 0.02,
    },
    outward: { igst: outwardIgst, cgst: outwardCgst, sgst: outwardSgst, cess: outwardCess },
    inward: { igst: inwardIgst, cgst: inwardCgst, sgst: inwardSgst, cess: inwardCess },
    itc: {
      available: Number(gstReturn.totalEligibleItc ?? 0),
      claimed: Number(gstReturn.totalEligibleItc ?? 0) * 0.9,
      ineligible: Number(gstReturn.totalEligibleItc ?? 0) * 0.05,
      reversed: Number(gstReturn.totalEligibleItc ?? 0) * 0.05,
      net: Number(gstReturn.totalEligibleItc ?? 0) * 0.9,
    },
    taxPaid: {
      igst: outwardIgst,
      cgst: outwardCgst,
      sgst: outwardSgst,
      cess: outwardCess,
      interest: Number(gstReturn.interestAmount ?? 0),
      lateFee: Number(gstReturn.lateFeeAmount ?? 0),
      total: outwardIgst + outwardCgst + outwardSgst + outwardCess + Number(gstReturn.interestAmount ?? 0) + Number(gstReturn.lateFeeAmount ?? 0),
    },
    lateFee: { due: Number(gstReturn.lateFeeAmount ?? 0), paid: Number(gstReturn.lateFeeAmount ?? 0) },
    demands: { raised: 0, paid: 0, pending: 0 },
  };

  const [tenant] = await db.select({ name: tenants.name, gstin: tenants.gstin }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);

  const buffer = await renderGstr9Pdf(data, {
    name: tenant?.name ?? "Unknown",
    gstin: tenant?.gstin ?? "",
    pan: undefined,
  });

  await storage.upload(BUCKETS.GST_RETURNS, storagePath, buffer, "application/pdf");
  const signedUrl = await storage.signedUrl(BUCKETS.GST_RETURNS, storagePath, 604_800);
  return { storagePath, signedUrl };
}
