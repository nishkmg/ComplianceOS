import { router } from "../index";
import { accountsRouter } from "./accounts";
import { journalEntriesRouter } from "./journal-entries";
import { balancesRouter } from "./balances";
import { fiscalYearsRouter } from "./fiscal-years";
import { onboardingRouter } from "./onboarding";
import { paymentsRouter } from "./payments";
import { receivablesRouter } from "./receivables";
import { invoiceConfigRouter } from "./invoice-config";
import { ocrScanRouter } from "./ocr-scan";
import { productsRouter } from "./products";
import { inventoryRouter } from "./inventory";
import { stockReportsRouter } from "./stock-reports";
import { employeesRouter } from "./employees";
import { salaryStructureRouter } from "./salary-structure";
import { payrollRouter } from "./payroll";
import { advancesRouter } from "./advances";
import { payslipsRouter } from "./payslips";
import { payrollReportsRouter } from "./payroll-reports";
import { gstLedgerRouter } from "./gst-ledger";
import { gstReturnsRouter } from "./gst-returns";
import { gstReconciliationRouter } from "./gst-reconciliation";
import { gstPaymentRouter } from "./gst-payment";
import { itrReturnsRouter } from "./itr-returns";
import { itrComputationRouter } from "./itr-computation";
import { itrPaymentRouter } from "./itr-payment";

export const appRouter = router({
  accounts: accountsRouter,
  journalEntries: journalEntriesRouter,
  balances: balancesRouter,
  fiscalYears: fiscalYearsRouter,
  onboarding: onboardingRouter,
  payments: paymentsRouter,
  receivables: receivablesRouter,
  invoiceConfig: invoiceConfigRouter,
  ocrScan: ocrScanRouter,
  products: productsRouter,
  inventory: inventoryRouter,
  stockReports: stockReportsRouter,
  employees: employeesRouter,
  salaryStructure: salaryStructureRouter,
  payroll: payrollRouter,
  advances: advancesRouter,
  payslips: payslipsRouter,
  payrollReports: payrollReportsRouter,
  gstLedger: gstLedgerRouter,
  gstReturns: gstReturnsRouter,
  gstReconciliation: gstReconciliationRouter,
  gstPayment: gstPaymentRouter,
  itrReturns: itrReturnsRouter,
  itrComputation: itrComputationRouter,
  itrPayment: itrPaymentRouter,
});

export type AppRouter = typeof appRouter;
