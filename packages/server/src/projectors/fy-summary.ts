// @ts-nocheck
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { fySummaries } = _db;
import type { Projector } from "./types.js";

export const fySummaryProjector: Projector = {
  name: "FYSummaryProjector",
  handles: ["fiscal_year_closed"],
  async process(db: Database, event: any): Promise<void> {
    const payload = event.payload as any;
    if (!payload.year) return;

    await (db as any).insert(fySummaries).values({
      tenantId: event.tenantId,
      fiscalYear: payload.year,
      netProfit: "0",
      totalRevenue: "0",
      totalExpenses: "0",
      retainedEarnings: "0",
      closedAt: payload.closedAt ? new Date(payload.closedAt) : new Date(),
    }).onConflictDoUpdate({
      target: [fySummaries.tenantId, fySummaries.fiscalYear],
      set: { closedAt: new Date() },
    });
  },
};
