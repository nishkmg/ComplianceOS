import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { eq, and, inArray, sql } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { accountBalances, accounts, cashFlowDefaultMapping, accountCashFlowOverrides, journalEntryView } = _db;
import type { TrialBalance, ProfitAndLoss, BalanceSheet, CashFlowStatement } from "../../../shared/src/index";

const toNum = (v: string | null | undefined) => parseFloat(v ?? "0") || 0;

export const balancesRouter = router({
  ledger: protectedProcedure
    .input(z.object({ accountId: z.string().uuid(), fiscalYear: z.string() }))
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db.query.journalEntryView.findMany({
        where: and(
          eq(journalEntryView.tenantId, ctx.tenantId),
          eq(journalEntryView.fiscalYear, input.fiscalYear),
        ),
        orderBy: (entries, { asc }) => [asc(entries.date)],
      });

      let runningBalance = 0;
      const ledgerEntries = entries
        .flatMap((entry) => {
          const lines = (entry as { lines?: { accountId: string; debit: string; credit: string }[] }).lines || [];
          const relevantLines = lines.filter((l) => l.accountId === input.accountId);
          return relevantLines.map((line) => {
            const isDebit = parseFloat(line.debit || "0") > 0;
            const amount = isDebit ? parseFloat(line.debit) : parseFloat(line.credit || "0");
            runningBalance += isDebit ? amount : -amount;
            return {
              date: entry.date,
              narration: entry.narration,
              entryNumber: entry.entryNumber,
              debit: isDebit ? line.debit : "0",
              credit: isDebit ? "0" : line.credit,
              balance: runningBalance,
            };
          });
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        accountId: input.accountId,
        fiscalYear: input.fiscalYear,
        entries: ledgerEntries,
        openingBalance: 0,
        closingBalance: runningBalance,
      };
    }),

  trialBalance: protectedProcedure
    .input(z.object({ fiscalYear: z.string() }))
    .query(async ({ ctx, input }): Promise<TrialBalance> => {
      const rows = await ctx.db
        .select({
          accountId: accountBalances.accountId,
          code: accounts.code,
          name: accounts.name,
          kind: accounts.kind,
          debitTotal: sql<string>`SUM(${accountBalances.debitTotal})::text`,
          creditTotal: sql<string>`SUM(${accountBalances.creditTotal})::text`,
        })
        .from(accountBalances)
        .innerJoin(accounts, eq(accounts.id, accountBalances.accountId))
        .where(
          and(
            eq(accountBalances.tenantId, ctx.tenantId),
            eq(accountBalances.fiscalYear, input.fiscalYear),
          ),
        )
        .groupBy(accountBalances.accountId, accounts.code, accounts.name, accounts.kind);

      let totalDebit = 0;
      let totalCredit = 0;
      const tbRows = rows.map((r) => {
        const dr = toNum(r.debitTotal);
        const cr = toNum(r.creditTotal);
        totalDebit += dr;
        totalCredit += cr;
        return {
          accountId: r.accountId,
          code: r.code,
          name: r.name,
          kind: r.kind,
          debitTotal: dr.toFixed(2),
          creditTotal: cr.toFixed(2),
        };
      });

      return {
        fiscalYear: input.fiscalYear,
        asOfDate: new Date().toISOString(),
        rows: tbRows,
        totalDebit: totalDebit.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
      };
    }),

  pAndL: protectedProcedure
    .input(z.object({ fiscalYear: z.string(), from: z.string().optional(), to: z.string().optional() }))
    .query(async ({ ctx, input }): Promise<ProfitAndLoss> => {
      const rows = await ctx.db
        .select({
          accountId: accountBalances.accountId,
          name: accounts.name,
          kind: accounts.kind,
          subType: accounts.subType,
          debitTotal: sql<string>`SUM(${accountBalances.debitTotal})::text`,
          creditTotal: sql<string>`SUM(${accountBalances.creditTotal})::text`,
        })
        .from(accountBalances)
        .innerJoin(accounts, eq(accounts.id, accountBalances.accountId))
        .where(
          and(
            eq(accountBalances.tenantId, ctx.tenantId),
            eq(accountBalances.fiscalYear, input.fiscalYear),
            inArray(accounts.kind, ["Revenue", "Expense"]),
          ),
        )
        .groupBy(accountBalances.accountId, accounts.name, accounts.kind, accounts.subType);

      const revenue: { label: string; amount: string }[] = [];
      const expenses: { label: string; amount: string }[] = [];
      const operatingRevenue: { label: string; amount: string }[] = [];
      const otherIncome: { label: string; amount: string }[] = [];
      const directExpenses: { label: string; amount: string }[] = [];
      const indirectExpenses: { label: string; amount: string }[] = [];
      let totalRevenue = 0;
      let totalExpenses = 0;

      for (const r of rows) {
        if (r.kind === "Revenue") {
          const amount = toNum(r.creditTotal) - toNum(r.debitTotal);
          totalRevenue += amount;
          revenue.push({ label: r.name, amount: amount.toFixed(2) });
          if (r.subType === "OperatingRevenue") {
            operatingRevenue.push({ label: r.name, amount: amount.toFixed(2) });
          } else {
            otherIncome.push({ label: r.name, amount: amount.toFixed(2) });
          }
        } else if (r.kind === "Expense") {
          const amount = toNum(r.debitTotal) - toNum(r.creditTotal);
          totalExpenses += amount;
          expenses.push({ label: r.name, amount: amount.toFixed(2) });
          if (r.subType === "DirectExpense") {
            directExpenses.push({ label: r.name, amount: amount.toFixed(2) });
          } else {
            indirectExpenses.push({ label: r.name, amount: amount.toFixed(2) });
          }
        }
      }

      const netProfit = totalRevenue - totalExpenses;

      return {
        fiscalYear: input.fiscalYear,
        fromPeriod: input.from ?? input.fiscalYear + "-04",
        toPeriod: input.to ?? input.fiscalYear + "-03",
        format: "schedule_iii",
        revenue: revenue.map((r) => ({ label: r.label, amount: r.amount })),
        expenses: expenses.map((e) => ({ label: e.label, amount: e.amount })),
        operatingRevenue: operatingRevenue.map((r) => ({ label: r.label, amount: r.amount })),
        otherIncome: otherIncome.map((r) => ({ label: r.label, amount: r.amount })),
        directExpenses: directExpenses.map((e) => ({ label: e.label, amount: e.amount })),
        indirectExpenses: indirectExpenses.map((e) => ({ label: e.label, amount: e.amount })),
        totalRevenue: totalRevenue.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        netProfit: netProfit.toFixed(2),
      };
    }),

  balanceSheet: protectedProcedure
    .input(z.object({ fiscalYear: z.string(), asOf: z.string().optional() }))
    .query(async ({ ctx, input }): Promise<BalanceSheet> => {
      const rows = await ctx.db
        .select({
          accountId: accountBalances.accountId,
          name: accounts.name,
          kind: accounts.kind,
          debitTotal: sql<string>`SUM(${accountBalances.debitTotal})::text`,
          creditTotal: sql<string>`SUM(${accountBalances.creditTotal})::text`,
        })
        .from(accountBalances)
        .innerJoin(accounts, eq(accounts.id, accountBalances.accountId))
        .where(
          and(
            eq(accountBalances.tenantId, ctx.tenantId),
            eq(accountBalances.fiscalYear, input.fiscalYear),
            inArray(accounts.kind, ["Asset", "Liability", "Equity"]),
          ),
        )
        .groupBy(accountBalances.accountId, accounts.name, accounts.kind);

      const equityAndLiabilities: { label: string; amount: string }[] = [];
      const assets: { label: string; amount: string }[] = [];
      let totalAssets = 0;
      let totalEquityAndLiabilities = 0;

      for (const r of rows) {
        if (r.kind === "Asset") {
          const amount = toNum(r.debitTotal) - toNum(r.creditTotal);
          totalAssets += amount;
          assets.push({ label: r.name, amount: amount.toFixed(2) });
        } else {
          const amount = toNum(r.creditTotal) - toNum(r.debitTotal);
          totalEquityAndLiabilities += amount;
          equityAndLiabilities.push({ label: r.name, amount: amount.toFixed(2) });
        }
      }

      return {
        fiscalYear: input.fiscalYear,
        asOfDate: input.asOf ?? new Date().toISOString(),
        format: "schedule_iii",
        equityAndLiabilities: equityAndLiabilities.map((r) => ({ label: r.label, amount: r.amount })),
        assets: assets.map((r) => ({ label: r.label, amount: r.amount })),
        totalEquityAndLiabilities: totalEquityAndLiabilities.toFixed(2),
        totalAssets: totalAssets.toFixed(2),
      };
    }),

  cashFlow: protectedProcedure
    .input(z.object({ fiscalYear: z.string(), from: z.string().optional(), to: z.string().optional() }))
    .query(async ({ ctx, input }): Promise<CashFlowStatement> => {
      const mappings = await ctx.db.select().from(cashFlowDefaultMapping);
      const overrides = await ctx.db
        .select()
        .from(accountCashFlowOverrides)
        .where(eq(accountCashFlowOverrides.tenantId, ctx.tenantId));
      const overrideMap = new Map(overrides.map((o) => [o.accountId, o.cashFlowCategory]));
      const subTypeMap = new Map(mappings.map((m) => [m.subType, m.cashFlowCategory]));

      const rows = await ctx.db
        .select({
          accountId: accountBalances.accountId,
          subType: accounts.subType,
          kind: accounts.kind,
          debitTotal: sql<string>`SUM(${accountBalances.debitTotal})::text`,
          creditTotal: sql<string>`SUM(${accountBalances.creditTotal})::text`,
        })
        .from(accountBalances)
        .innerJoin(accounts, eq(accounts.id, accountBalances.accountId))
        .where(
          and(
            eq(accountBalances.tenantId, ctx.tenantId),
            eq(accountBalances.fiscalYear, input.fiscalYear),
          ),
        )
        .groupBy(accountBalances.accountId, accounts.subType, accounts.kind);

      const operating: { label: string; amount: string }[] = [];
      const investing: { label: string; amount: string }[] = [];
      const financing: { label: string; amount: string }[] = [];

      let cashFromOperations = 0;
      let cashFromInvesting = 0;
      let cashFromFinancing = 0;

      for (const r of rows) {
        const category = overrideMap.get(r.accountId) ?? subTypeMap.get(r.subType) ?? "operating";
        const net = toNum(r.creditTotal) - toNum(r.debitTotal);
        if (category === "operating") {
          cashFromOperations += net;
        } else if (category === "investing") {
          cashFromInvesting += net;
        } else {
          cashFromFinancing += net;
        }
      }

      const opLabel = cashFromOperations >= 0 ? "Net cash from operating activities" : "Net cash used in operating activities";
      const invLabel = cashFromInvesting >= 0 ? "Net cash from investing activities" : "Net cash used in investing activities";
      const finLabel = cashFromFinancing >= 0 ? "Net cash from financing activities" : "Net cash used in financing activities";

      operating.push({ label: opLabel, amount: cashFromOperations.toFixed(2) });
      investing.push({ label: invLabel, amount: cashFromInvesting.toFixed(2) });
      financing.push({ label: finLabel, amount: cashFromFinancing.toFixed(2) });

      const netCashFlow = cashFromOperations + cashFromInvesting + cashFromFinancing;

      return {
        fiscalYear: input.fiscalYear,
        fromPeriod: input.from ?? input.fiscalYear + "-04",
        toPeriod: input.to ?? input.fiscalYear + "-03",
        operatingActivities: operating,
        investingActivities: investing,
        financingActivities: financing,
        netCashFlow: netCashFlow.toFixed(2),
        cashFromOperations: cashFromOperations.toFixed(2),
        cashFromInvesting: cashFromInvesting.toFixed(2),
        cashFromFinancing: cashFromFinancing.toFixed(2),
      };
    }),
});
