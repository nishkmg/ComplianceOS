import React from "react";
import { renderToBuffer, Document, Page, View, Text } from "@react-pdf/renderer";
import type { Buffer } from "node:buffer";
import { Header, Footer, SignOffBlock, Watermark, BODY_FONT, BOLD_FONT, StyleSheet } from "./pdf-engine";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: BODY_FONT, fontSize: 9 },
  title: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 6, backgroundColor: "#f0f0f0", padding: 4 },
  table: { width: "100%" },
  tableHeader: { backgroundColor: "#e0e0e0", fontWeight: "bold", flexDirection: "row" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc" },
  cell: { padding: 4, fontSize: 8, flex: 1 },
  cellGstin: { padding: 4, fontSize: 7, flex: 1 },
  numericCell: { padding: 4, fontSize: 8, flex: 1, textAlign: "right" },
  totalRow: { flexDirection: "row", fontWeight: "bold", borderTopWidth: 2, borderTopColor: "#000" },
  summaryRow: { flexDirection: "row", backgroundColor: "#f9f9f9", paddingVertical: 3 },
  summaryLabel: { flex: 1, padding: 4, fontSize: 9 },
  summaryValue: { padding: 4, fontSize: 9, textAlign: "right", flex: 1 },
});

function ic(v: string | number | undefined | null): string {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n);
}

function fdate(d: string | undefined | null): string {
  if (!d) return "-";
  const p = d.split("T")[0].split("-");
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : d;
}

export interface GstLine {
  gstin?: string | null;
  sourceDocumentNumber?: string | null;
  sourceDocumentDate?: string | null;
  taxableValue: string;
  igstAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  cessAmount: string;
  totalTaxAmount: string;
  partyName?: string | null;
  placeOfSupply?: string | null;
  remarks?: string | null;
}

export interface GstReturnData {
  id: string;
  tenantId: string;
  returnNumber: string;
  returnType: string;
  taxPeriodMonth: string;
  taxPeriodYear: string;
  fiscalYear: string;
  status: string;
  filingDate?: string | null;
  dueDate: string;
  totalOutwardSupplies: string;
  totalEligibleItc: string;
  totalTaxPayable: string;
  totalTaxPaid: string;
  interestAmount: string;
  penaltyAmount: string;
  lateFeeAmount: string;
  arn?: string | null;
  lines: GstLine[];
}

export interface Gstr2bLine extends GstLine {
  itcAvailable?: boolean;
}

export interface Gstr3bData {
  id: string;
  returnNumber: string;
  taxPeriodMonth: string;
  taxPeriodYear: string;
  fiscalYear: string;
  status: string;
  dueDate: string;
  filingDate?: string | null;
  totalOutwardSupplies: string;
  totalEligibleItc: string;
  totalTaxPayable: string;
  totalTaxPaid: string;
  interestAmount: string;
  lateFeeAmount: string;
  arn?: string | null;
  outward: {
    taxableValue: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
    nilRated: number;
    exempt: number;
    nonGst: number;
  };
  itc: {
    importGoods: number;
    importServices: number;
    capitalGoods: number;
    inwardRegular: number;
    inwardRcm: number;
    total: number;
  };
  utilized: {
    igstForIgst: number;
    igstForCgst: number;
    igstForSgst: number;
    cgstForCgst: number;
    cgstForIgst: number;
    sgstForSgst: number;
    sgstForIgst: number;
  };
  payable: {
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
    interest: number;
    lateFee: number;
  };
  paid: {
    itcIgst: number;
    itcCgst: number;
    itcSgst: number;
    itcCess: number;
    cashIgst: number;
    cashCgst: number;
    cashSgst: number;
    cashCess: number;
  };
}

export interface Gstr9Data {
  id: string;
  returnNumber: string;
  fiscalYear: string;
  status: string;
  filingDate?: string | null;
  arn?: string | null;
  turnover: {
    gross: number;
    taxable: number;
    exempt: number;
    nilRated: number;
    nonGst: number;
  };
  outward: {
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
  };
  inward: {
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
  };
  itc: {
    available: number;
    claimed: number;
    ineligible: number;
    reversed: number;
    net: number;
  };
  taxPaid: {
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
    interest: number;
    lateFee: number;
    total: number;
  };
  lateFee: {
    due: number;
    paid: number;
  };
  demands: {
    raised: number;
    paid: number;
    pending: number;
  };
}

function TableRow({ cells, isHeader }: { cells: string[]; isHeader?: boolean }) {
  const Row = isHeader ? styles.tableHeader : styles.tableRow;
  return (
    <View style={Row}>
      {cells.map((c, i) => (
        <Text key={i} style={[styles.cell, i > 0 && i > cells.length - 4 ? styles.numericCell : undefined]}>
          {c}
        </Text>
      ))}
    </View>
  );
}

function Gstr1B2BTable({ lines }: { lines: GstLine[] }) {
  if (!lines.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>B2B Invoices - Registered Persons</Text>
      <View style={styles.table}>
        <TableRow isHeader cells={["GSTIN", "Invoice No", "Date", "Taxable Value", "IGST", "CGST", "SGST", "Cess"]} />
        {lines.map((l, i) => (
          <TableRow key={i} cells={[
            l.gstin ?? "-",
            l.sourceDocumentNumber ?? "-",
            fdate(l.sourceDocumentDate),
            ic(l.taxableValue),
            ic(l.igstAmount),
            ic(l.cgstAmount),
            ic(l.sgstAmount),
            ic(l.cessAmount),
          ]} />
        ))}
      </View>
    </View>
  );
}

function Gstr1B2CLTable({ lines }: { lines: GstLine[] }) {
  if (!lines.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>B2C Large Invoices {`>`}2.5L inter-state</Text>
      <View style={styles.table}>
        <TableRow isHeader cells={["Party Name", "Invoice No", "Date", "Taxable", "IGST", "Place"]} />
        {lines.map((l, i) => (
          <TableRow key={i} cells={[
            l.partyName ?? "-",
            l.sourceDocumentNumber ?? "-",
            fdate(l.sourceDocumentDate),
            ic(l.taxableValue),
            ic(l.igstAmount),
            l.placeOfSupply ?? "-",
          ]} />
        ))}
      </View>
    </View>
  );
}

function Gstr1B2CSTable({ lines }: { lines: GstLine[] }) {
  if (!lines.length) return null;
  const total = lines.reduce((a, l) => ({
    tv: a.tv + Number(l.taxableValue),
    igst: a.igst + Number(l.igstAmount),
    cgst: a.cgst + Number(l.cgstAmount),
    sgst: a.sgst + Number(l.sgstAmount),
    cess: a.cess + Number(l.cessAmount),
  }), { tv: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 });
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>B2C Small Invoices (Consolidated)</Text>
      <View style={styles.table}>
        <TableRow isHeader cells={["Type", "Taxable Value", "IGST", "CGST", "SGST", "Cess"]} />
        <TableRow cells={["Consolidated", ic(total.tv), ic(total.igst), ic(total.cgst), ic(total.sgst), ic(total.cess)]} />
      </View>
    </View>
  );
}

function Gstr1ExportTable({ lines }: { lines: GstLine[] }) {
  if (!lines.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Export Invoices</Text>
      <View style={styles.table}>
        <TableRow isHeader cells={["Invoice No", "Date", "Taxable Value", "IGST", "Cess"]} />
        {lines.map((l, i) => (
          <TableRow key={i} cells={[
            l.sourceDocumentNumber ?? "-",
            fdate(l.sourceDocumentDate),
            ic(l.taxableValue),
            ic(l.igstAmount),
            ic(l.cessAmount),
          ]} />
        ))}
      </View>
    </View>
  );
}

function Gstr1RCMTable({ lines }: { lines: GstLine[] }) {
  if (!lines.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Reverse Charge Supplies</Text>
      <View style={styles.table}>
        <TableRow isHeader cells={["GSTIN", "Invoice", "Date", "Taxable", "IGST", "CGST", "SGST", "Cess"]} />
        {lines.map((l, i) => (
          <TableRow key={i} cells={[
            l.gstin ?? "-",
            l.sourceDocumentNumber ?? "-",
            fdate(l.sourceDocumentDate),
            ic(l.taxableValue),
            ic(l.igstAmount),
            ic(l.cgstAmount),
            ic(l.sgstAmount),
            ic(l.cessAmount),
          ]} />
        ))}
      </View>
    </View>
  );
}

function Gstr1CreditDebitTable({ lines }: { lines: GstLine[] }) {
  if (!lines.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Credit / Debit Notes</Text>
      <View style={styles.table}>
        <TableRow isHeader cells={["Note No", "Date", "Type", "Taxable", "IGST", "CGST", "SGST", "Cess"]} />
        {lines.map((l, i) => (
          <TableRow key={i} cells={[
            l.sourceDocumentNumber ?? "-",
            fdate(l.sourceDocumentDate),
            l.remarks ?? "-",
            ic(l.taxableValue),
            ic(l.igstAmount),
            ic(l.cgstAmount),
            ic(l.sgstAmount),
            ic(l.cessAmount),
          ]} />
        ))}
      </View>
    </View>
  );
}

function Gstr1HSNTable({ hsnData }: { hsnData: Array<{ hsn: string; desc: string; uqc: string; qty: number; taxable: number; igst: number; cgst: number; sgst: number; cess: number }> }) {
  if (!hsnData.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>HSN-wise Summary</Text>
      <View style={styles.table}>
        <TableRow isHeader cells={["HSN", "Description", "UQC", "Qty", "Taxable", "IGST", "CGST", "SGST", "Cess"]} />
        {hsnData.map((h, i) => (
          <TableRow key={i} cells={[
            h.hsn, h.desc, h.uqc, String(h.qty),
            ic(h.taxable), ic(h.igst), ic(h.cgst), ic(h.sgst), ic(h.cess),
          ]} />
        ))}
      </View>
    </View>
  );
}

function Gstr1DocumentSummary({ lines }: { lines: GstLine[] }) {
  const counts: Record<string, number> = {};
  for (const l of lines) {
    const t = l.remarks ?? "B2B";
    counts[t] = (counts[t] || 0) + 1;
  }
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Document Issuer Summary</Text>
      <View style={styles.table}>
        <TableRow isHeader cells={["Nature", "Count"]} />
        {Object.entries(counts).map(([k, v], i) => (
          <TableRow key={i} cells={[k, String(v)]} />
        ))}
      </View>
    </View>
  );
}

export const Gstr1Document: React.FC<{ data: GstReturnData; hsnSummary: Array<{ hsn: string; desc: string; uqc: string; qty: number; taxable: number; igst: number; cgst: number; sgst: number; cess: number }>; company: { name: string; gstin: string } }> = ({ data, hsnSummary, company }) => {
  const b2b = data.lines.filter(l => l.remarks === "B2B" || (!l.remarks && l.gstin));
  const b2cl = data.lines.filter(l => l.remarks === "B2CL");
  const b2cs = data.lines.filter(l => l.remarks === "B2CS");
  const exp = data.lines.filter(l => l.remarks === "EXP");
  const rcm = data.lines.filter(l => l.remarks === "RCM");
  const cdnr = data.lines.filter(l => l.remarks === "CDNR");
  return (
    <Document title={`GSTR-1 ${data.returnNumber}`}>
      <Page size="A4" style={styles.page}>
        <Header title="GSTR-1 - Summary of Outward Supplies" period={`${data.taxPeriodMonth}/${data.taxPeriodYear}`} gstin={company.gstin} />
        {data.status === "filed" && <Watermark type="FILED" />}
        <Gstr1B2BTable lines={b2b} />
        <Gstr1B2CLTable lines={b2cl} />
        <Gstr1B2CSTable lines={b2cs} />
        <Gstr1ExportTable lines={exp} />
        <Gstr1RCMTable lines={rcm} />
        <Gstr1CreditDebitTable lines={cdnr} />
        <Gstr1HSNTable hsnData={hsnSummary} />
        <Gstr1DocumentSummary lines={data.lines} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total Taxable Value</Text><Text style={styles.summaryValue}>{ic(data.totalOutwardSupplies)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total Tax</Text><Text style={styles.summaryValue}>{ic(data.totalTaxPayable)}</Text></View>
        </View>
        {data.arn && <Text style={{ fontSize: 7, color: "#6b7280", marginTop: 8 }}>ARN: {data.arn}</Text>}
        <Footer currentPage={0} totalPages={0} generatedAt={new Date().toISOString()} />
      </Page>
    </Document>
  );
};

export const Gstr2bDocument: React.FC<{ data: GstReturnData; company: { name: string; gstin: string } }> = ({ data, company }) => {
  const eligible = data.lines.filter(l => l.remarks !== "BLOCKED");
  const blocked = data.lines.filter(l => l.remarks === "BLOCKED");
  const eTotal = eligible.reduce((a, l) => ({
    tv: a.tv + Number(l.taxableValue),
    igst: a.igst + Number(l.igstAmount),
    cgst: a.cgst + Number(l.cgstAmount),
    sgst: a.sgst + Number(l.sgstAmount),
    cess: a.cess + Number(l.cessAmount),
  }), { tv: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 });
  const bTotal = blocked.reduce((a, l) => ({
    tv: a.tv + Number(l.taxableValue),
    igst: a.igst + Number(l.igstAmount),
    cgst: a.cgst + Number(l.cgstAmount),
    sgst: a.sgst + Number(l.sgstAmount),
    cess: a.cess + Number(l.cessAmount),
  }), { tv: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 });
  return (
    <Document title={`GSTR-2B ${data.returnNumber}`}>
      <Page size="A4" style={styles.page}>
        <Header title="GSTR-2B - Input Tax Credit Statement" period={`${data.taxPeriodMonth}/${data.taxPeriodYear}`} gstin={company.gstin} />
        {data.status === "filed" && <Watermark type="FILED" />}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ITC Available (Eligible)</Text>
          <View style={styles.table}>
            <TableRow isHeader cells={["Supplier GSTIN", "Invoice No", "Date", "Taxable", "IGST", "CGST", "SGST", "Cess", "ITC"]} />
            {eligible.map((l, i) => (
              <TableRow key={i} cells={[
                l.gstin ?? "-",
                l.sourceDocumentNumber ?? "-",
                fdate(l.sourceDocumentDate),
                ic(l.taxableValue),
                ic(l.igstAmount),
                ic(l.cgstAmount),
                ic(l.sgstAmount),
                ic(l.cessAmount),
                "Available",
              ]} />
            ))}
          </View>
        </View>
        {blocked.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ITC Not Available (Blocked / Ineligible)</Text>
            <View style={styles.table}>
              <TableRow isHeader cells={["Supplier", "Invoice", "Date", "Taxable", "IGST", "CGST", "SGST", "Cess"]} />
              {blocked.map((l, i) => (
                <TableRow key={i} cells={[
                  l.partyName ?? "-",
                  l.sourceDocumentNumber ?? "-",
                  fdate(l.sourceDocumentDate),
                  ic(l.taxableValue),
                  ic(l.igstAmount),
                  ic(l.cgstAmount),
                  ic(l.sgstAmount),
                  ic(l.cessAmount),
                ]} />
              ))}
            </View>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ITC Summary</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Eligible ITC - IGST</Text><Text style={styles.summaryValue}>{ic(eTotal.igst)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Eligible ITC - CGST</Text><Text style={styles.summaryValue}>{ic(eTotal.cgst)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Eligible ITC - SGST</Text><Text style={styles.summaryValue}>{ic(eTotal.sgst)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Eligible ITC - Cess</Text><Text style={styles.summaryValue}>{ic(eTotal.cess)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total Eligible ITC</Text><Text style={styles.summaryValue}>{ic(eTotal.igst + eTotal.cgst + eTotal.sgst + eTotal.cess)}</Text></View>
          {bTotal.igst + bTotal.cgst + bTotal.sgst + bTotal.cess > 0 && (
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total Ineligible ITC</Text><Text style={styles.summaryValue}>{ic(bTotal.igst + bTotal.cgst + bTotal.sgst + bTotal.cess)}</Text></View>
          )}
        </View>
        {data.arn && <Text style={{ fontSize: 7, color: "#6b7280", marginTop: 8 }}>ARN: {data.arn}</Text>}
        <Footer currentPage={0} totalPages={0} generatedAt={new Date().toISOString()} />
      </Page>
    </Document>
  );
};

export const Gstr3bDocument: React.FC<{ data: Gstr3bData; company: { name: string; gstin: string } }> = ({ data, company }) => (
  <Document title={`GSTR-3B ${data.returnNumber}`}>
    <Page size="A4" style={styles.page}>
      <Header title="GSTR-3B - Monthly Return" period={`${data.taxPeriodMonth}/${data.taxPeriodYear}`} gstin={company.gstin} />
      {data.status === "filed" && <Watermark type="FILED" />}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3.1(a) Outward Taxable Supplies</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={["Nature", "Taxable Value", "IGST", "CGST", "SGST", "Cess"]} />
          <TableRow cells={["Taxable", ic(data.outward.taxableValue), ic(data.outward.igst), ic(data.outward.cgst), ic(data.outward.sgst), ic(data.outward.cess)]} />
          <TableRow cells={["Nil-Rated", ic(data.outward.nilRated), "0", "0", "0", "0"]} />
          <TableRow cells={["Exempt", ic(data.outward.exempt), "0", "0", "0", "0"]} />
          <TableRow cells={["Non-GST", ic(data.outward.nonGst), "0", "0", "0", "0"]} />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3.1(b) Outward Taxable Supplies (RCM)</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={["Nature", "Taxable Value", "IGST", "CGST", "SGST", "Cess"]} />
          <TableRow cells={["RCM Supplies", ic(data.outward.taxableValue), ic(data.outward.igst), ic(data.outward.cgst), ic(data.outward.sgst), ic(data.outward.cess)]} />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. ITC Available</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={["Category", "IGST", "CGST", "SGST", "Cess", "Total"]} />
          <TableRow cells={["Import of Goods", ic(data.itc.importGoods), "0", "0", "0", ic(data.itc.importGoods)]} />
          <TableRow cells={["Import of Services", ic(data.itc.importServices), "0", "0", "0", ic(data.itc.importServices)]} />
          <TableRow cells={["Capital Goods", ic(data.itc.capitalGoods), "0", "0", "0", ic(data.itc.capitalGoods)]} />
          <TableRow cells={["Inward Regular", ic(data.itc.inwardRegular), ic(data.itc.inwardRegular * 0.5), ic(data.itc.inwardRegular * 0.5), "0", ic(data.itc.inwardRegular)]} />
          <TableRow cells={["Inward RCM", ic(data.itc.inwardRcm), ic(data.itc.inwardRcm * 0.5), ic(data.itc.inwardRcm * 0.5), "0", ic(data.itc.inwardRcm)]} />
          <View style={styles.totalRow}>
            <Text style={styles.cell}>Total ITC</Text>
            <Text style={styles.numericCell}>{ic(data.itc.total)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Tax Payable</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={["Description", "IGST", "CGST", "SGST", "Cess"]} />
          <TableRow cells={["Outward Tax", ic(data.payable.igst), ic(data.payable.cgst), ic(data.payable.sgst), ic(data.payable.cess)]} />
          <TableRow cells={["Interest", ic(data.payable.interest), "0", "0", "0"]} />
          <TableRow cells={["Late Fee", ic(data.payable.lateFee), "0", "0", "0"]} />
          <View style={styles.totalRow}>
            <Text style={styles.cell}>Total Payable</Text>
            <Text style={styles.numericCell}>{ic(data.payable.igst + data.payable.cgst + data.payable.sgst + data.payable.cess + data.payable.interest + data.payable.lateFee)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6.1 Payment of Tax (ITC + Cash)</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={["", "IGST", "CGST", "SGST", "Cess"]} />
          <TableRow cells={["ITC Used", ic(data.paid.itcIgst), ic(data.paid.itcCgst), ic(data.paid.itcSgst), ic(data.paid.itcCess)]} />
          <TableRow cells={["Cash Paid", ic(data.paid.cashIgst), ic(data.paid.cashCgst), ic(data.paid.cashSgst), ic(data.paid.cashCess)]} />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6.2 Cash Payment Breakup</Text>
        <Text style={{ fontSize: 7, color: "#6b7280", marginBottom: 4 }}>Order: IGST → CGST → SGST → Cess</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={["Head", "Amount"]} />
          <TableRow cells={["IGST (Cash)", ic(data.paid.cashIgst)]} />
          <TableRow cells={["CGST (Cash)", ic(data.paid.cashCgst)]} />
          <TableRow cells={["SGST (Cash)", ic(data.paid.cashSgst)]} />
          <TableRow cells={["Cess (Cash)", ic(data.paid.cashCess)]} />
          <View style={styles.totalRow}>
            <Text style={styles.cell}>Total Cash</Text>
            <Text style={styles.numericCell}>{ic(data.paid.cashIgst + data.paid.cashCgst + data.paid.cashSgst + data.paid.cashCess)}</Text>
          </View>
        </View>
      </View>
      {data.arn && <Text style={{ fontSize: 7, color: "#6b7280", marginTop: 8 }}>ARN: {data.arn}</Text>}
      <Footer currentPage={0} totalPages={0} generatedAt={new Date().toISOString()} />
    </Page>
  </Document>
);

export const Gstr9Document: React.FC<{ data: Gstr9Data; company: { name: string; gstin: string; pan?: string } }> = ({ data, company }) => (
  <Document title={`GSTR-9 ${data.returnNumber}`}>
    <Page size="A4" style={styles.page}>
      <Header title="GSTR-9 - Annual Return" period={data.fiscalYear} gstin={company.gstin} />
      {data.status === "filed" && <Watermark type="FILED" />}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Part I - Basic Details</Text>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Returns Filed For</Text><Text style={styles.summaryValue}>{data.fiscalYear}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Status</Text><Text style={styles.summaryValue}>{data.status.toUpperCase()}</Text></View>
        {data.filingDate && <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Filing Date</Text><Text style={styles.summaryValue}>{fdate(data.filingDate)}</Text></View>}
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>GSTIN</Text><Text style={styles.summaryValue}>{company.gstin}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>PAN</Text><Text style={styles.summaryValue}>{company.pan ?? "-"}</Text></View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Part II - Supply Details</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={["Particulars", "Amount"]} />
          <TableRow cells={["Gross Turnover", ic(data.turnover.gross)]} />
          <TableRow cells={["Taxable Turnover", ic(data.turnover.taxable)]} />
          <TableRow cells={["Exempt Turnover", ic(data.turnover.exempt)]} />
          <TableRow cells={["Nil-Rated Turnover", ic(data.turnover.nilRated)]} />
          <TableRow cells={["Non-GST Turnover", ic(data.turnover.nonGst)]} />
        </View>
        <View style={{ marginTop: 6 }}>
          <TableRow isHeader cells={["Tax Head", "IGST", "CGST", "SGST", "Cess"]} />
          <TableRow cells={["Outward Supplies", ic(data.outward.igst), ic(data.outward.cgst), ic(data.outward.sgst), ic(data.outward.cess)]} />
          <TableRow cells={["Inward Supplies", ic(data.inward.igst), ic(data.inward.cgst), ic(data.inward.sgst), ic(data.inward.cess)]} />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Part III - ITC Details</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={["Particulars", "Amount"]} />
          <TableRow cells={["ITC Available", ic(data.itc.available)]} />
          <TableRow cells={["ITC Claimed", ic(data.itc.claimed)]} />
          <TableRow cells={["ITC Ineligible", ic(data.itc.ineligible)]} />
          <TableRow cells={["ITC Reversed", ic(data.itc.reversed)]} />
          <View style={styles.totalRow}>
            <Text style={styles.cell}>Net ITC</Text>
            <Text style={styles.numericCell}>{ic(data.itc.net)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Part IV - Tax Paid</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={["Particulars", "Amount"]} />
          <TableRow cells={["IGST Paid", ic(data.taxPaid.igst)]} />
          <TableRow cells={["CGST Paid", ic(data.taxPaid.cgst)]} />
          <TableRow cells={["SGST Paid", ic(data.taxPaid.sgst)]} />
          <TableRow cells={["Cess Paid", ic(data.taxPaid.cess)]} />
          <TableRow cells={["Interest Paid", ic(data.taxPaid.interest)]} />
          <TableRow cells={["Late Fee Paid", ic(data.taxPaid.lateFee)]} />
          <View style={styles.totalRow}>
            <Text style={styles.cell}>Total Tax Paid</Text>
            <Text style={styles.numericCell}>{ic(data.taxPaid.total)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Part VII - Other Information</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={["Particulars", "Amount"]} />
          <TableRow cells={["Late Fee Due", ic(data.lateFee.due)]} />
          <TableRow cells={["Late Fee Paid", ic(data.lateFee.paid)]} />
          <TableRow cells={["Demands Raised", ic(data.demands.raised)]} />
          <TableRow cells={["Demands Paid", ic(data.demands.paid)]} />
          <TableRow cells={["Demands Pending", ic(data.demands.pending)]} />
        </View>
      </View>
      {data.arn && <Text style={{ fontSize: 7, color: "#6b7280", marginTop: 8 }}>ARN: {data.arn}</Text>}
      <SignOffBlock authorizedSignatory={company.name} place="" date="" />
      <Footer currentPage={0} totalPages={0} generatedAt={new Date().toISOString()} />
    </Page>
  </Document>
);

export async function renderGstr1Pdf(data: GstReturnData, hsnSummary: Array<{ hsn: string; desc: string; uqc: string; qty: number; taxable: number; igst: number; cgst: number; sgst: number; cess: number }>, company: { name: string; gstin: string }): Promise<Buffer> {
  return renderToBuffer(<Gstr1Document data={data} hsnSummary={hsnSummary} company={company} />);
}

export async function renderGstr2bPdf(data: GstReturnData, company: { name: string; gstin: string }): Promise<Buffer> {
  return renderToBuffer(<Gstr2bDocument data={data} company={company} />);
}

export async function renderGstr3bPdf(data: Gstr3bData, company: { name: string; gstin: string }): Promise<Buffer> {
  return renderToBuffer(<Gstr3bDocument data={data} company={company} />);
}

export async function renderGstr9Pdf(data: Gstr9Data, company: { name: string; gstin: string; pan?: string }): Promise<Buffer> {
  return renderToBuffer(<Gstr9Document data={data} company={company} />);
}
