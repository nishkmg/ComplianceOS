// @ts-nocheck
import { eq } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { payrollRuns, payslips, employees, payrollLines, tenants } = _db;
import { appendEvent } from "../lib/event-store";
import { generatePayslipPDF } from "../services/payslip-pdf";

interface PayslipData {
  payrollRun: any;
  employee: any;
  lines: any[];
  company: {
    name: string;
    address?: string;
    gstin?: string;
  };
}

function generatePayslipHTML(data: PayslipData): string {
  const { payrollRun, employee, lines, company } = data;
  
  const earnings = lines.filter(l => l.componentType === "earning");
  const deductions = lines.filter(l => ["deduction", "statutory", "advance"].includes(l.componentType));
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payslip - ${employee.employeeCode}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
    .company-name { font-size: 20px; font-weight: bold; }
    .payslip-title { font-size: 16px; margin: 10px 0; }
    .employee-info { display: flex; justify-content: space-between; margin: 20px 0; }
    .info-section { width: 48%; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    .total-row { font-weight: bold; background-color: #f9f9f9; }
    .net-pay-row { font-size: 16px; font-weight: bold; background-color: #e8f5e9; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${company.name}</div>
    <div>${company.address ?? ""}</div>
    <div class="payslip-title">Payslip - ${payrollRun.month}/${payrollRun.year}</div>
  </div>
  
  <div class="employee-info">
    <div class="info-section">
      <strong>Employee:</strong> ${employee.firstName} ${employee.lastName ?? ""}<br/>
      <strong>Code:</strong> ${employee.employeeCode}<br/>
      <strong>Designation:</strong> ${employee.designation ?? "N/A"}<br/>
      <strong>PAN:</strong> ${employee.pan ?? "N/A"}<br/>
      <strong>UAN:</strong> ${employee.uan ?? "N/A"}
    </div>
    <div class="info-section">
      <strong>Pay Period:</strong> ${payrollRun.startDate} to ${payrollRun.endDate}<br/>
      <strong>Payment Date:</strong> ${payrollRun.paymentDate ?? "N/A"}<br/>
      <strong>Days Present:</strong> N/A<br/>
      <strong>Employee ID:</strong> ${employee.id}
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Earnings</th>
        <th>Amount (₹)</th>
        <th>Deductions</th>
        <th>Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${earnings.map((e, i) => `
      <tr>
        <td>${e.componentName}</td>
        <td>${parseFloat(e.amount).toFixed(2)}</td>
        <td>${deductions[i]?.componentName ?? ""}</td>
        <td>${deductions[i] ? parseFloat(deductions[i].amount).toFixed(2) : ""}</td>
      </tr>
      `).join("")}
      ${earnings.length < deductions.length ? deductions.slice(earnings.length).map(d => `
      <tr>
        <td></td>
        <td></td>
        <td>${d.componentName}</td>
        <td>${parseFloat(d.amount).toFixed(2)}</td>
      </tr>
      `).join("") : ""}
      <tr class="total-row">
        <td>Gross Earnings</td>
        <td>${parseFloat(payrollRun.grossEarnings).toFixed(2)}</td>
        <td>Gross Deductions</td>
        <td>${parseFloat(payrollRun.grossDeductions).toFixed(2)}</td>
      </tr>
      <tr class="net-pay-row">
        <td colspan="2">Net Pay</td>
        <td colspan="2">₹ ${parseFloat(payrollRun.netPay).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
  
  <div class="footer">
    <p>This is a computer-generated payslip and does not require a signature.</p>
    <p>For any queries, please contact HR/Payroll department.</p>
  </div>
</body>
</html>
  `.trim();
}

export async function generatePayslip(
  db: Database,
  tenantId: string,
  actorId: string,
  payrollRunId: string,
): Promise<{ payslipId: string; pdfUrl: string }> {
  const [payrollRun] = await db.select()
    .from(payrollRuns)
    .where(eq(payrollRuns.id, payrollRunId));

  if (!payrollRun) {
    throw new Error("Payroll run not found");
  }

  if (payrollRun.status !== "finalized") {
    throw new Error("Can only generate payslip for finalized payroll");
  }

  const [employee] = await db.select()
    .from(payrollRuns)
    .innerJoin(employees, eq(payrollRuns.employeeId, employees.id))
    .where(eq(payrollRuns.id, payrollRunId));

  const lines = await db.select()
    .from(payrollLines)
    .where(eq(payrollLines.payrollRunId, payrollRunId));

  const [tenant] = await db.select({ name: tenants.name })
    .from(tenants)
    .where(eq(tenants.id, tenantId));

  const earnings = lines
    .filter(l => l.componentType === "earning")
    .map(l => ({ label: l.componentName, amount: parseFloat(l.amount) }));
  const deductions = lines
    .filter(l => ["deduction", "statutory", "advance"].includes(l.componentType))
    .map(l => ({ label: l.componentName, amount: parseFloat(l.amount) }));

  const pdfBuffer = await generatePayslipPDF({
    employeeName: `${employee.employees.firstName} ${employee.employees.lastName ?? ""}`,
    employeeCode: employee.employees.employeeCode,
    periodMonth: parseInt(payrollRun.month),
    periodYear: parseInt(payrollRun.year),
    earnings,
    deductions,
    grossSalary: parseFloat(payrollRun.grossEarnings),
    netSalary: parseFloat(payrollRun.netPay),
    totalDeductions: parseFloat(payrollRun.grossDeductions),
  });

  const filename = `payslip-${employee.employees.employeeCode}-${payrollRun.month}-${payrollRun.year}.pdf`;
  const pdfUrl = await uploadPdfToStorage(pdfBuffer, filename, tenantId);

  const existingPayslip = await db.select()
    .from(payslips)
    .where(eq(payslips.payrollRunId, payrollRunId));

  if (existingPayslip.length > 0) {
    await db.update(payslips)
      .set({ pdfUrl })
      .where(eq(payslips.payrollRunId, payrollRunId));
    
    return { payslipId: existingPayslip[0].id, pdfUrl };
  }

  const [payslip] = // -ignore - drizzle type
          await db.insert(payslips).values({
    tenantId,
    payrollRunId,
    employeeId: payrollRun.employeeId,
    pdfUrl,
    isDistributed: false,
  }).returning();

  await appendEvent(
    db,
    tenantId,
    "payroll_run",
    payrollRunId,
    "payslip_generated",
    {
      payrollRunId,
      payslipId: payslip.id,
      pdfUrl,
    },
    actorId,
  );

  return { payslipId: payslip.id, pdfUrl };
}

async function uploadPdfToStorage(
  pdfBuffer: Buffer,
  filename: string,
  tenantId: string,
): Promise<string> {
  const bucket = process.env.STORAGE_BUCKET ?? "complianceos-payslips";
  const path = `payslips/${tenantId}/${new Date().getFullYear()}/${filename}`;
  
  // V1: Return path (actual S3 upload in production)
  // TODO: Implement S3/GCS upload in production
  return path;
}
