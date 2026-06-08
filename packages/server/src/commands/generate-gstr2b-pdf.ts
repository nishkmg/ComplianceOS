import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { gstReturns, gstReturnLines, tenants } = _db;
import { createStorageDriver, BUCKETS } from "../lib/storage";
import { renderGstr2bPdf, type GstReturnData, type GstLine } from "../services/gst-return-pdf";

export async function generateGstr2bPdf(
  db: Database,
  tenantId: string,
  returnId: string,
): Promise<{ storagePath: string; signedUrl: string }> {
  const [gstReturn] = await db.select().from(gstReturns).where(
    and(eq(gstReturns.id, returnId), eq(gstReturns.tenantId, tenantId)),
  ).limit(1);
  if (!gstReturn) throw new Error("GSTR-2B return not found");
  if (gstReturn.returnType !== "gstr2b") throw new Error("Return is not GSTR-2B");

  const storage = createStorageDriver();
  const storagePath = `gstr2b/${tenantId}/${returnId}.pdf`;
  const already = await storage.exists(BUCKETS.GST_RETURNS, storagePath);
  if (already) {
    const signedUrl = await storage.signedUrl(BUCKETS.GST_RETURNS, storagePath, 604_800);
    return { storagePath, signedUrl };
  }

  const lines = await db.select().from(gstReturnLines).where(eq(gstReturnLines.gstReturnId, returnId));
  const data: GstReturnData = {
    id: gstReturn.id,
    tenantId: gstReturn.tenantId,
    returnNumber: gstReturn.returnNumber,
    returnType: gstReturn.returnType,
    taxPeriodMonth: gstReturn.taxPeriodMonth,
    taxPeriodYear: gstReturn.taxPeriodYear,
    fiscalYear: gstReturn.fiscalYear,
    status: gstReturn.status,
    filingDate: gstReturn.filingDate,
    dueDate: gstReturn.dueDate,
    totalOutwardSupplies: gstReturn.totalOutwardSupplies ?? "0",
    totalEligibleItc: gstReturn.totalEligibleItc ?? "0",
    totalTaxPayable: gstReturn.totalTaxPayable ?? "0",
    totalTaxPaid: gstReturn.totalTaxPaid ?? "0",
    interestAmount: gstReturn.interestAmount ?? "0",
    penaltyAmount: gstReturn.penaltyAmount ?? "0",
    lateFeeAmount: gstReturn.lateFeeAmount ?? "0",
    arn: gstReturn.arn,
    lines: lines.map((l): GstLine => ({
      gstin: l.gstin,
      sourceDocumentNumber: l.sourceDocumentNumber,
      sourceDocumentDate: l.sourceDocumentDate,
      taxableValue: l.taxableValue ?? "0",
      igstAmount: l.igstAmount ?? "0",
      cgstAmount: l.cgstAmount ?? "0",
      sgstAmount: l.sgstAmount ?? "0",
      cessAmount: l.cessAmount ?? "0",
      totalTaxAmount: l.totalTaxAmount ?? "0",
      partyName: l.partyName,
      placeOfSupply: l.placeOfSupply,
      remarks: l.remarks,
    })),
  };

  const [tenant] = await db.select({ name: tenants.name, gstin: tenants.gstin }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);

  const buffer = await renderGstr2bPdf(data, {
    name: tenant?.name ?? "Unknown",
    gstin: tenant?.gstin ?? "",
  });

  await storage.upload(BUCKETS.GST_RETURNS, storagePath, buffer, "application/pdf");
  const signedUrl = await storage.signedUrl(BUCKETS.GST_RETURNS, storagePath, 604_800);
  return { storagePath, signedUrl };
}
