import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { gstReturns, gstReturnLines, tenants } = _db;
import { createStorageDriver, BUCKETS } from "../lib/storage";
import { renderGstr3bPdf, type Gstr3bData } from "../services/gst-return-pdf";

export async function generateGstr3bPdf(
  db: Database,
  tenantId: string,
  returnId: string,
): Promise<{ storagePath: string; signedUrl: string }> {
  const [gstReturn] = await db.select().from(gstReturns).where(
    and(eq(gstReturns.id, returnId), eq(gstReturns.tenantId, tenantId)),
  ).limit(1);
  if (!gstReturn) throw new Error("GSTR-3B return not found");
  if (gstReturn.returnType !== "gstr3b") throw new Error("Return is not GSTR-3B");

  const storage = createStorageDriver();
  const storagePath = `gstr3b/${tenantId}/${returnId}.pdf`;
  const already = await storage.exists(BUCKETS.GST_RETURNS, storagePath);
  if (already) {
    const signedUrl = await storage.signedUrl(BUCKETS.GST_RETURNS, storagePath, 604_800);
    return { storagePath, signedUrl };
  }

  const lines = await db.select().from(gstReturnLines).where(eq(gstReturnLines.gstReturnId, returnId));

  let outwardTaxable = 0, outwardIgst = 0, outwardCgst = 0, outwardSgst = 0, outwardCess = 0;
  let itcImportGoods = 0, itcImportServices = 0, itcCapitalGoods = 0, itcInwardRegular = 0, itcInwardRcm = 0;
  let utilizedIgstForIgst = 0, utilizedIgstForCgst = 0, utilizedIgstForSgst = 0;
  let utilizedCgstForCgst = 0, utilizedCgstForIgst = 0;
  let utilizedSgstForSgst = 0, utilizedSgstForIgst = 0;
  let payableIgst = 0, payableCgst = 0, payableSgst = 0, payableCess = 0;
  let paidItcIgst = 0, paidItcCgst = 0, paidItcSgst = 0, paidItcCess = 0;
  let paidCashIgst = 0, paidCashCgst = 0, paidCashSgst = 0, paidCashCess = 0;

  for (const l of lines) {
    const tn = l.tableNumber;
    if (tn === "3.1") {
      outwardTaxable += Number(l.taxableValue);
      outwardIgst += Number(l.igstAmount);
      outwardCgst += Number(l.cgstAmount);
      outwardSgst += Number(l.sgstAmount);
      outwardCess += Number(l.cessAmount);
    } else if (tn === "4") {
      itcInwardRegular += Number(l.igstAmount) + Number(l.cgstAmount) + Number(l.sgstAmount) + Number(l.cessAmount);
    } else if (tn === "5") {
      utilizedIgstForIgst += Number(l.igstAmount) || 0;
    } else if (tn === "6") {
      payableIgst += Number(l.igstAmount);
      payableCgst += Number(l.cgstAmount);
      payableSgst += Number(l.sgstAmount);
      payableCess += Number(l.cessAmount);
    }
  }

  payableIgst = Math.max(payableIgst, outwardIgst);
  payableCgst = Math.max(payableCgst, outwardCgst);
  payableSgst = Math.max(payableSgst, outwardSgst);
  payableCess = Math.max(payableCess, outwardCess);

  const totalItc = itcInwardRegular;
  const igstLiability = payableIgst;
  const cgstLiability = payableCgst;
  const sgstLiability = payableSgst;
  const itcIgstPool = itcInwardRegular * 0.6;
  const itcCgstPool = itcInwardRegular * 0.2;
  const itcSgstPool = itcInwardRegular * 0.2;

  paidItcIgst = Math.min(itcIgstPool, igstLiability);
  let remIgst = igstLiability - paidItcIgst;

  paidItcCgst = Math.min(itcCgstPool, cgstLiability);
  let remCgst = cgstLiability - paidItcCgst;

  paidItcSgst = Math.min(itcSgstPool, sgstLiability);
  let remSgst = sgstLiability - paidItcSgst;

  const leftoverIgstItc = itcIgstPool - paidItcIgst;
  if (leftoverIgstItc > 0 && remCgst > 0) {
    const xfer = Math.min(leftoverIgstItc, remCgst);
    paidItcCgst += xfer;
    remCgst -= xfer;
  }
  const leftoverIgstItc2 = itcIgstPool - paidItcIgst - (paidItcCgst - Math.min(itcCgstPool, cgstLiability));
  if (leftoverIgstItc2 > 0 && remSgst > 0) {
    const xfer = Math.min(leftoverIgstItc2, remSgst);
    paidItcSgst += xfer;
    remSgst -= xfer;
  }

  paidCashIgst = Math.max(0, remIgst);
  paidCashCgst = Math.max(0, remCgst);
  paidCashSgst = Math.max(0, remSgst);

  utilizedIgstForIgst = Math.min(itcIgstPool, igstLiability);
  utilizedCgstForCgst = Math.min(itcCgstPool, cgstLiability);
  utilizedSgstForSgst = Math.min(itcSgstPool, sgstLiability);

  const data: Gstr3bData = {
    id: gstReturn.id,
    returnNumber: gstReturn.returnNumber,
    taxPeriodMonth: gstReturn.taxPeriodMonth,
    taxPeriodYear: gstReturn.taxPeriodYear,
    fiscalYear: gstReturn.fiscalYear,
    status: gstReturn.status,
    dueDate: gstReturn.dueDate,
    filingDate: gstReturn.filingDate,
    totalOutwardSupplies: gstReturn.totalOutwardSupplies ?? "0",
    totalEligibleItc: gstReturn.totalEligibleItc ?? "0",
    totalTaxPayable: gstReturn.totalTaxPayable ?? "0",
    totalTaxPaid: gstReturn.totalTaxPaid ?? "0",
    interestAmount: gstReturn.interestAmount ?? "0",
    lateFeeAmount: gstReturn.lateFeeAmount ?? "0",
    arn: gstReturn.arn,
    outward: {
      taxableValue: outwardTaxable,
      igst: outwardIgst,
      cgst: outwardCgst,
      sgst: outwardSgst,
      cess: outwardCess,
      nilRated: 0,
      exempt: 0,
      nonGst: 0,
    },
    itc: {
      importGoods: itcImportGoods,
      importServices: itcImportServices,
      capitalGoods: itcCapitalGoods,
      inwardRegular: itcInwardRegular,
      inwardRcm: itcInwardRcm,
      total: totalItc,
    },
    utilized: {
      igstForIgst: utilizedIgstForIgst,
      igstForCgst: utilizedIgstForCgst,
      igstForSgst: utilizedIgstForSgst,
      cgstForCgst: utilizedCgstForCgst,
      cgstForIgst: utilizedCgstForIgst,
      sgstForSgst: utilizedSgstForSgst,
      sgstForIgst: utilizedSgstForIgst,
    },
    payable: {
      igst: payableIgst,
      cgst: payableCgst,
      sgst: payableSgst,
      cess: payableCess,
      interest: Number(gstReturn.interestAmount ?? 0),
      lateFee: Number(gstReturn.lateFeeAmount ?? 0),
    },
    paid: {
      itcIgst: paidItcIgst,
      itcCgst: paidItcCgst,
      itcSgst: paidItcSgst,
      itcCess: paidItcCess,
      cashIgst: paidCashIgst,
      cashCgst: paidCashCgst,
      cashSgst: paidCashSgst,
      cashCess: paidCashCess,
    },
  };

  const [tenant] = await db.select({ name: tenants.name, gstin: tenants.gstin }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);

  const buffer = await renderGstr3bPdf(data, {
    name: tenant?.name ?? "Unknown",
    gstin: tenant?.gstin ?? "",
  });

  await storage.upload(BUCKETS.GST_RETURNS, storagePath, buffer, "application/pdf");
  const signedUrl = await storage.signedUrl(BUCKETS.GST_RETURNS, storagePath, 604_800);
  return { storagePath, signedUrl };
}
