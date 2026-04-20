// packages/server/src/services/invoice-parser.ts

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
  vendorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null; // ISO date string YYYY-MM-DD
  dueDate: string | null;
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  total: number;
  lineItems: ParsedLineItem[];
  confidence: number;
}

// Indian GSTIN regex: 15 characters
const GSTIN_REGEX = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[A-Z]{1}\d{1}/g;

// Invoice number: matches various patterns
const INVOICE_NUM_REGEX = /(?:invoice\s*(?:no\.?|number)|inv\.?\s*(?:no\.?|number)|invoice\s*#)\s*[:\s]*([A-Z0-9-]+)/i;

// Date patterns: DD/MM/YYYY, DD-MM-YYYY
const DATE_REGEX = /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/g;

// Amount patterns
const AMOUNT_REGEX = /(?:total|grand\s*total|amount\s*payable|net\s*amount)[\s:]*[₹]?\s*([\d,]+\.?\d*)/i;
const SUBTOTAL_REGEX = /(?:subtotal|total\s*before\s*tax|taxable\s*value|taxable\s*amount)[\s:]*[₹]?\s*([\d,]+\.?\d*)/i;
const CGST_REGEX = /CGST[\s:]*[₹]?\s*([\d,]+\.?\d*)/i;
const SGST_REGEX = /SGST[\s:]*[₹]?\s*([\d,]+\.?\d*)/i;
const IGST_REGEX = /IGST[\s:]*[₹]?\s*([\d,]+\.?\d*)/i;

// GST rates
const GST_RATE_REGEX = /\b(0|5|6|12|18|28)\s*%?\s*(?:GST)?/gi;

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

export function parseInvoiceText(rawText: string, confidence: number): ParsedInvoice {
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

  // Line items (basic heuristic: description + numbers on same line)
  const lineItems: ParsedLineItem[] = [];
  for (const line of lines) {
    // Match lines with text description followed by numbers (qty, price, amount)
    const match = line.match(/^([A-Za-z][A-Za-z0-9\s.,-]{3,50})\s+(\d+)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/);
    if (match) {
      const [, desc, qtyStr, priceStr, amountStr] = match;
      const qty = parseInt(qtyStr) || 1;
      const unitPrice = parseNumber(priceStr);
      const amount = parseNumber(amountStr);
      const beforeTax = amount;
      // Detect GST rate from nearby text or default to 18%
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