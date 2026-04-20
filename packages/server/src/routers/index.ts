import { router } from "../index";
import { accountsRouter } from "./accounts";
import { journalEntriesRouter } from "./journal-entries";
import { balancesRouter } from "./balances";
import { fiscalYearsRouter } from "./fiscal-years";
import { onboardingRouter } from "./onboarding";
import { invoicesRouter } from "./invoices";

export const appRouter = router({
  accounts: accountsRouter,
  journalEntries: journalEntriesRouter,
  balances: balancesRouter,
  fiscalYears: fiscalYearsRouter,
  onboarding: onboardingRouter,
  invoices: invoicesRouter,
});

export type AppRouter = typeof appRouter;
