import { z } from "zod";
import { router, publicProcedure } from "../index";
import { eq, and } from "drizzle-orm";
import { accountBalances } from "@complianceos/db";
import type { TrialBalance, ProfitAndLoss, BalanceSheet, CashFlowStatement } from "@complianceos/shared";

export const balancesRouter = router({
  trialBalance: publicProcedure
    .input(z.object({ fiscalYear: z.string() }))
    .query(async ({ ctx, input }): Promise<TrialBalance> => {
      const rows = await ctx.db.select().from(accountBalances).where(
        and(eq(accountBalances.tenantId, ctx.tenantId), eq(accountBalances.fiscalYear, input.fiscalYear)),
      );

      return {
        fiscalYear: input.fiscalYear,
        asOfDate: new Date().toISOString(),
        rows: rows.map((r) => ({
          accountId: r.accountId,
          code: "",
          name: "",
          kind: "",
          debitTotal: r.debitTotal,
          creditTotal: r.creditTotal,
        })),
        totalDebit: rows.reduce((sum, r) => sum + parseFloat(r.debitTotal || "0"), 0).toFixed(2),
        totalCredit: rows.reduce((sum, r) => sum + parseFloat(r.creditTotal || "0"), 0).toFixed(2),
      };
    }),

  pAndL: publicProcedure
    .input(z.object({ fiscalYear: z.string(), from: z.string().optional(), to: z.string().optional() }))
    .query(async ({ ctx, input }): Promise<ProfitAndLoss> => {
      const rows = await ctx.db.select().from(accountBalances).where(
        and(eq(accountBalances.tenantId, ctx.tenantId), eq(accountBalances.fiscalYear, input.fiscalYear)),
      );

      return {
        fiscalYear: input.fiscalYear,
        fromPeriod: input.from ?? input.fiscalYear + "-04",
        toPeriod: input.to ?? input.fiscalYear + "-03",
        format: "schedule_iii",
        revenue: [],
        expenses: [],
        totalRevenue: "0",
        totalExpenses: "0",
        netProfit: "0",
      };
    }),

  balanceSheet: publicProcedure
    .input(z.object({ fiscalYear: z.string(), asOf: z.string().optional() }))
    .query(async ({ ctx, input }): Promise<BalanceSheet> => {
      return {
        fiscalYear: input.fiscalYear,
        asOfDate: input.asOf ?? new Date().toISOString(),
        format: "schedule_iii",
        equityAndLiabilities: [],
        assets: [],
        totalEquityAndLiabilities: "0",
        totalAssets: "0",
      };
    }),

  cashFlow: publicProcedure
    .input(z.object({ fiscalYear: z.string(), from: z.string().optional(), to: z.string().optional() }))
    .query(async ({ ctx, input }): Promise<CashFlowStatement> => {
      return {
        fiscalYear: input.fiscalYear,
        fromPeriod: input.from ?? input.fiscalYear + "-04",
        toPeriod: input.to ?? input.fiscalYear + "-03",
        operatingActivities: [],
        investingActivities: [],
        financingActivities: [],
        netCashFlow: "0",
        cashFromOperations: "0",
        cashFromInvesting: "0",
        cashFromFinancing: "0",
      };
    }),
});
