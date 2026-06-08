import { eq } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { itrReturns, itrReturnLines, itrSchedules } = _db;
import { appendEvent } from "../lib/event-store";
import * as _shared from "../../../shared/src/index";
const { ITRReturnStatus } = _shared;
import { renderAndUploadItrPdf, formatDate, ITR_DOCUMENTS } from "../services/itr-return-pdf";
import type { ItrFormProps, TaxpayerInfo, ITRFinancialData } from "../services/itr-return-pdf";

export type ItrFormType = "ITR-1" | "ITR-2" | "ITR-3" | "ITR-4" | "ITR-5" | "ITR-6" | "ITR-7";

export interface GenerateItrPdfInput {
  returnId: string;
  formType: ItrFormType;
}

export interface GenerateItrPdfResult {
  storagePath: string;
  signedUrl: string;
}

async function fetchTaxpayerInfo(
  db: Database,
  tenantId: string,
): Promise<TaxpayerInfo> {
  const [config] = await db.select().from(_db.tenants).where(eq(_db.tenants.id, tenantId));
  const name = config?.legalName ?? config?.name ?? "Taxpayer";
  const pan = config?.pan ?? "";
  const aadhaar = undefined;
  const address = config?.address ?? undefined;
  const email = undefined;
  const phone = undefined;
  return { name, pan, aadhaar, address, email, phone };
}

function parseNumeric(v: string | null | undefined): string {
  return v ?? "0";
}

export async function generateItrPdf(
  db: Database,
  tenantId: string,
  input: GenerateItrPdfInput,
): Promise<GenerateItrPdfResult> {
  const [itrReturn] = await db.select()
    .from(itrReturns)
    .where(eq(itrReturns.id, input.returnId));

  if (!itrReturn) throw new Error(`ITR return ${input.returnId} not found`);
  if (itrReturn.tenantId !== tenantId) throw new Error("ITR return does not belong to this tenant");

  const validStatuses = ["computed", "generated", "filed", "verified"];
  if (!validStatuses.includes(itrReturn.status)) {
    throw new Error(`Cannot generate PDF: Return status is '${itrReturn.status}'`);
  }

  const taxpayer = await fetchTaxpayerInfo(db, tenantId);

  const financial: ITRFinancialData = {
    assessmentYear: itrReturn.assessmentYear,
    financialYear: itrReturn.financialYear,
    grossTotalIncome: parseNumeric(itrReturn.grossTotalIncome),
    totalDeductions: parseNumeric(itrReturn.totalDeductions),
    totalIncome: parseNumeric(itrReturn.totalIncome),
    taxPayable: parseNumeric(itrReturn.taxPayable),
    surcharge: parseNumeric(itrReturn.surcharge),
    cess: parseNumeric(itrReturn.cess),
    rebate87a: parseNumeric(itrReturn.rebate87a),
    advanceTaxPaid: parseNumeric(itrReturn.advanceTaxPaid),
    selfAssessmentTax: parseNumeric(itrReturn.selfAssessmentTax),
    tdsTcsCredit: parseNumeric(itrReturn.tdsTcsCredit),
    totalTaxPaid: parseNumeric(itrReturn.totalTaxPaid),
    balancePayable: parseNumeric(itrReturn.balancePayable),
    refundDue: parseNumeric(itrReturn.refundDue),
  };

  const lines = await db.select().from(itrReturnLines)
    .where(eq(itrReturnLines.returnId, input.returnId));
  const scheduleDataRows = await db.select().from(itrSchedules)
    .where(eq(itrSchedules.returnId, input.returnId));

  const schedules: Record<string, Array<{ fieldCode: string; fieldValue: string; description?: string }>> = {};
  for (const line of lines) {
    if (!schedules[line.scheduleCode]) schedules[line.scheduleCode] = [];
    schedules[line.scheduleCode].push({
      fieldCode: line.fieldCode,
      fieldValue: line.fieldValue ?? "0",
      description: line.description ?? undefined,
    });
  }

  const scheduleData: Record<string, Record<string, unknown>> = {};
  for (const sd of scheduleDataRows) {
    scheduleData[sd.scheduleCode] = sd.scheduleData as Record<string, unknown>;
  }

  const allScheduleItems = lines.map(l => ({
    fieldCode: l.fieldCode,
    fieldValue: l.fieldValue ?? "0",
    description: l.description ?? undefined,
  }));

  const DocumentComponent = ITR_DOCUMENTS[input.formType];
  if (!DocumentComponent) throw new Error(`Unknown form type: ${input.formType}`);

  const props: ItrFormProps = {
    taxpayer,
    financial,
    schedules: allScheduleItems,
    scheduleData,
    generatedAt: new Date().toISOString(),
    status: itrReturn.status,
  };

  const { url, storagePath } = await renderAndUploadItrPdf(DocumentComponent, props as unknown as Record<string, unknown>, input.returnId);

  await db.update(itrReturns)
    .set({
      itrJsonUrl: storagePath,
      updatedAt: new Date(),
    })
    .where(eq(itrReturns.id, input.returnId));

  await appendEvent(
    db,
    tenantId,
    "itr_return",
    input.returnId,
    "itr_pdf_generated",
    {
      returnId: input.returnId,
      formType: input.formType,
      storagePath,
      generatedAt: new Date().toISOString(),
    },
    "system",
  );

  return { storagePath, signedUrl: url };
}
