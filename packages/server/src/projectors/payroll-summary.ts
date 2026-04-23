// @ts-nocheck
import type { Projector } from "./types";
import { eq, and } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { payrollSummary, payrollRuns, employees } = _db;

export const payrollSummaryProjector: Projector = {
  name: "payroll_summary",
  handles: ["payroll_finalized", "payroll_voided"],
  async process(db, event) {
    const payload = event.payload as any;
    const payrollRunId = payload.payrollRunId;

    const [payrollRun] = await db.select()
      .from(payrollRuns)
      .where(eq(payrollRuns.id, payrollRunId));

    if (!payrollRun) return;

    const [employee] = await db.select({
      firstName: employees.firstName,
      lastName: employees.lastName,
      employeeCode: employees.employeeCode,
    })
      .from(employees)
      .where(eq(employees.id, payrollRun.employeeId));

    if (!employee) return;

    const employeeName = `${employee.firstName} ${employee.lastName ?? ""}`.trim();

    if (event.eventType === "payroll_finalized") {
      await db.insert(payrollSummary).values({
        tenantId: event.tenantId,
        employeeId: payrollRun.employeeId,
        employeeName,
        employeeCode: employee.employeeCode,
        month: payrollRun.month,
        year: payrollRun.year,
        grossEarnings: payrollRun.grossEarnings,
        grossDeductions: payrollRun.grossDeductions,
        netPay: payrollRun.netPay,
        pfTotal: String(parseFloat(payrollRun.pfEe ?? "0") + parseFloat(payrollRun.pfEr ?? "0")),
        esiTotal: String(parseFloat(payrollRun.esiEe ?? "0") + parseFloat(payrollRun.esiEr ?? "0")),
        tdsDeducted: payrollRun.tdsDeducted,
        paymentDate: payrollRun.paymentDate,
        status: "finalized",
      }).onConflictDoUpdate({
        target: [
          payrollSummary.tenantId,
          payrollSummary.employeeId,
          payrollSummary.month,
          payrollSummary.year,
        ],
        set: {
          grossEarnings: payrollRun.grossEarnings,
          grossDeductions: payrollRun.grossDeductions,
          netPay: payrollRun.netPay,
          pfTotal: String(parseFloat(payrollRun.pfEe ?? "0") + parseFloat(payrollRun.pfEr ?? "0")),
          esiTotal: String(parseFloat(payrollRun.esiEe ?? "0") + parseFloat(payrollRun.esiEr ?? "0")),
          tdsDeducted: payrollRun.tdsDeducted,
          paymentDate: payrollRun.paymentDate,
          status: "finalized",
        },
      });
    } else if (event.eventType === "payroll_voided") {
      await db.update(payrollSummary)
        .set({ status: "voided" })
        .where(
          and(
            eq(payrollSummary.tenantId, event.tenantId),
            eq(payrollSummary.employeeId, payrollRun.employeeId),
            eq(payrollSummary.month, payrollRun.month),
            eq(payrollSummary.year, payrollRun.year)
          )
        );
    }
  },
};
