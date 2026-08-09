import type { Database } from "@complianceos/db";
import { validateEnv } from "@complianceos/shared/lib/env";

validateEnv();

export * from "./lib/api-schemas";

export { uploadFile, getFilePath } from "./services/file-upload";
export { appRouter } from "./routers/index";
export type { AppRouter } from "./routers/index";
export { router, publicProcedure, protectedProcedure, t } from "./trpc";
export type { Context } from "./trpc";

// Commands
export { createInvoice } from "./commands/create-invoice";
export { createPayrollRun } from "./commands/create-payroll-run";
export { createJournalEntry } from "./commands/create-journal-entry";
export { postJournalEntry } from "./commands/post-journal-entry";
export { closeFiscalYear } from "./commands/close-fiscal-year";
export { createFiscalYear } from "./commands/create-fiscal-year";
export { recordPayment } from "./commands/record-payment";
export { createAccount } from "./commands/create-account";
export { createProduct } from "./commands/create-product";
export { modifyInvoice } from "./commands/modify-invoice";
export { bootstrapTenant } from "./commands/bootstrap-tenant";
export { generateGstr1Pdf } from "./commands/generate-gstr1-pdf";
export { generateGstr2bPdf } from "./commands/generate-gstr2b-pdf";
export { generateGstr3bPdf } from "./commands/generate-gstr3b-pdf";
export { generateGstr9Pdf } from "./commands/generate-gstr9-pdf";
export { generateItrPdf } from "./commands/generate-itr-pdf";
export { generateEwayBillForInvoice } from "./commands/generate-ewb";
export { generateInvoiceIrn } from "./commands/generate-irn";

// GSP adapter
export { createGspAdapter } from "./services/gsp/index";
export type { GspAdapter } from "./services/gsp/adapter";

// E-filing
export { createEfilingAdapter } from "./services/efiling/index";
export type { EfilingAdapter } from "./services/efiling/adapter";

// E-way-bill
export { generateEwayBill, cancelEwayBill, extendValidity } from "./services/eway-bill";
export type { EwbPartA, EwbPartB, EwbResponse } from "./services/eway-bill";
