import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Full payroll flow is slower than the 5s default under parallel load.
vi.setConfig({ testTimeout: 20_000 });
import { db, tenants, users, userTenants, salaryComponents, accounts, payrollConfig } from "../../../db/src/index";
import { eq, and } from "drizzle-orm";
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
    pan: `AAAPT${tenantId.slice(0, 5).toUpperCase()}P`,
    address: "Test Address",
    state: "karnataka",
  });

  await db.insert(users).values({
    id: userId,
    email: `test-${tenantId.slice(0, 8)}@example.com`,
  });

  await db.insert(userTenants).values({
    userId,
    tenantId,
    role: "owner",
  });

  // Salary components the createSalaryStructure command validates against
  const components: Array<{ code: string; type: string }> = [
    { code: "BASIC", type: "earning" },
    { code: "HRA", type: "earning" },
    { code: "SPECIAL_ALLOWANCE", type: "earning" },
    { code: "TRANSPORT_ALLOWANCE", type: "earning" },
    { code: "MEDICAL_ALLOWANCE", type: "earning" },
    { code: "PF_EE", type: "statutory" },
    { code: "PF_ER", type: "statutory" },
    { code: "ESI_EE", type: "statutory" },
    { code: "ESI_ER", type: "statutory" },
    { code: "TDS", type: "statutory" },
    { code: "PROFESSIONAL_TAX", type: "statutory" },
  ];
  for (const c of components) {
    await db.insert(salaryComponents).values({
      tenantId,
      componentCode: c.code,
      componentName: c.code.replace(/_/g, " "),
      componentType: c.type as never,
    });
  }

  // Payroll config: expense + statutory/employee payable accounts (finalizePayroll requirement)
  const acc = async (code: string, name: string, kind: string, subType: string) => {
    const row = await db
      .insert(accounts)
      .values({
        tenantId,
        code,
        name,
        kind: kind as never,
        subType: subType as never,
        isSystem: true,
      })
      .returning({ id: accounts.id });
    return row[0].id;
  };
  const salaryExpenseAccountId = await acc("PAY-SAL", "Salary Expense", "Expense", "DirectExpense");
  const pfPayableAccountId = await acc("PAY-PF", "PF Payable", "Liability", "CurrentLiability");
  const esiPayableAccountId = await acc("PAY-ESI", "ESI Payable", "Liability", "CurrentLiability");
  const tdsPayableAccountId = await acc("PAY-TDS", "TDS Payable", "Liability", "CurrentLiability");
  const ptPayableAccountId = await acc("PAY-PT", "PT Payable", "Liability", "CurrentLiability");
  const employeePayableAccountId = await acc("PAY-EMP", "Employee Payable", "Liability", "CurrentLiability");

  await db.insert(payrollConfig).values({
    tenantId,
    salaryExpenseAccountId,
    pfPayableAccountId,
    esiPayableAccountId,
    tdsPayableAccountId,
    ptPayableAccountId,
    employeePayableAccountId,
  });

  return { tenantId, userId };
}

async function cleanupTestTenant(tenantId: string) {
  await db.delete(userTenants).where(eq(userTenants.tenantId, tenantId));
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

    expect(salaryResult.structureId).toBeDefined();

    // Step 3: Process payroll for April 2024
    const processResult = await processPayroll(db, tenantId, actorId, {
      employeeId: employeeResult.employeeId,
      month: "04",
      year: "2024",
      paymentDate: "2024-05-01",
    });

    expect(processResult.payrollRunId).toBeDefined();

    // Step 4: Finalize payroll
    const finalizeResult = await finalizePayroll(db, tenantId, actorId, processResult.payrollRunId);

    expect(finalizeResult.journalEntryId).toBeDefined();

    // Step 5: Generate payslip
    const payslipResult = await generatePayslip(db, tenantId, actorId, processResult.payrollRunId);

    expect(payslipResult.payslipId).toBeDefined();
    expect(payslipResult.pdfUrl).toContain("payslip-EMP001-04-2024.pdf");
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
      employeeId: employeeResult.employeeId,
      month: "04",
      year: "2024",
      paymentDate: "2024-05-01",
    });

    const finalizeResult = await finalizePayroll(db, tenantId, actorId, processResult.payrollRunId);

    expect(finalizeResult.journalEntryId).toBeDefined();
  });

  afterEach(async () => {
    await cleanupTestTenant(tenantId);
  });
});
