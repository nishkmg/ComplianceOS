import type { Database } from "@complianceos/db";
import { validateEnv } from "@complianceos/shared/lib/env";

validateEnv();

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
export { recordPayment } from "./commands/record-payment";
export { createAccount } from "./commands/create-account";
export { createProduct } from "./commands/create-product";
export { modifyInvoice } from "./commands/modify-invoice";
export { bootstrapTenant } from "./commands/bootstrap-tenant";
