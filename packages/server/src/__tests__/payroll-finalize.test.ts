import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db, tenants, users, userTenants, salaryComponents, accounts, payrollConfig, payrollRuns, journalEntries } from "../../../db/src/index";
import { eq, and } from "drizzle-orm";
import { createEmployee } from "../commands/create-employee";
import { createSalaryStructure } from "../commands/create-salary-structure";
import { processPayroll } from "../commands/process-payroll";
import { finalizePayroll } from "../commands/finalize-payroll";
import { getAggregateEvents } from "../lib/event-store";
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

async function createFinalizedRun(tenantId: string, actorId: string) {
  const employeeResult = await createEmployee(db, tenantId, actorId, {
    firstName: "Test",
    lastName: "Employee",
    employeeCode: `EMP${tenantId.slice(0, 6)}`,
    pan: "ABCDE1234F",
    email: `finalize.${tenantId.slice(0, 8)}@example.com`,
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

  await createSalaryStructure(db, tenantId, actorId, {
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

  const processResult = await processPayroll(db, tenantId, actorId, {
    employeeId: employeeResult.employeeId,
    month: "04",
    year: "2024",
    paymentDate: "2024-05-01",
  });

  return processResult.payrollRunId;
}

async function finalizeEvents(payrollRunId: string) {
  const events = await getAggregateEvents(db, payrollRunId);
  return events.filter((e) => e.eventType === "payroll_finalized");
}

function payloadOf(event: { payload: unknown }) {
  return event.payload as { payrollRunId: string; journalEntryId: string };
}

async function finalizeJournalEntries(payrollRunId: string, tenantId: string) {
  return db.select()
    .from(journalEntries)
    .where(and(
      eq(journalEntries.tenantId, tenantId),
      eq(journalEntries.referenceId, payrollRunId),
    ));
}

async function cleanupTestTenant(tenantId: string) {
  await db.delete(userTenants).where(eq(userTenants.tenantId, tenantId));
  await db.delete(tenants).where(eq(tenants.id, tenantId));
}

describe("finalizePayroll atomicity", () => {
  let tenantId: string;
  let actorId: string;

  beforeEach(async () => {
    const result = await createTestTenant();
    tenantId = result.tenantId;
    actorId = result.userId;
  });

  it("finalizes atomically: one JE, run marked finalized, one event", async () => {
    const payrollRunId = await createFinalizedRun(tenantId, actorId);

    const finalizeResult = await finalizePayroll(db, tenantId, actorId, payrollRunId);

    const [run] = await db.select().from(payrollRuns).where(eq(payrollRuns.id, payrollRunId));
    expect(run.status).toBe("finalized");
    expect(run.journalEntryId).toBe(finalizeResult.journalEntryId);
    expect(run.finalizedAt).toBeDefined();

    const jes = await finalizeJournalEntries(payrollRunId, tenantId);
    expect(jes).toHaveLength(1);
    expect(jes[0].id).toBe(finalizeResult.journalEntryId);
    expect(jes[0].referenceType).toBe("payroll");
    expect(jes[0].referenceId).toBe(payrollRunId);

    const events = await finalizeEvents(payrollRunId);
    expect(events).toHaveLength(1);
    expect(payloadOf(events[0]).payrollRunId).toBe(payrollRunId);
    expect(payloadOf(events[0]).journalEntryId).toBe(finalizeResult.journalEntryId);
  });

  it("rejects a second finalize and leaves exactly one JE + one event", async () => {
    const payrollRunId = await createFinalizedRun(tenantId, actorId);

    const first = await finalizePayroll(db, tenantId, actorId, payrollRunId);

    await expect(finalizePayroll(db, tenantId, actorId, payrollRunId))
      .rejects.toThrow(/must be in "calculated" status/);

    const jes = await finalizeJournalEntries(payrollRunId, tenantId);
    expect(jes).toHaveLength(1);
    expect(jes[0].id).toBe(first.journalEntryId);

    const events = await finalizeEvents(payrollRunId);
    expect(events).toHaveLength(1);
    expect(payloadOf(events[0]).journalEntryId).toBe(first.journalEntryId);

    const [run] = await db.select().from(payrollRuns).where(eq(payrollRuns.id, payrollRunId));
    expect(run.status).toBe("finalized");
  });

  it("serializes concurrent finalizes: exactly one wins, no duplicate salary JE", async () => {
    const payrollRunId = await createFinalizedRun(tenantId, actorId);

    const results = await Promise.allSettled([
      finalizePayroll(db, tenantId, actorId, payrollRunId),
      finalizePayroll(db, tenantId, actorId, payrollRunId),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const jes = await finalizeJournalEntries(payrollRunId, tenantId);
    expect(jes).toHaveLength(1);

    const events = await finalizeEvents(payrollRunId);
    expect(events).toHaveLength(1);
  });

  afterEach(async () => {
    await cleanupTestTenant(tenantId);
  });
});
