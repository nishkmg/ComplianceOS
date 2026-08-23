import { eq, and, gte, lte, sql } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { invoices, invoiceLines, tenants } = _db;
import { appendEvent } from "../lib/event-store";
import * as _shared from "../../../shared/src/index";
const { CreateInvoiceInputSchema, getCurrentFiscalYear, getStateName, isValidGSTIN } = _shared;
import { getNextInvoiceNumber } from "../services/invoice-number";

type CreateInvoiceInput = {
  date: string;
  dueDate: string;
  customerName: string;
  customerEmail?: string;
  customerGstin?: string;
  customerAddress?: string;
  customerState: string;
  lines?: Array<{
    accountId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    discountPercent?: number;
  }>;
  notes?: string;
  terms?: string;
  summaryOnly?: boolean;
  // Pre-computed totals (used when summaryOnly: true)
  subtotal?: string | number;
  cgstTotal?: string | number;
  sgstTotal?: string | number;
  igstTotal?: string | number;
  discountTotal?: string | number;
  grandTotal?: string | number;
};

export async function createInvoice(
  db: Database,
  tenantId: string,
  actorId: string,
  input: CreateInvoiceInput,
): Promise<{ invoiceId: string; invoiceNumber: string }> {
  // For summaryOnly, skip strict parse (lines not required). For full mode, parse normally.
  const validated = input.summaryOnly
    ? (input as any)
    : CreateInvoiceInputSchema.parse(input);

  const dateStr = validated.date;

  if (validated.customerGstin && validated.customerGstin.trim() !== "") {
    const customerGstin = validated.customerGstin.trim().toUpperCase();
    if (!/^[0-9]{2}[A-Z]{4}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[0-9A-Z]{1}$/.test(customerGstin)) {
      throw new Error("Invalid GSTIN format: must be 15 characters in format 11AAAAA1111A1Z1");
    }
    if (!isValidGSTIN(customerGstin)) {
      throw new Error("Invalid GSTIN checksum");
    }
  }
  const fy = getCurrentFiscalYear(new Date(dateStr));

  const invoiceNumber = await getNextInvoiceNumber(db, tenantId, fy);

  const summaryOnly = input.summaryOnly === true;
  const lines = validated.lines ?? [];

  let lineCalculations: Array<{
    accountId: string;
    description: string;
    quantity: string;
    unitPrice: string;
    amount: string;
    gstRate: string;
    cgstAmount: string;
    sgstAmount: string;
    igstAmount: string;
    discountPercent: string;
    discountAmount: string;
  }> = [];

  let subtotal: number;
  let cgstTotal: number;
  let sgstTotal: number;
  let igstTotal: number;
  let discountTotal: number;
  let grandTotal: number;

  // Plan enforcement: the Free plan allows 25 invoices per calendar month.
  const [planRow] = await db
    .select({ plan: tenants.plan })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (planRow?.plan === "free") {
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const end = `${y}-${String(m).padStart(2, "0")}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          gte(invoices.date, sql`${start}`),
          lte(invoices.date, sql`${end}`),
        ),
      );
    if (Number(count) >= 25) {
      throw new Error("Free plan limit reached (25 invoices/month). Upgrade to Pro to keep invoicing.");
    }
  }

  if (summaryOnly) {
    subtotal = Number(input.subtotal ?? 0);
    cgstTotal = Number(input.cgstTotal ?? 0);
    sgstTotal = Number(input.sgstTotal ?? 0);
    igstTotal = Number(input.igstTotal ?? 0);
    discountTotal = Number(input.discountTotal ?? 0);
    grandTotal = Number(input.grandTotal ?? subtotal + cgstTotal + sgstTotal + igstTotal - discountTotal);
  } else {
    const [tenant] = await db.select({ stateCode: tenants.stateCode }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (!tenant?.stateCode) {
      throw new Error("Tenant state code not configured. Update tenant config before creating invoices.");
    }
    // compare customerState (a state NAME, e.g. "Maharashtra") against the
    // tenant state NAME — the old GST-prefix comparison ("IN-27" vs name)
    // made every sale inter-state (IGST).
    const tenantState = (getStateName(tenant.stateCode) ?? "").toLowerCase();
    // Integer-paise arithmetic per line: discount/GST computed on rounded
    // paise, converted back to rupees once — no float accumulation.
    const toPaise = (rupees: number): number => Math.round(rupees * 100);
    lineCalculations = lines.map((line: { quantity: string | number; unitPrice: string | number; gstRate: string | number; discountPercent?: string | number; accountId: string; description: string }) => {
      const qty = Number(line.quantity);
      const unitPrice = Number(line.unitPrice);
      const gstRate = Number(line.gstRate);
      const discountPct = Number(line.discountPercent ?? 0);

      const beforeDiscountPaise = toPaise(qty * unitPrice);
      const discountAmountPaise = Math.round(beforeDiscountPaise * (discountPct / 100));
      const amountPaise = beforeDiscountPaise - discountAmountPaise;

      let cgstAmount = "0";
      let sgstAmount = "0";
      let igstAmount = "0";

      if (String(validated.customerState).toLowerCase() === tenantState) {
        cgstAmount = String((Math.round(amountPaise * gstRate / 200) / 100).toFixed(2));
        sgstAmount = String((Math.round(amountPaise * gstRate / 200) / 100).toFixed(2));
      } else {
        igstAmount = String((Math.round(amountPaise * gstRate / 100) / 100).toFixed(2));
      }

      return {
        accountId: line.accountId,
        description: line.description,
        quantity: String(qty),
        unitPrice: String(unitPrice),
        amount: String((amountPaise / 100).toFixed(2)),
        gstRate: String(gstRate),
        cgstAmount,
        sgstAmount,
        igstAmount,
        discountPercent: String(discountPct),
        discountAmount: String((discountAmountPaise / 100).toFixed(2)),
      };
    });

    // Totals sum the exact paise values of the stored line strings, then
    // convert to rupees once at the end — accumulate-then-round drift is gone.
    const sumLinePaise = (key: "amount" | "cgstAmount" | "sgstAmount" | "igstAmount" | "discountAmount") =>
      lineCalculations.reduce((sum, l) => sum + Math.round(Number(l[key]) * 100), 0);

    subtotal = sumLinePaise("amount") / 100;
    cgstTotal = sumLinePaise("cgstAmount") / 100;
    sgstTotal = sumLinePaise("sgstAmount") / 100;
    igstTotal = sumLinePaise("igstAmount") / 100;
    discountTotal = sumLinePaise("discountAmount") / 100;
    const gstTotalPaise =
      sumLinePaise("cgstAmount") + sumLinePaise("sgstAmount") + sumLinePaise("igstAmount");
    grandTotal =
      (sumLinePaise("amount") + gstTotalPaise - sumLinePaise("discountAmount")) / 100;
  }

  const result = await db.transaction(async (tx) => {
    const invoice = await tx.insert(invoices).values({
      tenantId,
      invoiceNumber,
      date: validated.date,
      dueDate: validated.dueDate,
      customerName: validated.customerName,
      customerEmail: validated.customerEmail,
      customerGstin: validated.customerGstin || null,
      customerAddress: validated.customerAddress || null,
      customerState: validated.customerState,
      status: "draft",
      subtotal: String(subtotal.toFixed(2)),
      cgstTotal: String(cgstTotal.toFixed(2)),
      sgstTotal: String(sgstTotal.toFixed(2)),
      igstTotal: String(igstTotal.toFixed(2)),
      discountTotal: String(discountTotal.toFixed(2)),
      grandTotal: String(grandTotal.toFixed(2)),
      fiscalYear: fy,
      createdBy: actorId,
      notes: validated.notes || null,
      terms: validated.terms || null,
    }).returning({ id: invoices.id });

    if (!summaryOnly && lineCalculations.length > 0) {
      await tx.insert(invoiceLines).values(
        lineCalculations.map((l) => ({
          invoiceId: invoice[0].id,
          accountId: l.accountId,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          amount: l.amount,
          gstRate: l.gstRate,
          cgstAmount: l.cgstAmount,
          sgstAmount: l.sgstAmount,
          igstAmount: l.igstAmount,
          discountPercent: l.discountPercent,
          discountAmount: l.discountAmount,
        })),
      );
    }

    await appendEvent(tx, tenantId, "invoice", invoice[0].id, "invoice_created", {
      invoiceId: invoice[0].id,
      invoiceNumber,
      date: validated.date,
      dueDate: validated.dueDate,
      customerName: validated.customerName,
      customerEmail: validated.customerEmail ?? null,
      customerGstin: validated.customerGstin || null,
      customerState: validated.customerState,
      status: "draft",
      subtotal: subtotal.toFixed(2),
      cgstTotal: cgstTotal.toFixed(2),
      sgstTotal: sgstTotal.toFixed(2),
      igstTotal: igstTotal.toFixed(2),
      discountTotal: discountTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      fiscalYear: fy,
      createdBy: actorId,
    }, actorId);

    return { invoiceId: invoice[0].id, invoiceNumber };
  });

  return result;
}
