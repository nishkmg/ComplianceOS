/**
 * Tally-compatible XML export for journal vouchers.
 * Produces an ENVELOPE/BODY/IMPORTDATA structure that Tally can import
 * (Gateway → Import → XML). Dates as YYYYMMDD; ledger names escaped.
 */

export interface TallyExportLine {
  ledgerName: string;
  debit: number;
  credit: number;
}

export interface TallyExportEntry {
  date: string; // ISO YYYY-MM-DD
  voucherType: string;
  entryNumber: string;
  narration: string;
  lines: TallyExportLine[];
}

export function buildTallyXml(
  entries: TallyExportEntry[],
  companyName: string,
): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const ymd = (iso: string) => iso.replaceAll("-", "");

  const vouchers = entries
    .map((e) => {
      const lines = e.lines
        .map((l) => {
          const isDebit = l.debit > 0;
          return `        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${esc(l.ledgerName)}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>${isDebit ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
          <${isDebit ? "AMOUNT" : "AMOUNT"}>${isDebit ? l.debit.toFixed(2) : "-" + l.credit.toFixed(2)}</${isDebit ? "AMOUNT" : "AMOUNT"}>
        </ALLLEDGERENTRIES.LIST>`;
        })
        .join("\n");
      return `      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <VOUCHER VCHTYPE="${esc(e.voucherType)}" ACTION="Create" OBJVIEW="Accounting Voucher View">
          <DATE>${ymd(e.date)}</DATE>
          <VOUCHERTYPENAME>${esc(e.voucherType)}</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${esc(e.entryNumber)}</VOUCHERNUMBER>
          <NARRATION>${esc(e.narration)}</NARRATION>
${lines}
        </VOUCHER>
      </TALLYMESSAGE>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${esc(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${vouchers}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}
