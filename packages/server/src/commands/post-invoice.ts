// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { invoices, invoiceLines, accounts, journalEntries, journalEntryLines } = _db;
import { createJournalEntry } from "./create-journal-entry";
import { appendEvent } from "../lib/event-store";

export async function postInvoice(
  db: Database,
  tenantId: string,
  actorId: string,
  invoiceId: string,
): Promise<{ invoiceId: string; journalEntryId: string }> {
  // Load invoice
  const invoice = await db.select().from(invoices).where(
    and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)),
  ).limit(1);

  if (invoice.length === 0) {
    throw new Error("Invoice not found");
  }

  if (invoice[0].status !== "draft") {
    throw new Error(`Invoice status must be draft, got: ${invoice[0].status}`);
  }

  // Load lines
  const lines = await db.select().from(invoiceLines).where(eq(invoiceLines.invoiceId, invoiceId));

  if (lines.length === 0) {
    throw new Error("Invoice has no lines");
  }

  // Validate accounts are leaf + Revenue kind
  const accountIds = lines.map((l) => l.accountId);
  const accountRows = await db.select({
    id: accounts.id,
    isLeaf: accounts.isLeaf,
    kind: accounts.kind,
  }).from(accounts).where(
    and(eq(accounts.tenantId, tenantId), eq(accounts.isLeaf, true)),
  );

  const accountMap = new Map(accountRows.map((a) => [a.id, a]));
  for (const line of lines) {
    const acc = accountMap.get(line.accountId);
    if (!acc) {
      throw new Error(`Account ${line.accountId} not found or not a leaf account`);
    }
    if (acc.kind !== "Revenue") {
      throw new Error(`Account ${line.accountId} must be a Revenue account, got: ${acc.kind}`);
    }
  }

  // Find or create Trade Receivable account for this customer
  // Pattern: look for accounts with name containing customer name + "Receivable"
  // For simplicity, use a default "Trade Receivables" account
  let receivableAccountId: string | null = null;
  const receivableAccounts = accountRows.filter(
    (a) => a.kind === "Asset" && (a.id.includes("receivable") || a.id.includes("debtor")),
  );
  
  if (receivableAccounts.length > 0) {
    receivableAccountId = receivableAccounts[0].id;
  } else {
    // Fallback: look for any asset account with "Receivable" in name
    const allAccounts = await db.select({ id: accounts.id, name: accounts.name, kind: accounts.kind })
      .from(accounts).where(eq(accounts.tenantId, tenantId));
    const receivable = allAccounts.find(
      (a) => a.kind === "Asset" && a.name.toLowerCase().includes("receivable"),
    );
    receivableAccountId = receivable?.id ?? null;
  }

  if (!receivableAccountId) {
    throw new Error("No Trade Receivable account found. Please create one.");
  }

  // Build JE lines
  // Dr Trade Receivable (grand total)
  // Cr Revenue accounts (per line amount, without GST)
  // Cr CGST Output / SGST Output / IGST Output (per line gst amounts)

  const jeLines: Array<{ accountId: string; debit: string; credit: string; description?: string }> = [];

  // Dr Receivable
  jeLines.push({
    accountId: receivableAccountId,
    debit: invoice[0].grandTotal,
    credit: "0",
    description: `Invoice ${invoice[0].invoiceNumber}`,
  });

  // Cr Revenue per line (amount before GST)
  for (const line of lines) {
    jeLines.push({
      accountId: line.accountId,
      debit: "0",
      credit: line.amount,
      description: line.description,
    });
  }

  // Cr CGST/SGST/IGST Output
  const cgstTotal = Number(invoice[0].cgstTotal);
  const sgstTotal = Number(invoice[0].sgstTotal);
  const igstTotal = Number(invoice[0].igstTotal);

  // Find CGST/SGST/IGST output tax accounts
  const allAccounts = await db.select({ id: accounts.id, name: accounts.name, kind: accounts.kind })
    .from(accounts).where(eq(accounts.tenantId, tenantId));

  const cgstAccount = allAccounts.find((a) => a.name.toLowerCase().includes("cgst") && a.name.toLowerCase().includes("output"));
  const sgstAccount = allAccounts.find((a) => a.name.toLowerCase().includes("sgst") && a.name.toLowerCase().includes("output"));
  const igstAccount = allAccounts.find((a) => a.name.toLowerCase().includes("igst") && a.name.toLowerCase().includes("output"));

  if (cgstTotal > 0 && cgstAccount) {
    jeLines.push({ accountId: cgstAccount.id, debit: "0", credit: String(cgstTotal), description: "CGST Output" });
  }
  if (sgstTotal > 0 && sgstAccount) {
    jeLines.push({ accountId: sgstAccount.id, debit: "0", credit: String(sgstTotal), description: "SGST Output" });
  }
  if (igstTotal > 0 && igstAccount) {
    jeLines.push({ accountId: igstAccount.id, debit: "0", credit: String(igstTotal), description: "IGST Output" });
  }

  // Create the journal entry
  const jeResult = await createJournalEntry(db, tenantId, actorId, invoice[0].fiscalYear, {
    date: invoice[0].date,
    narration: `Invoice ${invoice[0].invoiceNumber} posted`,
    referenceType: "invoice",
    referenceId: invoiceId,
    lines: jeLines,
  });

  // Update invoice status to sent
  await db.update(invoices)
    .set({ status: "sent", updatedAt: new Date() })
    .where(eq(invoices.id, invoiceId));

  // Append event
  await appendEvent(db, tenantId, "invoice", invoiceId, "invoice_posted", {
    invoiceId,
    journalEntryId: jeResult.entryId,
    postedAt: new Date().toISOString(),
  }, actorId);

  return { invoiceId, journalEntryId: jeResult.entryId };
}