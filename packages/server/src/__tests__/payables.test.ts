import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db, tenants, users, userTenants, accounts, purchaseBills, purchaseBillLines, journalEntries, journalEntryLines, eventStore } from "../../../db/src/index";
import { eq, like } from "drizzle-orm";
import { randomUUID } from "crypto";
import { createAccount } from "../commands/create-account";
import { createBill } from "../commands/create-bill";
import { payBill } from "../commands/pay-bill";

const stamp = randomUUID().slice(0, 8);

describe("Payables (purchase bills) flow", () => {
  let tenantId: string;
  let actorId: string;
  let vendorAccountId: string;
  let expenseAccountId: string;
  let bankAccountId: string;

  beforeEach(async () => {
    tenantId = randomUUID();
    actorId = randomUUID();
    await db.insert(tenants).values({
      id: tenantId,
      name: `Pay Test ${stamp}`,
      pan: `AAAPY${stamp.toUpperCase()}P`,
      address: "Test Address",
      state: "karnataka",
      stateCode: "29",
    });
    await db.insert(users).values({ id: actorId, email: `pay-${stamp}-${tenantId.slice(0, 6)}@example.com` });
    await db.insert(userTenants).values({ userId: actorId, tenantId, role: "owner" });

    const vendor = await createAccount(db, tenantId, actorId, { code: `VEN-${stamp}`, name: "Acme Suppliers", kind: "Liability", subType: "CurrentLiability" });
    const expense = await createAccount(db, tenantId, actorId, { code: `EXP-${stamp}`, name: "Purchases", kind: "Expense", subType: "DirectExpense" });
    const bank = await createAccount(db, tenantId, actorId, { code: `BNK-${stamp}`, name: "HDFC Bank", kind: "Asset", subType: "Bank" });
    vendorAccountId = vendor.accountId;
    expenseAccountId = expense.accountId;
    bankAccountId = bank.accountId;
  });

  afterEach(async () => {
    const jes = await db.select({ id: journalEntries.id }).from(journalEntries).where(eq(journalEntries.tenantId, tenantId));
    for (const je of jes) await db.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, je.id));
    await db.delete(journalEntries).where(eq(journalEntries.tenantId, tenantId));
    await db.delete(eventStore).where(eq(eventStore.tenantId, tenantId));
    const bills = await db.select({ id: purchaseBills.id }).from(purchaseBills).where(eq(purchaseBills.tenantId, tenantId));
    for (const b of bills) await db.delete(purchaseBillLines).where(eq(purchaseBillLines.billId, b.id));
    await db.delete(purchaseBills).where(eq(purchaseBills.tenantId, tenantId));
    await db.delete(accounts).where(eq(accounts.tenantId, tenantId));
    await db.delete(userTenants).where(eq(userTenants.tenantId, tenantId));
    await db.delete(users).where(like(users.email, `pay-${stamp}-%`));
    await db.delete(tenants).where(eq(tenants.id, tenantId));
  });

  it("creates a bill with intra-state tax and a vendor credit JE", async () => {
    const res = await createBill(db, tenantId, actorId, {
      billNumber: "SUP-001",
      vendorAccountId,
      vendorName: "Acme Suppliers",
      vendorState: "karnataka",
      billDate: "2026-05-01",
      dueDate: "2026-05-31",
      lines: [{ accountId: expenseAccountId, description: "Raw material", quantity: 10, unitPrice: 100, gstRate: 18 }],
    });

    expect(Number(res.grandTotal)).toBeCloseTo(1180, 2);

    const [bill] = await db.select().from(purchaseBills).where(eq(purchaseBills.id, res.billId)).limit(1);
    expect(bill.status).toBe("open");
    expect(Number(bill.cgstTotal)).toBeCloseTo(90, 2);
    expect(Number(bill.igstTotal)).toBeCloseTo(0, 2);
    expect(Number(bill.sgstTotal)).toBeCloseTo(90, 2);

    const [je] = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.referenceId, res.billId))
      .limit(1);
    expect(je.referenceType).toBe("purchase_bill");
  });

  it("treats an out-of-state vendor as inter-state (IGST)", async () => {
    const res = await createBill(db, tenantId, actorId, {
      billNumber: "SUP-002",
      vendorAccountId,
      vendorName: "Acme Suppliers",
      vendorState: "maharashtra",
      billDate: "2026-05-01",
      dueDate: "2026-05-31",
      lines: [{ accountId: expenseAccountId, description: "Raw material", quantity: 10, unitPrice: 100, gstRate: 18 }],
    });
    const [bill] = await db.select().from(purchaseBills).where(eq(purchaseBills.id, res.billId)).limit(1);
    expect(Number(bill.igstTotal)).toBeCloseTo(180, 2);
    expect(Number(bill.cgstTotal)).toBeCloseTo(0, 2);
  });

  it("records partial then full payment and flips status", async () => {
    const res = await createBill(db, tenantId, actorId, {
      billNumber: "SUP-003",
      vendorAccountId,
      vendorName: "Acme Suppliers",
      vendorState: "karnataka",
      billDate: "2026-05-01",
      dueDate: "2026-05-31",
      lines: [{ accountId: expenseAccountId, description: "Raw material", quantity: 10, unitPrice: 100, gstRate: 18 }],
    });

    const partial = await payBill(db, tenantId, actorId, {
      billId: res.billId,
      amount: 500,
      date: "2026-05-10",
      paymentAccountId: bankAccountId,
    });
    expect(partial.status).toBe("partial");
    expect(partial.remaining).toBeCloseTo(680, 2);

    const full = await payBill(db, tenantId, actorId, {
      billId: res.billId,
      amount: 680,
      date: "2026-05-20",
      paymentAccountId: bankAccountId,
    });
    expect(full.status).toBe("paid");
    expect(full.remaining).toBeCloseTo(0, 2);

    const [bill] = await db.select().from(purchaseBills).where(eq(purchaseBills.id, res.billId)).limit(1);
    expect(bill.status).toBe("paid");
    expect(Number(bill.paidAmount)).toBeCloseTo(1180, 2);
  });

  it("rejects overpayment", async () => {
    const res = await createBill(db, tenantId, actorId, {
      billNumber: "SUP-004",
      vendorAccountId,
      vendorName: "Acme Suppliers",
      vendorState: "karnataka",
      billDate: "2026-05-01",
      dueDate: "2026-05-31",
      lines: [{ accountId: expenseAccountId, description: "Raw material", quantity: 1, unitPrice: 100, gstRate: 18 }],
    });
    await expect(
      payBill(db, tenantId, actorId, {
        billId: res.billId,
        amount: 9999,
        date: "2026-05-10",
        paymentAccountId: bankAccountId,
      }),
    ).rejects.toThrow(/exceeds/i);
  });
});
