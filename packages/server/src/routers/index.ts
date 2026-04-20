import { router } from "../index";
import { accountsRouter } from "./accounts";
import { journalEntriesRouter } from "./journal-entries";
import { balancesRouter } from "./balances";
import { fiscalYearsRouter } from "./fiscal-years";
import { onboardingRouter } from "./onboarding";
import { paymentsRouter } from "./payments";
import { receivablesRouter } from "./receivables";
import { invoiceConfigRouter } from "./invoice-config";

export const appRouter = router({
  accounts: accountsRouter,
  journalEntries: journalEntriesRouter,
  balances: balancesRouter,
  fiscalYears: fiscalYearsRouter,
  onboarding: onboardingRouter,
  payments: paymentsRouter,
  receivables: receivablesRouter,
  invoiceConfig: invoiceConfigRouter,
});

export type AppRouter = typeof appRouter;
