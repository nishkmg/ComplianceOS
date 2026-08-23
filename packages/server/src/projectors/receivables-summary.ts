import { eq, and, sql } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { receivablesSummary, eventStore } = _db;
import type { Projector } from "./types";

function computeAging(
  dueDate: string | null,
  grandTotal: string,
): { current030: string; aging3160: string; aging6190: string; aging90Plus: string } {
  const zero = "0.00";
  if (!dueDate) {
    return { current030: zero, aging3160: zero, aging6190: zero, aging90Plus: zero };
  }
  const due = new Date(dueDate);
  const now = new Date();
  const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  const amount = parseFloat(grandTotal || "0");

  if (daysOverdue <= 30) {
    return { current030: String(amount.toFixed(2)), aging3160: zero, aging6190: zero, aging90Plus: zero };
  } else if (daysOverdue <= 60) {
    return { current030: zero, aging3160: String(amount.toFixed(2)), aging6190: zero, aging90Plus: zero };
  } else if (daysOverdue <= 90) {
    return { current030: zero, aging3160: zero, aging6190: String(amount.toFixed(2)), aging90Plus: zero };
  } else {
    return { current030: zero, aging3160: zero, aging6190: zero, aging90Plus: String(amount.toFixed(2)) };
  }
}

export const ReceivablesProjector: Projector = {
  name: "ReceivablesProjector",
  handles: [
    "invoice_posted",
    "payment_recorded",
    "payment_voided",
    "invoice_voided",
  ],
  async process(db: Database, event: any): Promise<void> {
    const payload = event.payload as any;
    const customerName = payload.customerName ?? "";
    if (!customerName) return;

    // Recompute this customer's row from the full event log — the projector
    // must be replay-idempotent (account-balance style), not incremental:
    // incremental adds double-count on event replay.
    const events = await (db as any).select()
      .from(eventStore)
      .where(
        and(
          eq(eventStore.tenantId, event.tenantId),
          sql`${eventStore.payload}->>'customerName' = ${customerName}`,
        ),
      )
      .orderBy(eventStore.sequence);

    let total = 0;
    let buckets = { current030: 0, aging3160: 0, aging6190: 0, aging90Plus: 0 };
    let customerGstin: string | null = null;
    let lastPaymentDate: string | null = null;
    let lastPaymentAmount: string | null = null;

    for (const e of events) {
      const p = e.payload as Record<string, any>;
      if (e.eventType === "invoice_posted") {
        const amount = parseFloat(p.grandTotal || "0");
        total += amount;
        const aging = computeAging(p.dueDate ?? null, p.grandTotal || "0");
        buckets.current030 += parseFloat(aging.current030);
        buckets.aging3160 += parseFloat(aging.aging3160);
        buckets.aging6190 += parseFloat(aging.aging6190);
        buckets.aging90Plus += parseFloat(aging.aging90Plus);
        customerGstin = customerGstin ?? p.customerGstin ?? null;
      } else if (e.eventType === "payment_recorded") {
        const amount = parseFloat(p.amount || "0");
        total = Math.max(0, total - amount);
        // reduce oldest buckets first
        let remaining = amount;
        for (const key of ["aging90Plus", "aging6190", "aging3160", "current030"] as const) {
          if (remaining <= 0) break;
          const reduce = Math.min(remaining, buckets[key]);
          buckets[key] = Math.max(0, buckets[key] - reduce);
          remaining -= reduce;
        }
        lastPaymentDate = p.date ? String(p.date).slice(0, 10) : null;
        lastPaymentAmount = String(amount.toFixed(2));
      } else if (e.eventType === "invoice_voided") {
        const amount = parseFloat(p.grandTotal || p.amount || "0");
        total = Math.max(0, total - amount);
      }
    }

    await (db as any)
      .insert(receivablesSummary)
      .values({
        tenantId: event.tenantId,
        customerName,
        customerGstin,
        totalOutstanding: String(total.toFixed(2)),
        current030: String(buckets.current030.toFixed(2)),
        aging3160: String(buckets.aging3160.toFixed(2)),
        aging6190: String(buckets.aging6190.toFixed(2)),
        aging90Plus: String(buckets.aging90Plus.toFixed(2)),
        lastPaymentDate,
        lastPaymentAmount,
      })
      .onConflictDoUpdate({
        target: [receivablesSummary.tenantId, receivablesSummary.customerName],
        set: {
          customerGstin,
          totalOutstanding: String(total.toFixed(2)),
          current030: String(buckets.current030.toFixed(2)),
          aging3160: String(buckets.aging3160.toFixed(2)),
          aging6190: String(buckets.aging6190.toFixed(2)),
          aging90Plus: String(buckets.aging90Plus.toFixed(2)),
          lastPaymentDate,
          lastPaymentAmount,
        },
      });
  },
};
