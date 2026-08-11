// packages/server/src/commands/create-bill.ts
import { eq } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { purchaseBills, purchaseBillLines, accounts, tenants } = _db;
import * as _shared from "../../../shared/src/index";
const { getCurrentFiscalYear, getStateName } = _shared;
import { createJournalEntry } from "./create-journal-entry";
import { appendEvent } from "../lib/event-store";

export interface BillLineInput {
  accountId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
}

export async function createBill(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    billNumber: string;
    vendorAccountId: string;
    vendorName: string;
    vendorGstin?: string;
    vendorState?: string;
    billDate: string;
    dueDate: string;
    lines: BillLineInput[];
    narration?: string;
  },
): Promise<{ billId: string; grandTotal: string }> {
  if (!input.billNumber.trim()) throw new Error("Bill number is required");
  if (!input.vendorName.trim()) throw new Error("Vendor name is required");
  if (input.lines.length === 0) throw new Error("Bill must have at least one line");

  const [tenant] = await db.select({ stateCode: tenants.stateCode }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  if (!tenant?.stateCode) throw new Error("Tenant state code not configured");
  const tenantStateName = (getStateName(tenant.stateCode) ?? "").toLowerCase();
  const intraState = !input.vendorState || String(input.vendorState).toLowerCase() === tenantStateName;

  // Vendor account must exist and be a liability
  const [vendor] = await db.select({ id: accounts.id, name: accounts.name, kind: accounts.kind }).from(accounts).where(eq(accounts.id, input.vendorAccountId)).limit(1);
  if (!vendor || vendor.kind !== "Liability") {
    throw new Error("Vendor account must be an existing Liability account");
  }

  const lines = input.lines.map((l) => {
    const qty = Number(l.quantity);
    const unitPrice = Number(l.unitPrice);
    const gstRate = Number(l.gstRate);
    const amount = qty * unitPrice;
    let cgst = 0, sgst = 0, igst = 0;
    if (intraState) {
      cgst = (amount * gstRate) / 200;
      sgst = (amount * gstRate) / 200;
    } else {
      igst = (amount * gstRate) / 100;
    }
    return {
      accountId: l.accountId,
      description: l.description,
      quantity: String(qty),
      unitPrice: String(unitPrice),
      amount: String(amount.toFixed(2)),
      gstRate: String(gstRate),
      cgstAmount: String(cgst.toFixed(2)),
      sgstAmount: String(sgst.toFixed(2)),
      igstAmount: String(igst.toFixed(2)),
    };
  });

  const subtotal = lines.reduce((s, l) => s + Number(l.amount), 0);
  const cgstTotal = lines.reduce((s, l) => s + Number(l.cgstAmount), 0);
  const sgstTotal = lines.reduce((s, l) => s + Number(l.sgstAmount), 0);
  const igstTotal = lines.reduce((s, l) => s + Number(l.igstAmount), 0);
  const grandTotal = subtotal + cgstTotal + sgstTotal + igstTotal;
  const fy = getCurrentFiscalYear(new Date(input.billDate));

  const result = await db.transaction(async (tx) => {
    const [bill] = await tx.insert(purchaseBills).values({
      tenantId,
      billNumber: input.billNumber.trim(),
      vendorAccountId: input.vendorAccountId,
      vendorName: input.vendorName.trim(),
      vendorGstin: input.vendorGstin || null,
      vendorState: input.vendorState || tenantStateName,
      billDate: input.billDate,
      dueDate: input.dueDate,
      subtotal: String(subtotal.toFixed(2)),
      cgstTotal: String(cgstTotal.toFixed(2)),
      sgstTotal: String(sgstTotal.toFixed(2)),
      igstTotal: String(igstTotal.toFixed(2)),
      grandTotal: String(grandTotal.toFixed(2)),
      paidAmount: "0",
      status: "open",
      fiscalYear: fy,
      narration: input.narration || null,
      createdBy: actorId,
    }).returning({ id: purchaseBills.id });

    for (const l of lines) {
      await tx.insert(purchaseBillLines).values({ billId: bill.id, ...l });
    }

    // JE: DR expense/asset accounts + tax, CR vendor payable
    const jeLines = [
      ...lines.map((l) => ({ accountId: l.accountId, debit: l.amount, credit: "0", description: l.description })),
    ];
    // tax lines go to the line account's tax side — simplest: debit tax to the FIRST line account
    const taxAccountId = lines[0].accountId;
    if (cgstTotal > 0) jeLines.push({ accountId: taxAccountId, debit: String(cgstTotal.toFixed(2)), credit: "0", description: "CGST Input" });
    if (sgstTotal > 0) jeLines.push({ accountId: taxAccountId, debit: String(sgstTotal.toFixed(2)), credit: "0", description: "SGST Input" });
    if (igstTotal > 0) jeLines.push({ accountId: taxAccountId, debit: String(igstTotal.toFixed(2)), credit: "0", description: "IGST Input" });
    jeLines.push({ accountId: input.vendorAccountId, debit: "0", credit: String(grandTotal.toFixed(2)), description: `Bill ${input.billNumber}` });

    const je = await createJournalEntry(db, tenantId, actorId, fy, {
      date: input.billDate,
      narration: `Purchase bill ${input.billNumber} from ${input.vendorName}`,
      referenceType: "purchase_bill",
      referenceId: bill.id,
      lines: jeLines,
    });

    await appendEvent(tx, tenantId, "purchase_bill", bill.id, "purchase_bill_created", {
      billId: bill.id,
      billNumber: input.billNumber,
      vendorAccountId: input.vendorAccountId,
      vendorName: input.vendorName,
      grandTotal: Number(grandTotal.toFixed(2)),
      dueDate: input.dueDate,
      journalEntryId: je.entryId,
    }, actorId);

    return { billId: bill.id, grandTotal: grandTotal.toFixed(2) };
  });

  return result;
}
