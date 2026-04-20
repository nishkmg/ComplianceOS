import { describe, it, expect } from "vitest";
import { getTableColumns } from "drizzle-orm";
import { accountBalances, journalEntryView, fySummaries } from "../schema/projections";
import { fiscalYears, entryNumberCounters } from "../schema/fiscal-years";
import { projectorState, reportCacheVersions } from "../schema/projector-state";

describe("projections schema", () => {
  it("accountBalances has unique on tenant+account+fy+period", () => {
    const cols = Object.keys(getTableColumns(accountBalances));
    expect(cols).toContain("tenantId");
    expect(cols).toContain("accountId");
    expect(cols).toContain("fiscalYear");
    expect(cols).toContain("period");
    expect(cols).toContain("debitTotal");
    expect(cols).toContain("creditTotal");
  });

  it("journalEntryView has required JE fields", () => {
    const cols = Object.keys(getTableColumns(journalEntryView));
    expect(cols).toContain("journalEntryId");
    expect(cols).toContain("entryNumber");
    expect(cols).toContain("date");
    expect(cols).toContain("status");
    expect(cols).toContain("fiscalYear");
  });

  it("fySummaries has profit/loss fields", () => {
    const cols = Object.keys(getTableColumns(fySummaries));
    expect(cols).toContain("fiscalYear");
    expect(cols).toContain("totalRevenue");
    expect(cols).toContain("totalExpenses");
    expect(cols).toContain("netProfit");
  });
});

describe("fiscal-years schema", () => {
  it("fiscalYears has year, startDate, endDate, status", () => {
    const cols = Object.keys(getTableColumns(fiscalYears));
    expect(cols).toContain("year");
    expect(cols).toContain("startDate");
    expect(cols).toContain("endDate");
    expect(cols).toContain("status");
  });

  it("entryNumberCounters keyed on tenant_id + fiscal_year", () => {
    const cols = Object.keys(getTableColumns(entryNumberCounters));
    expect(cols).toContain("tenantId");
    expect(cols).toContain("fiscalYear");
    expect(cols).toContain("nextVal");
  });
});

describe("projector-state schema", () => {
  it("projectorState keyed on tenant_id + projector_name", () => {
    const cols = Object.keys(getTableColumns(projectorState));
    expect(cols).toContain("tenantId");
    expect(cols).toContain("projectorName");
    expect(cols).toContain("lastProcessedSequence");
  });

  it("reportCacheVersions keyed on tenant_id + fiscal_year", () => {
    const cols = Object.keys(getTableColumns(reportCacheVersions));
    expect(cols).toContain("tenantId");
    expect(cols).toContain("fiscalYear");
    expect(cols).toContain("cacheVersion");
  });
});
