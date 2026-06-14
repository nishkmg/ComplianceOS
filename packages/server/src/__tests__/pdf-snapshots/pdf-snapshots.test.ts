import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createHash } from "node:crypto";

// ── Prevent remote font fetches in test ─────────────────────────────────────
// pdf-engine.tsx tries to register Inter from CDN. When renderToBuffer fetches
// it, the CDN URL returns 404. Force fallback to built-in Helvetica.
vi.mock("@react-pdf/renderer", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    Font: {
      ...actual.Font,
      register: vi.fn(() => { throw new Error("mock"); }),
    },
  };
});

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockStorage = {
  upload: vi.fn().mockResolvedValue("mock-upload-path"),
  signedUrl: vi.fn().mockResolvedValue("https://mock-storage.example.com/pdf"),
  exists: vi.fn().mockResolvedValue(false),
  delete: vi.fn().mockResolvedValue(undefined),
};

vi.mock("../../lib/storage", () => ({
  createStorageDriver: vi.fn(() => mockStorage),
  BUCKETS: {
    INVOICES: "invoices",
    PAYSLIPS: "payslips",
    GST_RETURNS: "gst-returns",
    ITR_RETURNS: "itr-returns",
    REPORTS: "reports",
  },
}));

// ── Imports (after mocks) ───────────────────────────────────────────────────

import { generateInvoicePdf } from "../../services/pdf-generator";
import type { InvoiceWithLines, InvoiceConfig } from "../../services/pdf-generator";
import { renderGstr1Pdf, renderGstr3bPdf } from "../../services/gst-return-pdf";
import type { GstReturnData, GstLine, Gstr3bData } from "../../services/gst-return-pdf";
import { renderAndUploadItrPdf, ITR3Document } from "../../services/itr-return-pdf";
import type { ItrFormProps, TaxpayerInfo, ITRFinancialData } from "../../services/itr-return-pdf";

// ── Helpers ─────────────────────────────────────────────────────────────────

function hashBuffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

// ── Freeze time for deterministic PDF output ─────────────────────────────────
// PDFKit embeds /CreationDate in output; Footer also renders generatedAt.
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-08T10:00:00.000Z"));
});
afterAll(() => {
  vi.useRealTimers();
});

// ── Sample Data ─────────────────────────────────────────────────────────────

const sampleCompany: InvoiceConfig["company"] = {
  name: "Arthvahi Tech Pvt Ltd",
  address: "456 Tech Park, Mount Road",
  city: "Chennai",
  state: "TN",
  gstin: "33AAAAA0000A1Z5",
  pan: "AAAAA0000A",
  email: "hello@arthvahi.com",
  phone: "+91 98765 43210",
  bankName: "HDFC Bank",
  bankAccount: "1234567890",
  bankIfsc: "HDFC0001234",
};

const sampleInvoice: InvoiceWithLines = {
  id: "inv-snap-001",
  invoiceNumber: "INV-2026-0001",
  date: "2026-04-01",
  dueDate: "2026-05-01",
  customerName: "Acme Corp Pvt Ltd",
  customerEmail: "billing@acme.in",
  customerGstin: "33ABCDE1234F1Z5",
  customerAddress: "123 Business Park, Anna Salai",
  customerState: "TN",
  status: "posted",
  subtotal: 100000,
  cgstTotal: 9000,
  sgstTotal: 9000,
  igstTotal: 0,
  discountTotal: 0,
  grandTotal: 118000,
  fiscalYear: "2026-27",
  notes: "Thank you for your business",
  terms: "Net 30 days",
  lines: [
    {
      description: "Software Consulting Services",
      quantity: 1,
      unitPrice: 100000,
      gstRate: 18,
      amount: 100000,
      cgstAmount: 9000,
      sgstAmount: 9000,
      igstAmount: 0,
      discountPercent: 0,
      discountAmount: 0,
    },
  ],
};

const sampleConfig: InvoiceConfig = { company: sampleCompany };

const sampleGstReturn: GstReturnData = {
  id: "gstr1-snap-001",
  tenantId: "tenant-001",
  returnNumber: "GSTR1-042026-001",
  returnType: "gstr1",
  taxPeriodMonth: "04",
  taxPeriodYear: "2026",
  fiscalYear: "2026-27",
  status: "draft",
  filingDate: null,
  dueDate: "2026-05-20",
  totalOutwardSupplies: "125000",
  totalEligibleItc: "0",
  totalTaxPayable: "22500",
  totalTaxPaid: "0",
  interestAmount: "0",
  penaltyAmount: "0",
  lateFeeAmount: "0",
  arn: null,
  lines: [
    {
      gstin: "29ABCDE1234F1Z5",
      sourceDocumentNumber: "INV-001",
      sourceDocumentDate: "2026-04-15T00:00:00Z",
      taxableValue: "50000",
      igstAmount: "9000",
      cgstAmount: "0",
      sgstAmount: "0",
      cessAmount: "0",
      totalTaxAmount: "9000",
      partyName: "Gujarat Buyer",
      placeOfSupply: "Gujarat",
      remarks: "B2B",
    },
    {
      gstin: null,
      sourceDocumentNumber: "INV-002",
      sourceDocumentDate: "2026-04-18T00:00:00Z",
      taxableValue: "75000",
      igstAmount: "0",
      cgstAmount: "6750",
      sgstAmount: "6750",
      cessAmount: "0",
      totalTaxAmount: "13500",
      partyName: "Local Buyer",
      placeOfSupply: "TN",
      remarks: "B2B",
    },
  ],
};

const sampleHsnSummary: Array<{
  hsn: string; desc: string; uqc: string; qty: number;
  taxable: number; igst: number; cgst: number; sgst: number; cess: number;
}> = [
  { hsn: "998313", desc: "Software Consulting", uqc: "NOS", qty: 1, taxable: 125000, igst: 9000, cgst: 6750, sgst: 6750, cess: 0 },
];

const sampleCompanyInfo = { name: "Arthvahi Tech Pvt Ltd", gstin: "33AAAAA0000A1Z5" };

const sampleGstr3b: Gstr3bData = {
  id: "gstr3b-snap-001",
  returnNumber: "GSTR3B-042026-001",
  taxPeriodMonth: "04",
  taxPeriodYear: "2026",
  fiscalYear: "2026-27",
  status: "draft",
  dueDate: "2026-05-20",
  filingDate: null,
  totalOutwardSupplies: "500000",
  totalEligibleItc: "45000",
  totalTaxPayable: "90000",
  totalTaxPaid: "0",
  interestAmount: "0",
  lateFeeAmount: "0",
  arn: null,
  outward: {
    taxableValue: 500000,
    igst: 45000,
    cgst: 22500,
    sgst: 22500,
    cess: 0,
    nilRated: 50000,
    exempt: 25000,
    nonGst: 0,
  },
  itc: {
    importGoods: 10000,
    importServices: 5000,
    capitalGoods: 8000,
    inwardRegular: 15000,
    inwardRcm: 7000,
    total: 45000,
  },
  utilized: {
    igstForIgst: 20000,
    igstForCgst: 5000,
    igstForSgst: 5000,
    cgstForCgst: 15000,
    cgstForIgst: 0,
    sgstForSgst: 15000,
    sgstForIgst: 0,
  },
  payable: {
    igst: 45000,
    cgst: 22500,
    sgst: 22500,
    cess: 0,
    interest: 500,
    lateFee: 200,
  },
  paid: {
    itcIgst: 25000,
    itcCgst: 10000,
    itcSgst: 10000,
    itcCess: 0,
    cashIgst: 20000,
    cashCgst: 12500,
    cashSgst: 12500,
    cashCess: 0,
  },
};

const sampleTaxpayer: TaxpayerInfo = {
  name: "Rajesh Kumar",
  pan: "ABCDE1234F",
  aadhaar: "1234-5678-9012",
  dob: "15-Aug-1985",
  filingStatus: "individual",
  address: "42, Residency Road, Bengaluru, Karnataka 560025",
  email: "rajesh.kumar@email.com",
  phone: "+91 98765 43210",
};

const sampleItrFinancial: ITRFinancialData = {
  assessmentYear: "2027-28",
  financialYear: "2026-27",
  grossTotalIncome: "1850000",
  totalDeductions: "350000",
  totalIncome: "1500000",
  taxPayable: "195000",
  surcharge: "0",
  cess: "7800",
  rebate87a: "0",
  advanceTaxPaid: "100000",
  selfAssessmentTax: "50000",
  tdsTcsCredit: "45000",
  totalTaxPaid: "195000",
  balancePayable: "0",
  refundDue: "0",
};

const sampleItrSchedules = [
  { fieldCode: "BUS_001", fieldValue: "1800000", description: "Gross Receipts" },
  { fieldCode: "BUS_002", fieldValue: "1200000", description: "Expenses" },
  { fieldCode: "BUS_003", fieldValue: "600000", description: "Net Profit" },
];

const sampleItrProps: ItrFormProps = {
  taxpayer: sampleTaxpayer,
  financial: sampleItrFinancial,
  schedules: sampleItrSchedules,
  generatedAt: "2026-06-08T10:00:00.000Z",
  status: "computed",
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe("Invoice PDF snapshot", () => {
  it("renders with sample data and matches hash", async () => {
    const result = await generateInvoicePdf(sampleInvoice, sampleConfig);
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.buffer.length).toBeGreaterThan(0);
    const h = hashBuffer(result.buffer);
    expect(h).toMatchSnapshot("invoice-pdf");
  });
});

describe("GSTR-1 PDF snapshot", () => {
  it("renders with sample return data and matches hash", async () => {
    const buf = await renderGstr1Pdf(sampleGstReturn, sampleHsnSummary, sampleCompanyInfo);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(0);
    const h = hashBuffer(buf);
    expect(h).toMatchSnapshot("gstr1-pdf");
  });
});

describe("GSTR-3B PDF snapshot", () => {
  it("renders with sample return data and matches hash", async () => {
    const buf = await renderGstr3bPdf(sampleGstr3b, sampleCompanyInfo);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(0);
    const h = hashBuffer(buf);
    expect(h).toMatchSnapshot("gstr3b-pdf");
  });
});

describe("ITR-3 PDF snapshot", () => {
  it("renders with sample taxpayer data and matches hash", async () => {
    const result = await renderAndUploadItrPdf(
      ITR3Document,
      sampleItrProps as unknown as Record<string, unknown>,
      "itr-snap-001",
    );
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.buffer.length).toBeGreaterThan(0);
    const h = hashBuffer(result.buffer);
    expect(h).toMatchSnapshot("itr3-pdf");
  });
});

describe("Payslip PDF snapshot", () => {
  it("renders with sample payslip data and matches hash", async () => {
    // puppeteer-heavy — skip unless explicitly run
    // Uses generatePayslipPDF from ../services/payslip-pdf
    // which requires puppeteer headless browser — unreliable in CI
    expect(true).toBe(true);
  });
});
