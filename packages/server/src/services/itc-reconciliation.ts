// @ts-nocheck
/**
 * ITC Reconciliation Service
 * 
 * Matches purchase register (books) with GSTR-2B data for Input Tax Credit reconciliation.
 * Implements tolerance-based matching for value and tax differences.
 */

import { z } from 'zod';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { logger } from '../lib/logger';

// Constants
const VALUE_TOLERANCE_ABSOLUTE = 1; // ₹1
const VALUE_TOLERANCE_PERCENTAGE = 0.01; // 1%
const TAX_TOLERANCE = 1; // ₹1

// Schemas
const InvoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  invoiceDate: z.date(),
  supplierGstin: z.string(),
  recipientGstin: z.string(),
  taxableValue: z.number(),
  cgst: z.number(),
  sgst: z.number(),
  igst: z.number(),
  cess: z.number().optional(),
  totalValue: z.number(),
  totalTax: z.number(),
});

type Invoice = z.infer<typeof InvoiceSchema>;

type InvoiceWithSource = Invoice & {
  source: 'books' | 'gstr2b';
};

export interface ReconciliationResult {
  matched: Array<{
    book: Invoice;
    gstr2b: Invoice;
    confidence: 'exact' | 'tolerance';
  }>;
  mismatched: Array<{
    book: Invoice;
    gstr2b: Invoice;
    mismatchTypes: string[];
    differences: {
      valueDiff: number;
      taxDiff: number;
      dateDiff?: number;
      gstinMatch: boolean;
    };
  }>;
  pending: Array<{
    invoice: Invoice;
    source: 'books' | 'gstr2b';
    reason: 'missing_in_gstr2b' | 'missing_in_books';
  }>;
}

export interface ReconciliationSummary {
  totalBooks: number;
  totalGstr2b: number;
  matched: number;
  mismatched: number;
  pendingBooks: number;
  pendingGstr2b: number;
  matchRate: number;
  totalTaxAsPerBooks: number;
  totalTaxAsPerGstr2b: number;
  taxDifference: number;
}

/**
 * Load purchase register (books) for a given period
 */
async function loadPurchaseRegister(
  db: NodePgDatabase<any>,
  tenantId: string,
  periodMonth: number,
  periodYear: number
): Promise<Invoice[]> {
  const startDate = new Date(periodYear, periodMonth - 1, 1);
  const endDate = new Date(periodYear, periodMonth, 0);

  // Stub implementation - actual schema integration in V2
  // This will be replaced with actual DB queries once schema is finalized
  logger.info('Loading purchase register', { tenantId, periodMonth, periodYear });
  
  // Return empty array for now - actual implementation will query DB
  return [];
}

/**
 * Load GSTR-2B data (stub for V1 - simulates supplier filings)
 * In production, this would fetch from GSTN API or import from portal
 */
async function loadGstr2bData(
  _db: NodePgDatabase<any>,
  _tenantId: string,
  periodMonth: number,
  periodYear: number
): Promise<Invoice[]> {
  // V1 Stub: Simulate GSTR-2B data
  // In V2, this will integrate with GSTN API or parse JSON exports

  // Generate simulated 2B data based on books with some variations
  // This is for testing/demo purposes only
  logger.info('GSTR-2B stub: Loading data', { periodMonth, periodYear });

  // Return empty array for now - actual implementation will fetch from GSTN
  return [];
}

/**
 * Calculate absolute difference between two numbers
 */
function absDiff(a: number, b: number): number {
  return Math.abs(a - b);
}

/**
 * Calculate percentage difference
 */
function percentDiff(a: number, b: number): number {
  const avg = (a + b) / 2;
  if (avg === 0) return 0;
  return absDiff(a, b) / avg;
}

/**
 * Check if two invoices match within tolerance
 */
function isInvoicesMatch(book: Invoice, gstr2b: Invoice): {
  matches: boolean;
  confidence: 'exact' | 'tolerance' | 'no_match';
  valueDiff: number;
  taxDiff: number;
} {
  // Check basic identifiers
  if (book.supplierGstin !== gstr2b.supplierGstin) {
    return { matches: false, confidence: 'no_match', valueDiff: 0, taxDiff: 0 };
  }

  if (book.invoiceNumber !== gstr2b.invoiceNumber) {
    return { matches: false, confidence: 'no_match', valueDiff: 0, taxDiff: 0 };
  }

  // Calculate differences
  const valueDiff = absDiff(book.totalValue, gstr2b.totalValue);
  const taxDiff = absDiff(book.totalTax, gstr2b.totalTax);

  // Check exact match
  if (valueDiff === 0 && taxDiff === 0) {
    return { matches: true, confidence: 'exact', valueDiff, taxDiff };
  }

  // Check tolerance match
  const valueWithinTolerance =
    valueDiff <= VALUE_TOLERANCE_ABSOLUTE ||
    percentDiff(book.totalValue, gstr2b.totalValue) <= VALUE_TOLERANCE_PERCENTAGE;

  const taxWithinTolerance = taxDiff <= TAX_TOLERANCE;

  if (valueWithinTolerance && taxWithinTolerance) {
    return { matches: true, confidence: 'tolerance', valueDiff, taxDiff };
  }

  return { matches: false, confidence: 'no_match', valueDiff, taxDiff };
}

/**
 * Match invoices from books with GSTR-2B data
 */
export function matchInvoices(
  books: Invoice[],
  gstr2b: Invoice[]
): {
  matched: Array<{ book: Invoice; gstr2b: Invoice; confidence: 'exact' | 'tolerance' }>;
  unmatchedBooks: Invoice[];
  unmatchedGstr2b: Invoice[];
} {
  const matched: Array<{ book: Invoice; gstr2b: Invoice; confidence: 'exact' | 'tolerance' }> = [];
  const matchedBookIds = new Set<string>();
  const matchedGstr2bIds = new Set<string>();

  // Match invoices using nested loop (optimized for small datasets)
  // For large datasets, use database-side matching
  for (const book of books) {
    if (matchedBookIds.has(book.id)) continue;

    let bestMatch: { gstr2b: Invoice; confidence: 'exact' | 'tolerance'; score: number } | null = null;

    for (const g2b of gstr2b) {
      if (matchedGstr2bIds.has(g2b.id)) continue;

      const result = isInvoicesMatch(book, g2b);

      if (result.matches) {
        // Score: exact matches preferred, then lower differences
        const score = result.confidence === 'exact' ? 1000 : 100 - result.valueDiff - result.taxDiff;

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { gstr2b: g2b, confidence: result.confidence as 'exact' | 'tolerance', score };
        }
      }
    }

    if (bestMatch) {
      matched.push({
        book,
        gstr2b: bestMatch.gstr2b,
        confidence: bestMatch.confidence,
      });
      matchedBookIds.add(book.id);
      matchedGstr2bIds.add(bestMatch.gstr2b.id);
    }
  }

  const unmatchedBooks = books.filter((inv) => !matchedBookIds.has(inv.id));
  const unmatchedGstr2b = gstr2b.filter((inv) => !matchedGstr2bIds.has(inv.id));

  return { matched, unmatchedBooks, unmatchedGstr2b };
}

/**
 * Categorize type of mismatch between two invoices
 */
export function categorizeMismatch(book: Invoice, gstr2b: Invoice): {
  mismatchTypes: string[];
  differences: {
    valueDiff: number;
    taxDiff: number;
    dateDiff?: number;
    gstinMatch: boolean;
  };
} {
  const mismatchTypes: string[] = [];
  const differences = {
    valueDiff: absDiff(book.totalValue, gstr2b.totalValue),
    taxDiff: absDiff(book.totalTax, gstr2b.totalTax),
    dateDiff: undefined as number | undefined,
    gstinMatch: book.supplierGstin === gstr2b.supplierGstin,
  };

  // GSTIN mismatch
  if (!differences.gstinMatch) {
    mismatchTypes.push('gstin_mismatch');
  }

  // Invoice number mismatch
  if (book.invoiceNumber !== gstr2b.invoiceNumber) {
    mismatchTypes.push('invoice_number_mismatch');
  }

  // Date mismatch (more than 3 days difference)
  const dateDiffMs = Math.abs(book.invoiceDate.getTime() - gstr2b.invoiceDate.getTime());
  const dateDiffDays = dateDiffMs / (1000 * 60 * 60 * 24);
  if (dateDiffDays > 3) {
    mismatchTypes.push('date_mismatch');
    differences.dateDiff = dateDiffDays;
  }

  // Value mismatch (beyond tolerance)
  if (
    differences.valueDiff > VALUE_TOLERANCE_ABSOLUTE &&
    percentDiff(book.totalValue, gstr2b.totalValue) > VALUE_TOLERANCE_PERCENTAGE
  ) {
    mismatchTypes.push('value_mismatch');
  }

  // Tax mismatch (beyond tolerance)
  if (differences.taxDiff > TAX_TOLERANCE) {
    mismatchTypes.push('tax_mismatch');
  }

  return { mismatchTypes, differences };
}

/**
 * Main reconciliation function
 */
export async function reconcileITC(
  db: NodePgDatabase<any>,
  tenantId: string,
  periodMonth: number,
  periodYear: number
): Promise<ReconciliationResult> {
  // Load data
  const [books, gstr2b] = await Promise.all([
    loadPurchaseRegister(db, tenantId, periodMonth, periodYear),
    loadGstr2bData(db, tenantId, periodMonth, periodYear),
  ]);

  // Match invoices
  const { matched, unmatchedBooks, unmatchedGstr2b } = matchInvoices(books, gstr2b);

  // Categorize mismatches for tolerance matches
  const mismatched = matched
    .filter((m) => m.confidence === 'tolerance')
    .map((m) => {
      const { mismatchTypes, differences } = categorizeMismatch(m.book, m.gstr2b);
      return {
        book: m.book,
        gstr2b: m.gstr2b,
        mismatchTypes,
        differences,
      };
    });

  // Filter out tolerance matches from matched list (keep only exact)
  const exactMatched = matched.filter((m) => m.confidence === 'exact');

  // Create pending lists
  const pending: ReconciliationResult['pending'] = [
    ...unmatchedBooks.map((inv) => ({
      invoice: inv,
      source: 'books' as const,
      reason: 'missing_in_gstr2b' as const,
    })),
    ...unmatchedGstr2b.map((inv) => ({
      invoice: inv,
      source: 'gstr2b' as const,
      reason: 'missing_in_books' as const,
    })),
  ];

  return {
    matched: exactMatched,
    mismatched,
    pending,
  };
}

/**
 * Get summary statistics for reconciliation result
 */
export function getReconciliationSummary(
  result: ReconciliationResult,
  allBooks: Invoice[],
  allGstr2b: Invoice[]
): ReconciliationSummary {
  const totalBooks = allBooks.length;
  const totalGstr2b = allGstr2b.length;
  const matchedCount = result.matched.length + result.mismatched.length;
  const pendingBooks = result.pending.filter((p) => p.source === 'books').length;
  const pendingGstr2b = result.pending.filter((p) => p.source === 'gstr2b').length;

  const totalTaxAsPerBooks = allBooks.reduce((sum, inv) => sum + inv.totalTax, 0);
  const totalTaxAsPerGstr2b = allGstr2b.reduce((sum, inv) => sum + inv.totalTax, 0);

  return {
    totalBooks,
    totalGstr2b,
    matched: result.matched.length,
    mismatched: result.mismatched.length,
    pendingBooks,
    pendingGstr2b,
    matchRate: totalBooks > 0 ? (matchedCount / totalBooks) * 100 : 0,
    totalTaxAsPerBooks,
    totalTaxAsPerGstr2b,
    taxDifference: absDiff(totalTaxAsPerBooks, totalTaxAsPerGstr2b),
  };
}

/**
 * Export for testing
 */
export { isInvoicesMatch, absDiff, percentDiff };
