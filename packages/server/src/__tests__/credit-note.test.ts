import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db, tenants, users, userTenants, accounts, invoices, invoiceLines, creditNotes, journalEntries, journalEntryLines, eventStore } from "../../../db/src/index";
import { eq, and, like } from "drizzle-orm";
import { randomUUID } from "crypto";
import { createInvoice } from "../commands/create-invoice";
import { postInvoice } from "../commands/post-invoice";
import { createCreditNote } from "../commands/create-credit-note";
import { createAccount } from "../commands/create-account";

const stamp = randomUUID().slice(0, 8);

async function makeTenant() {
  const tenantId = randomUUID();
  await db.insert(tenants).values({
    id: tenantId,
    name: `CN Test ${stamp}`,
    pan: `AAACT${stamp.toUpperCase()}P`,
    address: "Test Address",
    state: "karnataka",
    stateCode: "29",
  });
  return tenantId;
}

async function makeAccounts(tenantId: string, actorId: string) {
  const mk = (name: string, kind: string, subType: string) =>
    createAccount(db, tenantId, actorId, { code: `${kind.slice(0, 3).toUpperCase()}-${randomUUID().slice(0, 6)}`, name, kind, subType });
  const revenue = await mk("Sales Revenue", "Revenue", "OperatingRevenue");
  const receivable = await mk("Accounts Receivable", "Asset", "CurrentAsset");
  const cgstInput = await mk("CGST Input", "Asset", "CurrentAsset");
  const sgstInput = await mk("SGST Input", "Asset", "CurrentAsset");
  const cgstOutput = await mk("CGST Output", "Liability", "CurrentLiability");
  const sgstOutput = await mk("SGST Output", "Liability", "CurrentLiability");
  return {
    revenue: revenue.accountId,
    receivable: receivable.accountId,
    cgstInput: cgstInput.accountId,
    sgstInput: sgstInput.accountId,
    cgstOutput: cgstOutput.accountId,
    sgstOutput: sgstOutput.accountId,
  };
}

describe("Credit note flow", () => {
  let tenantId: string;
  let actorId: string;
  let acc: Awaited<ReturnType<typeof makeAccounts>>;

  beforeEach(async () => {
    tenantId = await makeTenant();
    actorId = randomUUID();
    await db.insert(users).values({ id: actorId, email: `cn-${stamp}-${tenantId.slice(0, 6)}@example.com` });
    await db.insert(userTenants).values({ userId: actorId, tenantId, role: "owner" });
    acc = await makeAccounts(tenantId, actorId);
  });

  afterEach(async () => {
    const jes = await db.select({ id: journalEntries.id }).from(journalEntries).where(eq(journalEntries.tenantId, tenantId));
    for (const je of jes) {
      await db.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, je.id));
    }
    await db.delete(journalEntries).where(eq(journalEntries.tenantId, tenantId));
    await db.delete(eventStore).where(eq(eventStore.tenantId, tenantId));
    const invs = await db.select({ id: invoices.id }).from(invoices).where(eq(invoices.tenantId, tenantId));
    for (const i of invs) {
      await db.delete(invoiceLines).where(eq(invoiceLines.invoiceId, i.id));
    }
    await db.delete(creditNotes).where(eq(creditNotes.tenantId, tenantId));
    await db.delete(invoices).where(eq(invoices.tenantId, tenantId));
    await db.delete(accounts).where(eq(accounts.tenantId, tenantId));
    await db.delete(userTenants).where(eq(userTenants.tenantId, tenantId));
    await db.delete(users).where(like(users.email, `cn-${stamp}-%`));
    await db.delete(tenants).where(eq(tenants.id, tenantId));
  });

  it("creates a linked credit note with reversing journal entry", async () => {
    const inv = await createInvoice(db, tenantId, actorId, {
      date: "2026-04-10",
      dueDate: "2026-05-10",
      customerName: "Acme Traders",
      customerState: "karnataka",
      lines: [
        { accountId: acc.revenue, description: "Widgets", quantity: 2, unitPrice: 500, gstRate: 18 },
      ],
      notes: "test",
    });
    await postInvoice(db, tenantId, actorId, inv.invoiceId);

    const res = await createCreditNote(db, tenantId, actorId, {
      originalInvoiceId: inv.invoiceId,
      date: "2026-04-15",
      customerName: "Acme Traders",
      reason: "Damaged goods returned",
      lines: [
        { accountId: acc.revenue, description: "Widgets (return)", quantity: 1, unitPrice: 500, gstRate: 18 },
      ],
    });

    expect(res.creditNoteNumber).toMatch(/^CN/);

    const [note] = await db.select().from(creditNotes).where(eq(creditNotes.id, res.creditNoteId)).limit(1);
    expect(note.customerName).toBe("Acme Traders");
    expect(note.originalInvoiceId).toBe(inv.invoiceId);
    expect(note.status).toBe("issued");
    // 1 × 500 + 18% GST reversed → grand total −590
    expect(Number(note.grandTotal)).toBeCloseTo(-590, 2);

    // Reversing JE exists, referenced to the credit note
    const [je] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.referenceId, res.creditNoteId), eq(journalEntries.tenantId, tenantId)))
      .limit(1);
    expect(je).toBeDefined();
    expect(je.referenceType).toBe("credit_note");
  });

  it("rejects a credit note exceeding the original invoice amount", async () => {
    const inv = await createInvoice(db, tenantId, actorId, {
      date: "2026-04-10",
      dueDate: "2026-05-10",
      customerName: "Acme Traders",
      customerState: "karnataka",
      lines: [
        { accountId: acc.revenue, description: "Widgets", quantity: 1, unitPrice: 100, gstRate: 18 },
      ],
      notes: "test",
    });

    await expect(
      createCreditNote(db, tenantId, actorId, {
        originalInvoiceId: inv.invoiceId,
        date: "2026-04-15",
        customerName: "Acme Traders",
        reason: "Over-credit attempt",
        lines: [
          { accountId: acc.revenue, description: "Too much", quantity: 10, unitPrice: 100, gstRate: 18 },
        ],
      }),
    ).rejects.toThrow(/exceeds/);
  });

  it("rejects credit note for a different customer than the invoice", async () => {
    const inv = await createInvoice(db, tenantId, actorId, {
      date: "2026-04-10",
      dueDate: "2026-05-10",
      customerName: "Acme Traders",
      customerState: "karnataka",
      lines: [
        { accountId: acc.revenue, description: "Widgets", quantity: 1, unitPrice: 100, gstRate: 18 },
      ],
      notes: "test",
    });

    await expect(
      createCreditNote(db, tenantId, actorId, {
        originalInvoiceId: inv.invoiceId,
        date: "2026-04-15",
        customerName: "Someone Else",
        reason: "Wrong customer",
        lines: [
          { accountId: acc.revenue, description: "x", quantity: 1, unitPrice: 100, gstRate: 18 },
        ],
      }),
    ).rejects.toThrow(/must match/);
  });
});
