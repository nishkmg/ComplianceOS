import { describe, it, expect } from "vitest";
import { buildTallyXml, type TallyExportEntry } from "../../services/tally-export";

const sample: TallyExportEntry[] = [
  {
    date: "2026-05-10",
    voucherType: "Journal",
    entryNumber: "JE-2026-001",
    narration: "Test entry & <special>",
    lines: [
      { ledgerName: "Sundry Debtors", debit: 11800, credit: 0 },
      { ledgerName: "Sales - Local", debit: 0, credit: 10000 },
      { ledgerName: "CGST Output", debit: 0, credit: 900 },
      { ledgerName: "SGST Output", debit: 0, credit: 900 },
    ],
  },
];

describe("buildTallyXml", () => {
  it("produces valid envelope + voucher structure", () => {
    const xml = buildTallyXml(sample, "Test Co");
    expect(xml).toContain("</ENVELOPE>");
    expect(xml).toContain("<TALLYREQUEST>Import Data</TALLYREQUEST>");
    expect(xml).toContain('VCHTYPE="Journal"');
    expect(xml).toContain("<DATE>20260510</DATE>");
    expect(xml.match(/<VOUCHER /g)?.length).toBe(1);
    expect(xml.match(/ALLLEDGERENTRIES.LIST/g)?.length).toBeGreaterThanOrEqual(8); // open+close per line
  });

  it("escapes special characters in ledger names and narration", () => {
    const xml = buildTallyXml(sample, "Test Co");
    expect(xml).toContain("Test entry &amp; &lt;special&gt;");
  });

  it("marks debits ISDEEMEDPOSITIVE=Yes and credits No", () => {
    const xml = buildTallyXml(sample, "Test Co");
    expect(xml).toContain("<ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>");
    expect(xml).toContain("<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>");
    expect(xml).toContain("-10000.00"); // credit amount negated
  });

  it("formats dates as YYYYMMDD without dashes", () => {
    const xml = buildTallyXml(sample, "Test Co");
    expect(xml).toContain("20260510");
    expect(xml).not.toContain("2026-05-10");
  });
});
