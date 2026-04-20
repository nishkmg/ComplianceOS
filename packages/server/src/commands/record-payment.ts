import { eq, and, inArray } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import {
  payments,
  paymentAllocations,
  invoices,
  accounts,
  accountTags,
  journalEntries,
  journalEntryLines,
  invoiceConfig,
} from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { RecordPaymentInputSchema } from "@complianceos/shared";
import { getNextEntryNumber } from "../lib/entry-number";
import { validateBalance } from "../lib/balance-validator";

export async function recordPayment(
  db: Database,
  tenantId: string,
  actorId: string,
  fiscalYear: string,
  input: {
    date: string;
    customerName: string;
    amount: string | number;
    paymentMethod: "cash" | "bank" | "online" | "cheque";
    referenceNumber?: string;
    allocations: Array<{ invoiceId: string; allocatedAmount: string | number }>;
    notes?: string;
  },
): Promise<{
  paymentId: string;
  paymentNumber: string;
  journalEntryId: string;
  allocations: Array<{ invoiceId: string; allocatedAmount: string }>;
}> {
  const validated = RecordPaymentInputSchema.parse(input);

  if (validated.allocations.length === 0) {
    throw new Error("At least one allocation is required");
  }

  // Normalize amount to string for DB
  const amountStr = String(validated.amount);

  // Validate total allocations <= amount
  const totalAllocations = validated.allocations.reduce(
    (sum, a) => sum + Number(a.allocatedAmount),
    0,
  );
  if (totalAllocations > Number(validated.amount)) {
    throw new Error(
      `Total allocations (${totalAllocations}) cannot exceed payment amount (${validated.amount})`,
    );
  }

  // Verify all invoices exist and belong to tenant
  const invoiceIds = validated.allocations.map((a) => a.invoiceId);
  const invoiceRows = await db.select({
    id: invoices.id,
    grandTotal: invoices.grandTotal,
    customerName: invoices.customerName,
    status: invoices.status,
  }).from(invoices).where(
    and(
      eq(invoices.tenantId, tenantId),
      inArray(invoices.id, invoiceIds),
    ),
  );

  if (invoiceRows.length !== invoiceIds.length) {
    throw new Error("One or more invoices not found");
  }

  // Find Bank or Cash account (for Dr side)
  const bankAccountRow = await db.select({ id: accounts.id }).from(accounts).where(
    and(
      eq(accounts.tenantId, tenantId),
      eq(accounts.subType, "Bank"),
      eq(accounts.isLeaf, true),
      eq(accounts.isActive, true),
    ),
  ).limit(1);

  const cashAccountRow = await db.select({ id: accounts.id }).from(accounts).where(
    and(
      eq(accounts.tenantId, tenantId),
      eq(accounts.subType, "Cash"),
      eq(accounts.isLeaf, true),
      eq(accounts.isActive, true),
    ),
  ).limit(1);

  const cashBankAccountId = bankAccountRow[0]?.id ?? cashAccountRow[0]?.id;
  if (!cashBankAccountId) {
    throw new Error("No Bank or Cash account found for payment recording");
  }

  // Find Trade Receivable account via tags
  const receivableAccountRows = await db.select({
    accountId: accountTags.accountId,
  }).from(accountTags)
    .innerJoin(accounts, eq(accounts.id, accountTags.accountId))
    .where(
      and(
        eq(accounts.tenantId, tenantId),
        eq(accountTags.tag, "trade_receivable"),
        eq(accounts.isLeaf, true),
        eq(accounts.isActive, true),
      ),
    ).limit(1);

  const receivableAccountId = receivableAccountRows[0]?.accountId;
  if (!receivableAccountId) {
    throw new Error("No Trade Receivable account found");
  }

  // Get payment number from invoice_config (FOR UPDATE lock pattern)
  const config = await db.transaction(async (tx) => {
    const cfg = await tx.select().from(invoiceConfig).where(
      eq(invoiceConfig.tenantId, tenantId),
    ).for("update");

    if (cfg.length === 0) throw new Error("Invoice config not found for tenant");

    const currentNum = cfg[0].nextNumber;
    await tx.update(invoiceConfig)
      .set({ nextNumber: currentNum + 1 })
      .where(eq(invoiceConfig.id, cfg[0].id));

    return {
      prefix: cfg[0].prefix,
      nextNumber: currentNum,
    };
  });

  const paymentNumber = `${config.prefix}-PAY-${String(config.nextNumber).padStart(4, "0")}`;

  // Create payment and journal entry in transaction
  const result = await db.transaction(async (tx) => {
    // Create payment record
    const payment = await tx.insert(payments).values({
      tenantId,
      paymentNumber,
      date: validated.date,
      amount: amountStr,
      paymentMethod: validated.paymentMethod,
      referenceNumber: validated.referenceNumber,
      customerName: validated.customerName,
      notes: validated.notes,
      status: "recorded",
      createdBy: actorId,
    }).returning({ id: payments.id });

    const paymentId = payment[0].id;

    // Create payment allocations
    await tx.insert(paymentAllocations).values(
      validated.allocations.map((a) => ({
        paymentId,
        invoiceId: a.invoiceId,
        allocatedAmount: String(a.allocatedAmount),
      })),
    );

    // Build JE lines: Dr Bank/Cash, Cr Trade Receivable (one Cr line per allocation)
    const jeLines: Array<{ accountId: string; debit: string; credit: string }> = [];

    // Dr Bank/Cash (full payment amount)
    jeLines.push({
      accountId: cashBankAccountId,
      debit: amountStr,
      credit: "0",
    });

    // Cr Trade Receivable - one line per allocation
    for (const allocation of validated.allocations) {
      jeLines.push({
        accountId: receivableAccountId,
        debit: "0",
        credit: String(allocation.allocatedAmount),
      });
    }

    // Validate balance
    const { valid, totalDebit, totalCredit } = validateBalance(jeLines);
    if (!valid) {
      throw new Error(`Journal entry debits (${totalDebit}) must equal credits (${totalCredit})`);
    }

    // Create journal entry
    const entryNumber = await getNextEntryNumber(db, tenantId, fiscalYear);

    const je = await tx.insert(journalEntries).values({
      tenantId,
      entryNumber,
      date: validated.date,
      narration: `Payment received from ${validated.customerName} via ${validated.paymentMethod}`,
      referenceType: "payment",
      referenceId: paymentId,
      status: "posted",
      fiscalYear,
      createdBy: actorId,
    }).returning({ id: journalEntries.id });

    const journalEntryId = je[0].id;

    await tx.insert(journalEntryLines).values(
      jeLines.map((l) => ({
        journalEntryId,
        accountId: l.accountId,
        debit: l.debit,
        credit: l.credit,
      })),
    );

    // Update invoice statuses based on total allocated vs grand_total
    for (const allocation of validated.allocations) {
      const invoice = invoiceRows.find((i) => i.id === allocation.invoiceId);
      if (!invoice) continue;

      // Calculate total allocated for this invoice (existing non-voided allocations)
      const existingAllocs = await tx.select({
        allocatedAmount: paymentAllocations.allocatedAmount,
      }).from(paymentAllocations)
        .innerJoin(payments, eq(payments.id, paymentAllocations.paymentId))
        .where(
          and(
            eq(paymentAllocations.invoiceId, allocation.invoiceId),
            eq(payments.status, "recorded"),
          ),
        );

      const existingTotal = existingAllocs.reduce(
        (sum, a) => sum + parseFloat(a.allocatedAmount.toString()),
        0,
      );
      const newTotal = existingTotal + Number(allocation.allocatedAmount);
      const invoiceGrandTotal = parseFloat(invoice.grandTotal.toString());

      let newStatus: "sent" | "partially_paid" | "paid" = "partially_paid";
      if (newTotal >= invoiceGrandTotal - 0.01) { // Small tolerance for float comparison
        newStatus = "paid";
      }

      await tx.update(invoices)
        .set({
          status: newStatus,
          paidAt: newStatus === "paid" ? new Date() : undefined,
        })
        .where(eq(invoices.id, allocation.invoiceId));
    }

    // Append payment_recorded event
    await appendEvent(tx, tenantId, "journal_entry", journalEntryId, "payment_recorded", {
      paymentId,
      paymentNumber,
      date: validated.date,
      amount: validated.amount,
      customerName: validated.customerName,
      allocations: validated.allocations,
      journalEntryId,
    }, actorId);

    return { paymentId, paymentNumber, journalEntryId };
  });

  return {
    ...result,
    allocations: validated.allocations.map((a) => ({
      invoiceId: a.invoiceId,
      allocatedAmount: String(a.allocatedAmount),
    })),
  };
}