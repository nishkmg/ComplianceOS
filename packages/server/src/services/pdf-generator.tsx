import React from "react";
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Buffer } from "node:buffer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InvoiceLineData {
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  amount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  discountPercent: number;
  discountAmount: number;
}

export interface InvoiceWithLines {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerEmail?: string | null;
  customerGstin?: string | null;
  customerAddress?: string | null;
  customerState?: string | null;
  status: string;
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  discountTotal: number;
  grandTotal: number;
  fiscalYear: string;
  notes?: string | null;
  terms?: string | null;
  lines: InvoiceLineData[];
}

export interface CompanyConfig {
  name: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
  pan?: string;
  email?: string;
  phone?: string;
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
}

export interface InvoiceConfig {
  company: CompanyConfig;
}

// ---------------------------------------------------------------------------
// Indian number to words
// ---------------------------------------------------------------------------

const INDIAN_UNITS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const INDIAN_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitToWords(n: number): string {
  if (n < 20) return INDIAN_UNITS[n];
  return `${INDIAN_TENS[Math.floor(n / 10)]}${n % 10 === 0 ? "" : " " + INDIAN_UNITS[n % 10]}`;
}

function threeDigitToWords(n: number): string {
  if (n < 100) return twoDigitToWords(n);
  return `${INDIAN_UNITS[Math.floor(n / 100)]} Hundred${n % 100 === 0 ? "" : " " + twoDigitToWords(n % 100)}`;
}

export function numberToWordsIndian(n: number): string {
  if (n === 0) return "Zero Rupees";
  const rupees = Math.floor(n);
  const paise = Math.round((n - rupees) * 100);

  const crores = Math.floor(rupees / 10000000);
  const lakhs = Math.floor((rupees % 10000000) / 100000);
  const thousands = Math.floor((rupees % 100000) / 1000);
  const rest = rupees % 1000;

  const parts: string[] = [];
  if (crores > 0) parts.push(`${twoDigitToWords(crores)} Crore`);
  if (lakhs > 0) parts.push(`${twoDigitToWords(lakhs)} Lakh`);
  if (thousands > 0) parts.push(`${twoDigitToWords(thousands)} Thousand`);
  if (rest > 0) parts.push(threeDigitToWords(rest));

  const rupeesWord = parts.join(" ");
  const paiseWord = paise > 0 ? ` ${twoDigitToWords(paise)} Paise` : "";

  return `Rupees ${rupeesWord}${paiseWord} Only`;
}

// ---------------------------------------------------------------------------
// React-PDF styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  companyBlock: { flex: 1 },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  companyDetail: { fontSize: 9, color: "#444", lineHeight: 1.4 },
  invoiceTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#2563eb", textAlign: "right" },
  invoiceInfoBlock: { marginBottom: 16 },
  infoRow: { flexDirection: "row", marginBottom: 8 },
  infoLabel: { width: 100, fontSize: 9, color: "#666" },
  infoValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#2563eb", marginBottom: 6, borderBottom: "1 solid #e5e7eb", paddingBottom: 2 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 4, paddingHorizontal: 4 },
  tableHeaderCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#374151" },
  tableRow: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottom: "0.5 solid #e5e7eb" },
  tableCell: { fontSize: 9 },
  tableCellRight: { fontSize: 9, textAlign: "right" },
  colDesc: { flex: 3 },
  colQty: { width: 50, textAlign: "center" },
  colRate: { width: 60, textAlign: "right" },
  colGst: { width: 40, textAlign: "right" },
  colAmount: { width: 70, textAlign: "right" },
  colCgst: { width: 60, textAlign: "right" },
  colSgst: { width: 60, textAlign: "right" },
  colIgst: { width: 60, textAlign: "right" },
  totalsSection: { marginTop: 16, flexDirection: "row", justifyContent: "flex-end" },
  totalsBox: { width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalLabel: { fontSize: 9, color: "#374151" },
  totalValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderTop: "1 solid #1a1a1a", marginTop: 4 },
  grandTotalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  grandTotalValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#2563eb" },
  amountInWords: { marginTop: 6, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1a1a1a" },
  bankSection: { marginTop: 20, flexDirection: "row", gap: 40 },
  bankBlock: { flex: 1 },
  termsSection: { marginTop: 20 },
  termItem: { fontSize: 8, color: "#6b7280", lineHeight: 1.4, marginBottom: 2 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#9ca3af" },
});

// ---------------------------------------------------------------------------
// React-PDF Document Component
// ---------------------------------------------------------------------------

function IndianCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(value);
}

interface InvoiceDocumentProps {
  invoice: InvoiceWithLines;
  config: InvoiceConfig;
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoice, config }) => {
  const { company } = config;
  const isInterState = invoice.customerState && company.state && invoice.customerState !== company.state;
  const showIgst = isInterState && invoice.igstTotal > 0;

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.companyDetail}>{company.address}</Text>
            <Text style={styles.companyDetail}>{company.city}, {company.state}</Text>
            {company.gstin && <Text style={styles.companyDetail}>GSTIN: {company.gstin}</Text>}
            {company.pan && <Text style={styles.companyDetail}>PAN: {company.pan}</Text>}
            {company.email && <Text style={styles.companyDetail}>{company.email}</Text>}
            {company.phone && <Text style={styles.companyDetail}>{company.phone}</Text>}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.invoiceInfoBlock}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Invoice No.</Text>
            <Text style={styles.infoValue}>{invoice.invoiceNumber}</Text>
            <Text style={[styles.infoLabel, { marginLeft: 30 }]}>Date</Text>
            <Text style={styles.infoValue}>{invoice.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Due Date</Text>
            <Text style={styles.infoValue}>{invoice.dueDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{invoice.customerName}</Text>
          </View>
          {invoice.customerGstin && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer GSTIN</Text>
              <Text style={styles.infoValue}>{invoice.customerGstin}</Text>
            </View>
          )}
          {invoice.customerAddress && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{invoice.customerAddress}</Text>
            </View>
          )}
        </View>

        {/* Line Items Table */}
        <Text style={styles.sectionTitle}>Line Items</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
          <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.colRate]}>Unit Price</Text>
          <Text style={[styles.tableHeaderCell, styles.colGst]}>GST%</Text>
          {showIgst
            ? <Text style={[styles.tableHeaderCell, styles.colIgst]}>IGST</Text>
            : <>
                <Text style={[styles.tableHeaderCell, styles.colCgst]}>CGST</Text>
                <Text style={[styles.tableHeaderCell, styles.colSgst]}>SGST</Text>
              </>
          }
          <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
        </View>

        {/* Table Rows */}
        {invoice.lines.map((line, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colDesc]}>{line.description}</Text>
            <Text style={[styles.tableCellRight, styles.colQty]}>{line.quantity}</Text>
            <Text style={[styles.tableCellRight, styles.colRate]}>{IndianCurrency(line.unitPrice)}</Text>
            <Text style={[styles.tableCellRight, styles.colGst]}>{line.gstRate}%</Text>
            {showIgst
              ? <Text style={[styles.tableCellRight, styles.colIgst]}>{IndianCurrency(line.igstAmount)}</Text>
              : <>
                  <Text style={[styles.tableCellRight, styles.colCgst]}>{IndianCurrency(line.cgstAmount)}</Text>
                  <Text style={[styles.tableCellRight, styles.colSgst]}>{IndianCurrency(line.sgstAmount)}</Text>
                </>
            }
            <Text style={[styles.tableCellRight, styles.colAmount]}>{IndianCurrency(line.amount)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{IndianCurrency(invoice.subtotal)}</Text>
            </View>
            {showIgst ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>IGST</Text>
                <Text style={styles.totalValue}>{IndianCurrency(invoice.igstTotal)}</Text>
              </View>
            ) : (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>CGST</Text>
                  <Text style={styles.totalValue}>{IndianCurrency(invoice.cgstTotal)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>SGST</Text>
                  <Text style={styles.totalValue}>{IndianCurrency(invoice.sgstTotal)}</Text>
                </View>
              </>
            )}
            {invoice.discountTotal > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalValue}>-{IndianCurrency(invoice.discountTotal)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{IndianCurrency(invoice.grandTotal)}</Text>
            </View>
            <Text style={styles.amountInWords}>{numberToWordsIndian(invoice.grandTotal)}</Text>
          </View>
        </View>

        {/* Bank Details */}
        {company.bankName && (
          <View style={styles.bankSection}>
            <View style={styles.bankBlock}>
              <Text style={styles.sectionTitle}>Bank Details</Text>
              {company.bankName && <Text style={styles.companyDetail}>Bank: {company.bankName}</Text>}
              {company.bankAccount && <Text style={styles.companyDetail}>A/c No.: {company.bankAccount}</Text>}
              {company.bankIfsc && <Text style={styles.companyDetail}>IFSC: {company.bankIfsc}</Text>}
            </View>
          </View>
        )}

        {/* Notes / Terms */}
        {(invoice.notes || invoice.terms) && (
          <View style={styles.termsSection}>
            {invoice.notes && (
              <Text style={styles.sectionTitle}>Notes</Text>
            )}
            {invoice.notes && <Text style={styles.termItem}>{invoice.notes}</Text>}
            {invoice.terms && (
              <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Terms & Conditions</Text>
            )}
            {invoice.terms && <Text style={styles.termItem}>{invoice.terms}</Text>}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Generated by ComplianceOS</Text>
      </Page>
    </Document>
  );
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateInvoicePdf(
  invoice: InvoiceWithLines,
  config: InvoiceConfig,
): Promise<{ buffer: Buffer; url: string }> {
  const buffer = await renderToBuffer(<InvoiceDocument invoice={invoice} config={config} />);

  // Local dev: write to /tmp/invoices/{invoiceId}.pdf
  const fs = await import("node:fs");
  const path = await import("node:path");
  const destDir = "/tmp/invoices";
  fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, `${invoice.id}.pdf`);
  fs.writeFileSync(destPath, buffer);
  const url = destPath;

  return { buffer, url };
}

// Stub for future S3/R2 upload
export async function uploadToS3(_buffer: Buffer, _invoiceId: string): Promise<string> {
  // TODO: implement with AWS SDK or Cloudflare R2
  throw new Error("S3 upload not implemented");
}
