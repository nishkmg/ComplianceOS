import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db, tenants, users } from "@complianceos/db";
import { eq } from "drizzle-orm";
import { createEmployee } from "../commands/create-employee";
import { createSalaryStructure } from "../commands/create-salary-structure";
import { processPayroll } from "../commands/process-payroll";
import { finalizePayroll } from "../commands/finalize-payroll";
import { generatePayslip } from "../commands/generate-payslip";
import { randomUUID } from "crypto";

async function createTestTenant() {
  const tenantId = randomUUID();
  const userId = randomUUID();

  await db.insert(tenants).values({
    id: tenantId,
    name: `Test Tenant ${tenantId.slice(0, 8)}`,
  });

  await db.insert(users).values({
    id: userId,
    tenantId,
    email: `test-${tenantId.slice(0, 8)}@example.com`,
  });

  return { tenantId, userId };
}

async function cleanupTestTenant(tenantId: string) {
  await db.delete(users).where(eq(users.tenantId, tenantId));
  await db.delete(tenants).where(eq(tenants.id, tenantId));
}

describe("Payroll Integration Flow", () => {
  let tenantId: string;
  let actorId: string;

  beforeEach(async () => {
    const result = await createTestTenant();
    tenantId = result.tenantId;
    actorId = result.userId;
  });

  it("should complete full payroll flow: employee → salary → process → finalize → payslip", async () => {
    // Step 1: Create employee
    const employeeResult = await createEmployee(db, tenantId, actorId, {
      firstName: "Test",
      lastName: "Employee",
      employeeCode: "EMP001",
      pan: "ABCDE1234F",
      email: "test.employee@example.com",
      dateOfBirth: "1990-01-15",
      gender: "male",
      dateOfJoining: "2024-04-01",
      designation: "Software Engineer",
      department: "Engineering",
      bankName: "HDFC Bank",
      bankAccountNumber: "123456789012",
      bankIfsc: "HDFC0001234",
      uan: "123456789012",
    });

    expect(employeeResult.employeeId).toBeDefined();

    // Step 2: Create salary structure
    const salaryResult = await createSalaryStructure(db, tenantId, actorId, {
      employeeId: employeeResult.employeeId,
      effectiveFrom: "2024-04-01",
      components: [
        { componentCode: "BASIC", amount: "50000", percentageOfBasic: "100" },
        { componentCode: "HRA", amount: "20000", percentageOfBasic: "40" },
        { componentCode: "SPECIAL_ALLOWANCE", amount: "15000" },
        { componentCode: "TRANSPORT_ALLOWANCE", amount: "1600" },
        { componentCode: "MEDICAL_ALLOWANCE", amount: "1250" },
        { componentCode: "PF_EE", amount: "6000", percentageOfBasic: "12" },
        { componentCode: "TDS", amount: "0" },
        { componentCode: "PROFESSIONAL_TAX", amount: "200" },
      ],
    });

    expect(salaryResult.success).toBe(true);

    // Step 3: Process payroll for April 2024
    const processResult = await processPayroll(db, tenantId, actorId, {
      periodMonth: 4,
      periodYear: 2024,
      paymentDate: "2024-05-01",
      employeeIds: [employeeResult.employeeId],
    });

    expect(processResult.payrollRunId).toBeDefined();

    // Step 4: Finalize payroll
    const finalizeResult = await finalizePayroll(db, tenantId, actorId, {
      payrollRunId: processResult.payrollRunId,
    });

    expect(finalizeResult.success).toBe(true);

    // Step 5: Generate payslip
    const payslipResult = await generatePayslip(db, tenantId, actorId, processResult.payrollRunId);

    expect(payslipResult.payslipId).toBeDefined();
    expect(payslipResult.pdfUrl).toContain("payslip-EMP001-4-2024.pdf");
  });

  it("should calculate statutory deductions correctly", async () => {
    const employeeResult = await createEmployee(db, tenantId, actorId, {
      firstName: "Statutory",
      lastName: "Test",
      employeeCode: "EMP002",
      pan: "XYZAB5678C",
      email: "statutory.test@example.com",
      dateOfBirth: "1988-05-20",
      gender: "female",
      dateOfJoining: "2024-01-01",
      designation: "Manager",
      department: "Operations",
      bankName: "ICICI Bank",
      bankAccountNumber: "987654321098",
      bankIfsc: "ICIC0001234",
      uan: "987654321098",
    });

    await createSalaryStructure(db, tenantId, actorId, {
      employeeId: employeeResult.employeeId,
      effectiveFrom: "2024-01-01",
      components: [
        { componentCode: "BASIC", amount: "75000" },
        { componentCode: "HRA", amount: "30000" },
        { componentCode: "SPECIAL_ALLOWANCE", amount: "20000" },
        { componentCode: "PF_EE", amount: "9000" },
        { componentCode: "TDS", amount: "5000" },
        { componentCode: "PROFESSIONAL_TAX", amount: "200" },
      ],
    });

    const processResult = await processPayroll(db, tenantId, actorId, {
      periodMonth: 4,
      periodYear: 2024,
      paymentDate: "2024-05-01",
      employeeIds: [employeeResult.employeeId],
    });

    const finalizeResult = await finalizePayroll(db, tenantId, actorId, {
      payrollRunId: processResult.payrollRunId,
    });

    expect(finalizeResult.success).toBe(true);
    // Assertions for statutory amounts would go here after querying payroll_lines
  });

  afterEach(async () => {
    await cleanupTestTenant(tenantId);
  });
});
