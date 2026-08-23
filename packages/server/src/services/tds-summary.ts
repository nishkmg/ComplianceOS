import { and, eq, sql } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";

const { payrollRuns, payrollLines } = _db;

export interface TdsSec192Summary {
  quarter: number;
  fiscalYear: string;
  monthRange: string;
  totalTdsDeducted: number;
  totalSalariesProcessed: number;
  months: Array<{ label: string; month: string; year: string; tdsDeducted: number }>;
}

const QUARTER_MONTHS: Record<number, { months: number[]; labels: string[] }> = {
  1: { months: [4, 5, 6], labels: ["Apr", "May", "Jun"] },
  2: { months: [7, 8, 9], labels: ["Jul", "Aug", "Sep"] },
  3: { months: [10, 11, 12], labels: ["Oct", "Nov", "Dec"] },
  4: { months: [1, 2, 3], labels: ["Jan", "Feb", "Mar"] },
};

export async function buildTdsSec192Summary(
  db: Database,
  tenantId: string,
  quarter: number,
  fiscalYear: string,
): Promise<TdsSec192Summary> {
  const q = QUARTER_MONTHS[quarter] ?? QUARTER_MONTHS[1];
  const fyStart = Number(fiscalYear.split("-")[0]);
  const months: TdsSec192Summary["months"] = [];
  let totalTdsDeducted = 0;
  let totalSalariesProcessed = 0;

  for (let i = 0; i < q.months.length; i++) {
    const calMonth = q.months[i];
    // Indian FY: Apr-Sep are in the first calendar year, Oct-Mar in the second
    const calYear = calMonth >= 4 ? fyStart : fyStart + 1;
    const monthStr = String(calMonth).padStart(2, "0");
    const yearStr = String(calYear);

    // payroll_runs has month/year as text columns per employee run
    const rows = await db
      .select({
        tdsTotal: sql<number>`COALESCE(SUM(${payrollLines.amount}), 0)`,
        runsCount: sql<number>`COUNT(DISTINCT ${payrollLines.payrollRunId})`,
      })
      .from(payrollLines)
      .innerJoin(payrollRuns, eq(payrollLines.payrollRunId, payrollRuns.id))
      .where(
        and(
          eq(payrollRuns.tenantId, tenantId),
          eq(payrollRuns.fiscalYear, fiscalYear),
          eq(payrollRuns.month, monthStr),
          eq(payrollRuns.year, yearStr),
          eq(payrollLines.componentCode, "tds"),
        ),
      );

    const tds = Number(rows[0]?.tdsTotal ?? 0);
    const runs = Number(rows[0]?.runsCount ?? 0);
    totalTdsDeducted += tds;
    totalSalariesProcessed += runs;
    months.push({ label: q.labels[i], month: monthStr, year: yearStr, tdsDeducted: Math.round(tds * 100) / 100 });
  }

  return {
    quarter,
    fiscalYear,
    monthRange: `${q.labels[0]} – ${q.labels[2]} ${fiscalYear}`,
    totalTdsDeducted: Math.round(totalTdsDeducted * 100) / 100,
    totalSalariesProcessed,
    months,
  };
}
