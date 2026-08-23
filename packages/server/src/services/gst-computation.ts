// Live GST computation — reads posted transactions directly and returns
// aggregates WITHOUT persisting anything. Used for the "live draft" preview
// (what a Generate would produce today) and the period hub cards.
//
// NOTE: the invoice_status enum has no "posted" value — post-invoice sets
// status="sent", which later becomes partially_paid/paid as payments arrive.
// "Posted" here therefore means any non-draft, non-voided invoice.
//
// RECONSTRUCTED 16 Aug 2026 from the compiled dist output after filesystem
// metadata loss removed the source; behavior matches the shipped build.

import { eq, and, gte, lte, sql, inArray } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { invoices, purchaseBills, stockMovements, gstItcLedger } = _db;

export interface Gstr1Summary {
  count: number;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
}

export interface Gstr2bSummary {
  count: number;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
}

export interface Gstr3bSummary {
  outwardTaxable: number;
  outwardIgst: number;
  outwardCgst: number;
  outwardSgst: number;
  itcAvailable: number;
  netPayable: number;
}

const POSTED_INVOICE_STATUSES = ["sent", "partially_paid", "paid"] as const;

// Money is aggregated in integer paise internally; rupee floats are only
// reconstructed at the return boundaries. This kills paise-level drift on
// large multi-row sums.
const roundPaise = (n: number) => Math.round(n);
/** Convert a DB rupee value to integer paise at read time. */
const toPaise = (rupees: string | number | null | undefined): number =>
  roundPaise(Number(rupees ?? 0) * 100);
/** Convert accumulated integer paise back to a rupee number at a return boundary. */
const toRupees = (paise: number): number => paise / 100;

function periodRange(periodMonth: number, periodYear: number) {
  // postgres-js requires STRING values for date columns — Date objects
  // reach the driver as-is and explode ("Received an instance of Date").
  const lastDay = new Date(periodYear, periodMonth, 0).getDate();
  const start = `${periodYear}-${String(periodMonth).padStart(2, "0")}-01`;
  const end = `${periodYear}-${String(periodMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

/** Aggregates over posted (outward) invoices in the period — powers GSTR-1 and GSTR-3B table 3.1. */
async function outwardAggregates(
  db: Database,
  tenantId: string,
  periodMonth: number,
  periodYear: number,
): Promise<Gstr1Summary> {
  const { start, end } = periodRange(periodMonth, periodYear);
  const rows = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, tenantId),
        inArray(invoices.status, POSTED_INVOICE_STATUSES),
        gte(invoices.date, sql`${start}`),
        lte(invoices.date, sql`${end}`),
      ),
    )
    .orderBy(invoices.date);

  let taxableValuePaise = 0;
  let igstPaise = 0;
  let cgstPaise = 0;
  let sgstPaise = 0;
  let cessPaise = 0;
  for (const invoice of rows) {
    // subtotal is stored GROSS; taxable base = gross − discounts
    taxableValuePaise += toPaise(invoice.subtotal) - toPaise(invoice.discountTotal);
    igstPaise += toPaise(invoice.igstTotal);
    cgstPaise += toPaise(invoice.cgstTotal);
    sgstPaise += toPaise(invoice.sgstTotal);
    cessPaise += toPaise(invoice.cessAmount);
  }

  return {
    count: rows.length,
    taxableValue: toRupees(taxableValuePaise),
    igst: toRupees(igstPaise),
    cgst: toRupees(cgstPaise),
    sgst: toRupees(sgstPaise),
    cess: toRupees(cessPaise),
  };
}

/** Aggregates over inward documents (purchase bills + purchase receipts) in the period — powers GSTR-2B and the GSTR-3B ITC fallback. */
async function purchaseAggregates(
  db: Database,
  tenantId: string,
  periodMonth: number,
  periodYear: number,
): Promise<Gstr2bSummary> {
  const { start, end } = periodRange(periodMonth, periodYear);
  const bills = await db
    .select()
    .from(purchaseBills)
    .where(
      and(
        eq(purchaseBills.tenantId, tenantId),
        gte(purchaseBills.billDate, sql`${start}`),
        lte(purchaseBills.billDate, sql`${end}`),
      ),
    )
    .orderBy(purchaseBills.billDate);

  const receipts = await db
    .select()
    .from(stockMovements)
    .where(
      and(
        eq(stockMovements.tenantId, tenantId),
        eq(stockMovements.movementType, "purchase_receipt"),
        gte(stockMovements.createdAt, new Date(start)),
        lte(stockMovements.createdAt, new Date(end + "T23:59:59Z")),
      ),
    );

  let count = bills.length + receipts.length;
  let taxableValuePaise = 0;
  let igstPaise = 0;
  let cgstPaise = 0;
  let sgstPaise = 0;
  for (const bill of bills) {
    taxableValuePaise += toPaise(bill.subtotal);
    igstPaise += toPaise(bill.igstTotal);
    cgstPaise += toPaise(bill.cgstTotal);
    sgstPaise += toPaise(bill.sgstTotal);
  }
  // Purchase receipts carry no GST breakdown — they only add taxable value.
  for (const receipt of receipts) {
    taxableValuePaise += toPaise(receipt.totalValue);
  }

  return {
    count,
    taxableValue: toRupees(taxableValuePaise),
    igst: toRupees(igstPaise),
    cgst: toRupees(cgstPaise),
    sgst: toRupees(sgstPaise),
  };
}

/** Live GSTR-1 summary: posted outward invoices in the period. */
export async function computeGstr1Summary(
  db: Database,
  tenantId: string,
  periodMonth: number,
  periodYear: number,
): Promise<Gstr1Summary> {
  return outwardAggregates(db, tenantId, periodMonth, periodYear);
}

/** Live GSTR-2B summary: purchase bills + purchase receipts in the period. */
export async function computeGstr2bSummary(
  db: Database,
  tenantId: string,
  periodMonth: number,
  periodYear: number,
): Promise<Gstr2bSummary> {
  return purchaseAggregates(db, tenantId, periodMonth, periodYear);
}

/** Live GSTR-3B summary: outward liability + ITC available, net payable. */
export async function computeGstr3bSummary(
  db: Database,
  tenantId: string,
  periodMonth: number,
  periodYear: number,
): Promise<Gstr3bSummary> {
  const outward = await outwardAggregates(db, tenantId, periodMonth, periodYear);

  const periodMonthPadded = String(periodMonth).padStart(2, "0");
  const itcRows = await db.select().from(gstItcLedger).where(
    and(
      eq(gstItcLedger.tenantId, tenantId),
      eq(gstItcLedger.taxPeriodMonth, periodMonthPadded),
      eq(gstItcLedger.taxPeriodYear, String(periodYear)),
    ),
  );

  let itcAvailablePaise = 0;
  for (const row of itcRows) {
    itcAvailablePaise += toPaise(row.itcAvailable) - toPaise(row.itcUtilized);
  }

  // No ITC ledger entries for the period yet — fall back to the purchases side.
  if (itcRows.length === 0) {
    const purchases = await purchaseAggregates(db, tenantId, periodMonth, periodYear);
    itcAvailablePaise = toPaise(purchases.igst) + toPaise(purchases.cgst) + toPaise(purchases.sgst);
  }

  const totalOutwardPaise = toPaise(outward.igst) + toPaise(outward.cgst) + toPaise(outward.sgst);
  return {
    outwardTaxable: outward.taxableValue,
    outwardIgst: outward.igst,
    outwardCgst: outward.cgst,
    outwardSgst: outward.sgst,
    itcAvailable: toRupees(itcAvailablePaise),
    netPayable: toRupees(Math.max(0, totalOutwardPaise - itcAvailablePaise)),
  };
}
