// packages/server/src/services/ocr-parser.ts

export interface ParsedLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}

export interface ParsedInvoice {
  type: "invoice";
  vendorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  total: number;
  lineItems: ParsedLineItem[];
  confidence: number;
}

export interface ParsedReceipt {
  type: "receipt";
  vendorName: string | null;
  vendorAddress: string | null;
  vendorGstin: string | null;
  receiptDate: string | null;
  total: number;
  expenseCategory: string | null;
  confidence: number;
}

// Indian GSTIN regex: 15 characters
const GSTIN_REGEX = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[A-Z]{1}\d{1}/g;

// Invoice number patterns
const INVOICE_NUM_REGEX = /(?:invoice\s*(?:no\.?|number)|inv\.?\s*(?:no\.?|number)|invoice\s*#)\s*[:\s]*([A-Z0-9-]+)/i;

// Date patterns: DD/MM/YYYY, DD-MM-YYYY
const DATE_REGEX = /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/g;

// Amount patterns
const AMOUNT_REGEX = /(?:total|grand\s*total|amount\s*payable|net\s*amount|subtotal)[\s:]*[₹]?\s*([\d,]+\.?\d*)/i;
const SUBTOTAL_REGEX = /(?:subtotal|total\s*before\s*tax|taxable\s*value|taxable\s*amount)[\s:]*[₹]?\s*([\d,]+\.?\d*)/i;
const CGST_REGEX = /CGST[\s:]*[₹]?\s*([\d,]+\.?\d*)/i;
const SGST_REGEX = /SGST[\s:]*[₹]?\s*([\d,]+\.?\d*)/i;
const IGST_REGEX = /IGST[\s:]*[₹]?\s*([\d,]+\.?\d*)/i;

// Expense category keywords (for receipts)
const EXPENSE_CATEGORY_KEYWORDS: Record<string, string[]> = {
  Rent: ["rent", "rentals", "lease", "monthly rent"],
  Electricity: ["electricity", "electric", "power", "energy", "eb bill", "bses", "adani"],
  Telephone: ["telephone", "phone", "mobile", "airtel", "jio", "vi", "vodafone"],
  Internet: ["internet", "broadband", "wifi", "data card"],
  Professional_Fees: ["professional", "consultation", "legal fees", "advocate", "ca fees"],
  Insurance: ["insurance", "life insurance", "health insurance", "vehicle insurance"],
  Travel: ["travel", "trip", "boarding", "lodging", "hotel", "taxi", "flight"],
  Printing_Stationery: ["printing", "stationery", "paper", "photocopy", "xerox"],
  Office_Supplies: ["office supplies", "stationery", "tools", "equipment"],
  Bank_Charges: ["bank charges", "processing fee", "transaction charges", "imps", "neft", "rtgs"],
  Interest: ["interest", "loan interest", "overdraft interest"],
  Repairs_Maintenance: ["repairs", "maintenance", "AMC", "service charge"],
  Freight: ["freight", "transport", "courier", "shipping", "loading"],
  Commission: ["commission", "brokerage", "agent commission"],
  Advertisements: ["advertisement", "advertising", "marketing", "publicity"],
  Miscellaneous: ["miscellaneous", "general", "other expenses"],
};

function parseNumber(s: string): number {
  return parseFloat(s.replace(/,/g, "")) || 0;
}

function parseDate(s: string): string | null {
  const match = s.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/);
  if (!match) return null;
  const [, d, m, y] = match;
  const year = y.length === 2 ? (parseInt(y) > 50 ? `19${y}` : `20${y}`) : y;
  const month = m.padStart(2, "0");
  const day = d.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function detectExpenseCategory(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(EXPENSE_CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return category;
    }
  }
  return null;
}

function parseInvoiceText(rawText: string, confidence: number): ParsedInvoice {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Vendor name: first non-empty line that looks like a business name
  let vendorName: string | null = null;
  for (const line of lines.slice(0, 10)) {
    if (
      line.length > 3 &&
      line.length < 80 &&
      !/^\d|invoice|tax|date|#|inv|bill|receipt|no\.|sr\.|srl/i.test(line) &&
      /[A-Z]/.test(line)
    ) {
      vendorName = line;
      break;
    }
  }

  // Invoice number
  let invoiceNumber: string | null = null;
  for (const line of lines) {
    const m = line.match(INVOICE_NUM_REGEX);
    if (m) { invoiceNumber = m[1]; break; }
  }

  // Invoice date
  let invoiceDate: string | null = null;
  for (const line of lines) {
    const matches = [...line.matchAll(DATE_REGEX)];
    if (matches.length > 0) {
      invoiceDate = parseDate(matches[0][1]);
      break;
    }
  }

  // Totals
  let subtotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0, total = 0;

  const subtotalMatch = rawText.match(SUBTOTAL_REGEX);
  if (subtotalMatch) subtotal = parseNumber(subtotalMatch[1]);

  const totalMatch = rawText.match(AMOUNT_REGEX);
  if (totalMatch) total = parseNumber(totalMatch[1]);

  const cgstMatch = rawText.match(CGST_REGEX);
  if (cgstMatch) cgstTotal = parseNumber(cgstMatch[1]);

  const sgstMatch = rawText.match(SGST_REGEX);
  if (sgstMatch) sgstTotal = parseNumber(sgstMatch[1]);

  const igstMatch = rawText.match(IGST_REGEX);
  if (igstMatch) igstTotal = parseNumber(igstMatch[1]);

  // Back-calculate GST if totals exist but component GST missing
  if (cgstTotal === 0 && sgstTotal === 0 && igstTotal === 0 && total > 0 && subtotal > 0) {
    const diff = total - subtotal;
    if (diff > 0 && subtotal > 0) {
      const impliedRate = (diff / subtotal) * 100;
      if (impliedRate <= 5) {
        cgstTotal = sgstTotal = subtotal * 0.025;
      } else if (impliedRate <= 12) {
        cgstTotal = sgstTotal = subtotal * 0.06;
      } else if (impliedRate <= 18) {
        cgstTotal = sgstTotal = subtotal * 0.09;
      } else {
        cgstTotal = sgstTotal = subtotal * 0.14;
      }
    }
  }

  // Line items
  const lineItems: ParsedLineItem[] = [];
  for (const line of lines) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9\s.,-]{3,50})\s+(\d+)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/);
    if (match) {
      const [, desc, qtyStr, priceStr, amountStr] = match;
      const qty = parseInt(qtyStr) || 1;
      const unitPrice = parseNumber(priceStr);
      const amount = parseNumber(amountStr);
      const beforeTax = amount;
      let gstRate = 18;
      const rateMatch = line.match(/(\d+)\s*%/);
      if (rateMatch) gstRate = parseInt(rateMatch[1]);

      const cgst = beforeTax * gstRate / 200;
      const sgst = beforeTax * gstRate / 200;
      const igst = beforeTax * gstRate / 100;

      lineItems.push({
        description: desc.trim(),
        quantity: qty,
        unitPrice,
        amount,
        gstRate,
        cgstAmount: parseFloat(cgst.toFixed(2)),
        sgstAmount: parseFloat(sgst.toFixed(2)),
        igstAmount: parseFloat(igst.toFixed(2)),
      });
    }
  }

  return {
    type: "invoice",
    vendorName,
    invoiceNumber,
    invoiceDate,
    dueDate: null,
    subtotal,
    cgstTotal: parseFloat(cgstTotal.toFixed(2)),
    sgstTotal: parseFloat(sgstTotal.toFixed(2)),
    igstTotal: parseFloat(igstTotal.toFixed(2)),
    total,
    lineItems,
    confidence,
  };
}

function parseReceiptText(rawText: string, confidence: number): ParsedReceipt {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Vendor name: look for "Received From:" or similar
  let vendorName: string | null = null;
  for (const line of lines) {
    const receivedMatch = line.match(/(?:received\s*from|receipt\s*from|from\s*:|vendor\s*:|supplier\s*:)\s*([^\n,]+)/i);
    if (receivedMatch) {
      vendorName = receivedMatch[1].trim();
      break;
    }
  }
  // Fallback: first business-like line
  if (!vendorName) {
    for (const line of lines.slice(0, 8)) {
      if (
        line.length > 3 &&
        line.length < 80 &&
        !/^\d|receipt|no\.|date|total|#|sr\.|srl|ref/i.test(line) &&
        /[A-Z]/.test(line)
      ) {
        vendorName = line;
        break;
      }
    }
  }

  // Vendor address: lines after vendor name until we hit a date or GSTIN
  let vendorAddress: string | null = null;
  let vendorGstin: string | null = null;
  if (vendorName) {
    const vendorIdx = lines.findIndex((l) => l.includes(vendorName!));
    if (vendorIdx >= 0) {
      const addressLines: string[] = [];
      for (let i = vendorIdx + 1; i < Math.min(vendorIdx + 4, lines.length); i++) {
        if (lines[i].match(DATE_REGEX) || lines[i].match(GSTIN_REGEX)) break;
        if (/^\d+$/.test(lines[i])) continue; // skip pure numbers
        addressLines.push(lines[i]);
        if (addressLines.length >= 2) break;
      }
      if (addressLines.length > 0) {
        vendorAddress = addressLines.join(", ");
      }
    }
  }

  // GSTIN
  const gstinMatch = rawText.match(GSTIN_REGEX);
  if (gstinMatch) vendorGstin = gstinMatch[0];

  // Receipt date
  let receiptDate: string | null = null;
  for (const line of lines) {
    const dateMatch = line.match(/(?:date|dated|receipt\s*date|transaction\s*date)\s*[:\-]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
    if (dateMatch) {
      receiptDate = parseDate(dateMatch[1]);
      break;
    }
    // Fallback: first date in document
    if (!receiptDate) {
      const dates = [...line.matchAll(DATE_REGEX)];
      if (dates.length > 0) {
        receiptDate = parseDate(dates[0][1]);
      }
    }
  }

  // Total amount
  let total = 0;
  const totalMatch = rawText.match(AMOUNT_REGEX);
  if (totalMatch) total = parseNumber(totalMatch[1]);

  // Expense category from keywords
  const expenseCategory = detectExpenseCategory(rawText);

  return {
    type: "receipt",
    vendorName,
    vendorAddress,
    vendorGstin,
    receiptDate,
    total,
    expenseCategory,
    confidence,
  };
}

export function parseReceiptTextResult(rawText: string, confidence: number): ParsedReceipt {
  return parseReceiptText(rawText, confidence);
}

export function parseInvoiceTextResult(rawText: string, confidence: number): ParsedInvoice {
  return parseInvoiceText(rawText, confidence);
}
