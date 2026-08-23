import { sql, eq, and, sum } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { fySummaries, accountBalances, accounts } = _db;
import type { Projector } from "./types";

const ACCOUNT_KIND = {
  Asset: "total_assets",
  Liability: "total_liabilities",
  Equity: "total_equity",
  Revenue: "revenue",
  Expense: "expense",
} as const;

export const fySummaryProjector: Projector = {
  name: "FYSummaryProjector",
  handles: ["journal_entry_posted", "journal_entry_voided", "fiscal_year_closed"],
  async process(db: Database, event: any): Promise<void> {
    const payload = event.payload as any;
    const tenantId = event.tenantId;
    const fiscalYear = payload.fiscalYear || payload.year;
    if (!fiscalYear) return;

    const kindTotals = await (db as any)
      .select({
        kind: accounts.kind,
        total: sql<string>`COALESCE(SUM(${accountBalances.closingBalance}), 0)`,
      })
      .from(accountBalances)
      .innerJoin(accounts, eq(accounts.id, accountBalances.accountId))
      .where(
        and(
          eq(accountBalances.tenantId, tenantId),
          eq(accountBalances.fiscalYear, fiscalYear),
        ),
      )
      .groupBy(accounts.kind);

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;
    for (const row of kindTotals) {
      const v = parseFloat(row.total || "0");
      switch (row.kind) {
        case "Asset":
          totalAssets = v;
          break;
        case "Liability":
          // credit-normal account: closing_balance = debit - credit is negative
          totalLiabilities = -v;
          break;
        case "Equity":
          totalEquity = -v;
          break;
        case "Revenue":
          totalRevenue = -v;
          break;
        case "Expense":
          totalExpenses = v;
          break;
      }
    }
    const netIncome = totalRevenue - totalExpenses;
    const netProfit = netIncome;
    const retainedEarnings = totalEquity + netIncome;

    const isClose = event.eventType === "fiscal_year_closed";
    const closedAt = isClose ? new Date(payload.closedAt || new Date()) : null;

    await (db as any).insert(fySummaries).values({
      tenantId,
      fiscalYear,
      totalAssets: String(totalAssets),
      totalLiabilities: String(totalLiabilities),
      totalEquity: String(totalEquity),
      totalRevenue: String(totalRevenue),
      totalExpenses: String(totalExpenses),
      netIncome: String(netIncome),
      netProfit: String(netProfit),
      retainedEarnings: String(retainedEarnings),
      closedAt,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: [fySummaries.tenantId, fySummaries.fiscalYear],
      set: {
        totalAssets: String(totalAssets),
        totalLiabilities: String(totalLiabilities),
        totalEquity: String(totalEquity),
        totalRevenue: String(totalRevenue),
        totalExpenses: String(totalExpenses),
        netIncome: String(netIncome),
        netProfit: String(netProfit),
        retainedEarnings: String(retainedEarnings),
        closedAt: closedAt ? new Date(closedAt) : undefined,
        updatedAt: new Date(),
      },
    });
  },
};
