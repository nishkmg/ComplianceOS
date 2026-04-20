import { eq } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { receivablesSummary } from "@complianceos/db";
import type { Projector } from "./types.js";

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

    // Fetch current row
    const existing = await (db as any)
      .select()
      .from(receivablesSummary)
      .where(
        eq(receivablesSummary.tenantId, event.tenantId),
        eq(receivablesSummary.customerName, customerName),
      )
      .limit(1);

    const current = existing[0];

    if (event.eventType === "invoice_posted") {
      const amount = parseFloat(payload.grandTotal || "0");
      const existingTotal = parseFloat(current?.totalOutstanding || "0");
      const existingCurrent030 = parseFloat(current?.current030 || "0");
      const existing3160 = parseFloat(current?.aging3160 || "0");
      const existing6190 = parseFloat(current?.aging6190 || "0");
      const existing90Plus = parseFloat(current?.aging90Plus || "0");

      const aging = computeAging(payload.dueDate, payload.grandTotal || "0");
      const newCurrent030 = existingCurrent030 + parseFloat(aging.current030);
      const new3160 = existing3160 + parseFloat(aging.aging3160);
      const new6190 = existing6190 + parseFloat(aging.aging6190);
      const new90Plus = existing90Plus + parseFloat(aging.aging90Plus);

      await (db as any)
        .insert(receivablesSummary)
        .values({
          tenantId: event.tenantId,
          customerName,
          customerGstin: payload.customerGstin ?? null,
          totalOutstanding: String((existingTotal + amount).toFixed(2)),
          current030: String(newCurrent030.toFixed(2)),
          aging3160: String(new3160.toFixed(2)),
          aging6190: String(new6190.toFixed(2)),
          aging90Plus: String(new90Plus.toFixed(2)),
          lastPaymentDate: null,
          lastPaymentAmount: null,
        })
        .onConflictDoUpdate({
          target: [receivablesSummary.tenantId, receivablesSummary.customerName],
          set: {
            customerGstin: payload.customerGstin ?? current?.customerGstin,
            totalOutstanding: String((existingTotal + amount).toFixed(2)),
            current030: String(newCurrent030.toFixed(2)),
            aging3160: String(new3160.toFixed(2)),
            aging6190: String(new6190.toFixed(2)),
            aging90Plus: String(new90Plus.toFixed(2)),
          },
        });
    } else if (event.eventType === "payment_recorded") {
      const amount = parseFloat(payload.amount || "0");
      const existingTotal = parseFloat(current?.totalOutstanding || "0");
      const existingCurrent030 = parseFloat(current?.current030 || "0");
      const existing3160 = parseFloat(current?.aging3160 || "0");
      const existing6190 = parseFloat(current?.aging6190 || "0");
      const existing90Plus = parseFloat(current?.aging90Plus || "0");

      // Reduce from current bucket first, then aging
      const newTotal = Math.max(0, existingTotal - amount);
      let remaining = amount;
      let newCurrent030 = existingCurrent030;
      let new3160 = existing3160;
      let new6190 = existing6190;
      let new90Plus = existing90Plus;

      // Apply payment to 90+ first, then 61-90, then 31-60, then current
      if (remaining > 0 && existing90Plus > 0) {
        const reduction = Math.min(remaining, existing90Plus);
        new90Plus = Math.max(0, existing90Plus - reduction);
        remaining -= reduction;
      }
      if (remaining > 0 && existing6190 > 0) {
        const reduction = Math.min(remaining, existing6190);
        new6190 = Math.max(0, existing6190 - reduction);
        remaining -= reduction;
      }
      if (remaining > 0 && existing3160 > 0) {
        const reduction = Math.min(remaining, existing3160);
        new3160 = Math.max(0, existing3160 - reduction);
        remaining -= reduction;
      }
      if (remaining > 0 && existingCurrent030 > 0) {
        const reduction = Math.min(remaining, existingCurrent030);
        newCurrent030 = Math.max(0, existingCurrent030 - reduction);
        remaining -= reduction;
      }

      await (db as any)
        .insert(receivablesSummary)
        .values({
          tenantId: event.tenantId,
          customerName,
          customerGstin: current?.customerGstin ?? null,
          totalOutstanding: String(newTotal.toFixed(2)),
          current030: String(newCurrent030.toFixed(2)),
          aging3160: String(new3160.toFixed(2)),
          aging6190: String(new6190.toFixed(2)),
          aging90Plus: String(new90Plus.toFixed(2)),
          lastPaymentDate: payload.date ? new Date(payload.date) : null,
          lastPaymentAmount: String(amount.toFixed(2)),
        })
        .onConflictDoUpdate({
          target: [receivablesSummary.tenantId, receivablesSummary.customerName],
          set: {
            totalOutstanding: String(newTotal.toFixed(2)),
            current030: String(newCurrent030.toFixed(2)),
            aging3160: String(new3160.toFixed(2)),
            aging6190: String(new6190.toFixed(2)),
            aging90Plus: String(new90Plus.toFixed(2)),
            lastPaymentDate: payload.date ? new Date(payload.date) : null,
            lastPaymentAmount: String(amount.toFixed(2)),
          },
        });
    } else if (event.eventType === "payment_voided") {
      // payment_voided adds back to outstanding (same logic as payment_recorded in reverse)
      const amount = parseFloat(payload.amount || "0");
      const existingTotal = parseFloat(current?.totalOutstanding || "0");
      const existingCurrent030 = parseFloat(current?.current030 || "0");
      const existing3160 = parseFloat(current?.aging3160 || "0");
      const existing6190 = parseFloat(current?.aging6190 || "0");
      const existing90Plus = parseFloat(current?.aging90Plus || "0");

      const newTotal = existingTotal + amount;
      // Add back to oldest bucket (90+ first for void reversal)
      const new90Plus = existing90Plus + amount;

      await (db as any)
        .insert(receivablesSummary)
        .values({
          tenantId: event.tenantId,
          customerName,
          customerGstin: current?.customerGstin ?? null,
          totalOutstanding: String(newTotal.toFixed(2)),
          current030: String(existingCurrent030.toFixed(2)),
          aging3160: String(existing3160.toFixed(2)),
          aging6190: String(existing6190.toFixed(2)),
          aging90Plus: String(new90Plus.toFixed(2)),
          lastPaymentDate: null,
          lastPaymentAmount: null,
        })
        .onConflictDoUpdate({
          target: [receivablesSummary.tenantId, receivablesSummary.customerName],
          set: {
            totalOutstanding: String(newTotal.toFixed(2)),
            aging90Plus: String(new90Plus.toFixed(2)),
          },
        });
    } else if (event.eventType === "invoice_voided") {
      const amount = parseFloat(payload.grandTotal || "0");
      const existingTotal = parseFloat(current?.totalOutstanding || "0");
      const existingCurrent030 = parseFloat(current?.current030 || "0");
      const existing3160 = parseFloat(current?.aging3160 || "0");
      const existing6190 = parseFloat(current?.aging6190 || "0");
      const existing90Plus = parseFloat(current?.aging90Plus || "0");

      const newTotal = Math.max(0, existingTotal - amount);
      const newCurrent030 = Math.max(0, existingCurrent030 - amount);

      await (db as any)
        .insert(receivablesSummary)
        .values({
          tenantId: event.tenantId,
          customerName,
          customerGstin: current?.customerGstin ?? null,
          totalOutstanding: String(newTotal.toFixed(2)),
          current030: String(newCurrent030.toFixed(2)),
          aging3160: String(existing3160.toFixed(2)),
          aging6190: String(existing6190.toFixed(2)),
          aging90Plus: String(existing90Plus.toFixed(2)),
          lastPaymentDate: null,
          lastPaymentAmount: null,
        })
        .onConflictDoUpdate({
          target: [receivablesSummary.tenantId, receivablesSummary.customerName],
          set: {
            totalOutstanding: String(newTotal.toFixed(2)),
            current030: String(newCurrent030.toFixed(2)),
          },
        });
    }
  },
};