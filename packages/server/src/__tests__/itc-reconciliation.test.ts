/**
 * ITC Reconciliation Service Tests
 * 
 * Tests for purchase register vs GSTR-2B matching with tolerance
 */

import { describe, it, expect } from 'vitest';
import {
  matchInvoices,
  categorizeMismatch,
  getReconciliationSummary,
  isInvoicesMatch,
  absDiff,
  percentDiff,
  type ReconciliationResult,
} from '../services/itc-reconciliation';

// Test helpers
const createInvoice = (overrides: Partial<{
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  supplierGstin: string;
  recipientGstin: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalValue: number;
  totalTax: number;
}>): any => ({
  id: overrides.id ?? 'inv-' + Math.random().toString(36).substr(2, 9),
  invoiceNumber: overrides.invoiceNumber ?? 'INV-001',
  invoiceDate: overrides.invoiceDate ?? new Date('2026-04-15'),
  supplierGstin: overrides.supplierGstin ?? '27AABCU9603R1ZM',
  recipientGstin: overrides.recipientGstin ?? '27AAACR1234R1Z5',
  taxableValue: overrides.taxableValue ?? 1000,
  cgst: overrides.cgst ?? 90,
  sgst: overrides.sgst ?? 90,
  igst: overrides.igst ?? 0,
  cess: overrides.cess ?? 0,
  totalValue: overrides.totalValue ?? 1180,
  totalTax: overrides.totalTax ?? 180,
});

describe('ITC Reconciliation', () => {
  describe('Utility Functions', () => {
    describe('absDiff', () => {
      it('should calculate absolute difference', () => {
        expect(absDiff(100, 80)).toBe(20);
        expect(absDiff(50, 50)).toBe(0);
        expect(absDiff(30, 100)).toBe(70);
      });

      it('should handle decimals', () => {
        expect(absDiff(100.5, 100.3)).toBeCloseTo(0.2, 1);
      });
    });

    describe('percentDiff', () => {
      it('should calculate percentage difference', () => {
        expect(percentDiff(100, 110)).toBeCloseTo(0.095, 2); // ~9.5%
        expect(percentDiff(100, 100)).toBe(0);
        expect(percentDiff(100, 101)).toBeCloseTo(0.00995, 3); // ~1%
      });

      it('should handle zero values', () => {
        expect(percentDiff(0, 0)).toBe(0);
      });
    });

    describe('isInvoicesMatch', () => {
      it('should match exact invoices', () => {
        const book = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 180 });
        const gstr2b = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 180 });

        const result = isInvoicesMatch(book, gstr2b);

        expect(result.matches).toBe(true);
        expect(result.confidence).toBe('exact');
        expect(result.valueDiff).toBe(0);
        expect(result.taxDiff).toBe(0);
      });

      it('should match with value tolerance (₹1)', () => {
        const book = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 180 });
        const gstr2b = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1000.5, totalTax: 180 });

        const result = isInvoicesMatch(book, gstr2b);

        expect(result.matches).toBe(true);
        expect(result.confidence).toBe('tolerance');
        expect(result.valueDiff).toBeCloseTo(0.5, 1);
      });

      it('should match with 1% value tolerance', () => {
        const book = createInvoice({ invoiceNumber: 'INV-001', totalValue: 10000, totalTax: 1800 });
        const gstr2b = createInvoice({ invoiceNumber: 'INV-001', totalValue: 10050, totalTax: 1800 });

        const result = isInvoicesMatch(book, gstr2b);

        expect(result.matches).toBe(true);
        expect(result.confidence).toBe('tolerance');
      });

      it('should match with tax tolerance (₹1)', () => {
        const book = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 180 });
        const gstr2b = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 180.5 });

        const result = isInvoicesMatch(book, gstr2b);

        expect(result.matches).toBe(true);
        expect(result.confidence).toBe('tolerance');
        expect(result.taxDiff).toBeCloseTo(0.5, 1);
      });

      it('should not match with different GSTIN', () => {
        const book = createInvoice({ invoiceNumber: 'INV-001', supplierGstin: '27AABCU9603R1ZM' });
        const gstr2b = createInvoice({ invoiceNumber: 'INV-001', supplierGstin: '27AABCU9603R1ZN' });

        const result = isInvoicesMatch(book, gstr2b);

        expect(result.matches).toBe(false);
        expect(result.confidence).toBe('no_match');
      });

      it('should not match with different invoice number', () => {
        const book = createInvoice({ invoiceNumber: 'INV-001' });
        const gstr2b = createInvoice({ invoiceNumber: 'INV-002' });

        const result = isInvoicesMatch(book, gstr2b);

        expect(result.matches).toBe(false);
      });

      it('should not match beyond tolerance', () => {
        const book = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 180 });
        const gstr2b = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1100, totalTax: 200 });

        const result = isInvoicesMatch(book, gstr2b);

        expect(result.matches).toBe(false);
        expect(result.confidence).toBe('no_match');
      });
    });
  });

  describe('matchInvoices', () => {
    it('should match identical invoices', () => {
      const books = [
        createInvoice({ id: 'b1', invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 180 }),
        createInvoice({ id: 'b2', invoiceNumber: 'INV-002', totalValue: 2000, totalTax: 360 }),
      ];
      const gstr2b = [
        createInvoice({ id: 'g1', invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 180 }),
        createInvoice({ id: 'g2', invoiceNumber: 'INV-002', totalValue: 2000, totalTax: 360 }),
      ];

      const result = matchInvoices(books, gstr2b);

      expect(result.matched.length).toBe(2);
      expect(result.unmatchedBooks.length).toBe(0);
      expect(result.unmatchedGstr2b.length).toBe(0);
    });

    it('should match invoices within tolerance', () => {
      const books = [
        createInvoice({ id: 'b1', invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 180 }),
      ];
      const gstr2b = [
        createInvoice({ id: 'g1', invoiceNumber: 'INV-001', totalValue: 1000.5, totalTax: 180.5 }),
      ];

      const result = matchInvoices(books, gstr2b);

      expect(result.matched.length).toBe(1);
      expect(result.matched[0].confidence).toBe('tolerance');
    });

    it('should handle missing invoices in GSTR-2B', () => {
      const books = [
        createInvoice({ id: 'b1', invoiceNumber: 'INV-001' }),
        createInvoice({ id: 'b2', invoiceNumber: 'INV-002' }),
      ];
      const gstr2b = [
        createInvoice({ id: 'g1', invoiceNumber: 'INV-001' }),
      ];

      const result = matchInvoices(books, gstr2b);

      expect(result.matched.length).toBe(1);
      expect(result.unmatchedBooks.length).toBe(1);
      expect(result.unmatchedBooks[0].invoiceNumber).toBe('INV-002');
    });

    it('should handle missing invoices in books', () => {
      const books = [
        createInvoice({ id: 'b1', invoiceNumber: 'INV-001' }),
      ];
      const gstr2b = [
        createInvoice({ id: 'g1', invoiceNumber: 'INV-001' }),
        createInvoice({ id: 'g2', invoiceNumber: 'INV-002' }),
      ];

      const result = matchInvoices(books, gstr2b);

      expect(result.matched.length).toBe(1);
      expect(result.unmatchedGstr2b.length).toBe(1);
      expect(result.unmatchedGstr2b[0].invoiceNumber).toBe('INV-002');
    });

    it('should match by GSTIN + invoice number + date', () => {
      const books = [
        createInvoice({ 
          id: 'b1', 
          invoiceNumber: 'INV-001', 
          supplierGstin: '27AABCU9603R1ZM',
          invoiceDate: new Date('2026-04-15'),
        }),
      ];
      const gstr2b = [
        createInvoice({ 
          id: 'g1', 
          invoiceNumber: 'INV-001', 
          supplierGstin: '27AABCU9603R1ZM',
          invoiceDate: new Date('2026-04-15'),
        }),
        createInvoice({ 
          id: 'g2', 
          invoiceNumber: 'INV-001', 
          supplierGstin: '27AABCU9603R1ZN', // Different GSTIN
          invoiceDate: new Date('2026-04-15'),
        }),
      ];

      const result = matchInvoices(books, gstr2b);

      expect(result.matched.length).toBe(1);
      expect(result.matched[0].gstr2b.id).toBe('g1');
    });

    it('should handle rounding differences', () => {
      const books = [
        createInvoice({ id: 'b1', invoiceNumber: 'INV-001', totalValue: 1180.00, totalTax: 180.00 }),
      ];
      const gstr2b = [
        createInvoice({ id: 'g1', invoiceNumber: 'INV-001', totalValue: 1180.01, totalTax: 180.01 }),
      ];

      const result = matchInvoices(books, gstr2b);

      expect(result.matched.length).toBe(1);
      expect(result.matched[0].confidence).toBe('tolerance');
    });
  });

  describe('categorizeMismatch', () => {
    it('should identify value mismatch', () => {
      const book = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 180 });
      const gstr2b = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1200, totalTax: 180 });

      const result = categorizeMismatch(book, gstr2b);

      expect(result.mismatchTypes).toContain('value_mismatch');
      expect(result.differences.valueDiff).toBe(200);
    });

    it('should identify tax mismatch', () => {
      const book = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 180 });
      const gstr2b = createInvoice({ invoiceNumber: 'INV-001', totalValue: 1000, totalTax: 200 });

      const result = categorizeMismatch(book, gstr2b);

      expect(result.mismatchTypes).toContain('tax_mismatch');
      expect(result.differences.taxDiff).toBe(20);
    });

    it('should identify date mismatch', () => {
      const book = createInvoice({ 
        invoiceNumber: 'INV-001', 
        invoiceDate: new Date('2026-04-15'),
      });
      const gstr2b = createInvoice({ 
        invoiceNumber: 'INV-001', 
        invoiceDate: new Date('2026-04-25'), // 10 days later
      });

      const result = categorizeMismatch(book, gstr2b);

      expect(result.mismatchTypes).toContain('date_mismatch');
      expect(result.differences.dateDiff).toBeGreaterThan(3);
    });

    it('should identify GSTIN mismatch', () => {
      const book = createInvoice({ 
        invoiceNumber: 'INV-001', 
        supplierGstin: '27AABCU9603R1ZM',
      });
      const gstr2b = createInvoice({ 
        invoiceNumber: 'INV-001', 
        supplierGstin: '27AABCU9603R1ZN',
      });

      const result = categorizeMismatch(book, gstr2b);

      expect(result.mismatchTypes).toContain('gstin_mismatch');
      expect(result.differences.gstinMatch).toBe(false);
    });

    it('should identify multiple mismatches', () => {
      const book = createInvoice({ 
        invoiceNumber: 'INV-001', 
        supplierGstin: '27AABCU9603R1ZM',
        totalValue: 1000,
        totalTax: 180,
        invoiceDate: new Date('2026-04-15'),
      });
      const gstr2b = createInvoice({ 
        invoiceNumber: 'INV-001', 
        supplierGstin: '27AABCU9603R1ZN', // Different GSTIN
        totalValue: 1200, // Different value
        totalTax: 200, // Different tax
        invoiceDate: new Date('2026-04-25'), // Different date
      });

      const result = categorizeMismatch(book, gstr2b);

      expect(result.mismatchTypes).toContain('gstin_mismatch');
      expect(result.mismatchTypes).toContain('value_mismatch');
      expect(result.mismatchTypes).toContain('tax_mismatch');
      expect(result.mismatchTypes).toContain('date_mismatch');
    });

    it('should not flag minor differences within tolerance', () => {
      const book = createInvoice({ 
        invoiceNumber: 'INV-001', 
        totalValue: 1000,
        totalTax: 180,
        invoiceDate: new Date('2026-04-15'),
      });
      const gstr2b = createInvoice({ 
        invoiceNumber: 'INV-001', 
        totalValue: 1000.5, // Within ₹1 tolerance
        totalTax: 180.5, // Within ₹1 tolerance
        invoiceDate: new Date('2026-04-16'), // Within 3 days
      });

      const result = categorizeMismatch(book, gstr2b);

      expect(result.mismatchTypes).not.toContain('value_mismatch');
      expect(result.mismatchTypes).not.toContain('tax_mismatch');
      expect(result.mismatchTypes).not.toContain('date_mismatch');
    });

    it('should handle different date formats', () => {
      // Same date, different timezone representations
      const book = createInvoice({ 
        invoiceNumber: 'INV-001', 
        invoiceDate: new Date('2026-04-15T00:00:00.000Z'),
      });
      const gstr2b = createInvoice({ 
        invoiceNumber: 'INV-001', 
        invoiceDate: new Date('2026-04-15T05:30:00.000Z'), // Same day, different time
      });

      const result = categorizeMismatch(book, gstr2b);

      // Should not be a date mismatch (same day)
      expect(result.mismatchTypes).not.toContain('date_mismatch');
    });
  });

  describe('getReconciliationSummary', () => {
    it('should calculate correct statistics', () => {
      const books = [
        createInvoice({ id: 'b1', totalValue: 1000, totalTax: 180 }),
        createInvoice({ id: 'b2', totalValue: 2000, totalTax: 360 }),
        createInvoice({ id: 'b3', totalValue: 3000, totalTax: 540 }),
      ];
      const gstr2b = [
        createInvoice({ id: 'g1', totalValue: 1000, totalTax: 180 }),
        createInvoice({ id: 'g2', totalValue: 2000, totalTax: 360 }),
      ];

      const reconciliationResult: ReconciliationResult = {
        matched: [
          { book: books[0], gstr2b: gstr2b[0], confidence: 'exact' },
          { book: books[1], gstr2b: gstr2b[1], confidence: 'exact' },
        ],
        mismatched: [],
        pending: [
          { invoice: books[2], source: 'books', reason: 'missing_in_gstr2b' },
        ],
      };

      const summary = getReconciliationSummary(reconciliationResult, books, gstr2b);

      expect(summary.totalBooks).toBe(3);
      expect(summary.totalGstr2b).toBe(2);
      expect(summary.matched).toBe(2);
      expect(summary.pendingBooks).toBe(1);
      expect(summary.pendingGstr2b).toBe(0);
      expect(summary.matchRate).toBeCloseTo(66.67, 1);
      expect(summary.totalTaxAsPerBooks).toBe(1080);
      expect(summary.totalTaxAsPerGstr2b).toBe(540);
      expect(summary.taxDifference).toBe(540);
    });

    it('should handle empty data', () => {
      const reconciliationResult: ReconciliationResult = {
        matched: [],
        mismatched: [],
        pending: [],
      };

      const summary = getReconciliationSummary(reconciliationResult, [], []);

      expect(summary.totalBooks).toBe(0);
      expect(summary.totalGstr2b).toBe(0);
      expect(summary.matchRate).toBe(0);
    });

    it('should include mismatched in match rate', () => {
      const books = [
        createInvoice({ id: 'b1', totalValue: 1000, totalTax: 180 }),
        createInvoice({ id: 'b2', totalValue: 2000, totalTax: 360 }),
        createInvoice({ id: 'b3', totalValue: 3000, totalTax: 540 }),
      ];
      const gstr2b = [
        createInvoice({ id: 'g1', totalValue: 1000, totalTax: 180 }),
        createInvoice({ id: 'g2', totalValue: 2000.5, totalTax: 360.5 }), // Tolerance match
      ];

      const reconciliationResult: ReconciliationResult = {
        matched: [
          { book: books[0], gstr2b: gstr2b[0], confidence: 'exact' },
        ],
        mismatched: [
          { 
            book: books[1], 
            gstr2b: gstr2b[1], 
            mismatchTypes: ['value_mismatch', 'tax_mismatch'],
            differences: { valueDiff: 0.5, taxDiff: 0.5, gstinMatch: true },
          },
        ],
        pending: [
          { invoice: books[2], source: 'books', reason: 'missing_in_gstr2b' },
        ],
      };

      const summary = getReconciliationSummary(reconciliationResult, books, gstr2b);

      expect(summary.matched).toBe(1);
      expect(summary.mismatched).toBe(1);
      // Match rate includes both matched and mismatched (all reconciled items)
      expect(summary.matchRate).toBeCloseTo(66.67, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero-value invoices', () => {
      const books = [
        createInvoice({ id: 'b1', invoiceNumber: 'INV-001', totalValue: 0, totalTax: 0 }),
      ];
      const gstr2b = [
        createInvoice({ id: 'g1', invoiceNumber: 'INV-001', totalValue: 0, totalTax: 0 }),
      ];

      const result = matchInvoices(books, gstr2b);

      expect(result.matched.length).toBe(1);
      expect(result.matched[0].confidence).toBe('exact');
    });

    it('should handle large invoice values', () => {
      const books = [
        createInvoice({ id: 'b1', invoiceNumber: 'INV-001', totalValue: 10000000, totalTax: 1800000 }),
      ];
      const gstr2b = [
        createInvoice({ id: 'g1', invoiceNumber: 'INV-001', totalValue: 10000000, totalTax: 1800000 }),
      ];

      const result = matchInvoices(books, gstr2b);

      expect(result.matched.length).toBe(1);
    });

    it('should handle invoices with cess', () => {
      const books = [
        createInvoice({ 
          id: 'b1', 
          invoiceNumber: 'INV-001', 
          totalValue: 1180, 
          totalTax: 180,
          cess: 10,
        }),
      ];
      const gstr2b = [
        createInvoice({ 
          id: 'g1', 
          invoiceNumber: 'INV-001', 
          totalValue: 1180, 
          totalTax: 180,
          cess: 10,
        }),
      ];

      const result = matchInvoices(books, gstr2b);

      expect(result.matched.length).toBe(1);
    });

    it('should handle duplicate invoice numbers from different suppliers', () => {
      const books = [
        createInvoice({ 
          id: 'b1', 
          invoiceNumber: 'INV-001', 
          supplierGstin: '27AABCU9603R1ZM',
        }),
        createInvoice({ 
          id: 'b2', 
          invoiceNumber: 'INV-001', 
          supplierGstin: '27AABCU9603R1ZN', // Different supplier
        }),
      ];
      const gstr2b = [
        createInvoice({ 
          id: 'g1', 
          invoiceNumber: 'INV-001', 
          supplierGstin: '27AABCU9603R1ZM',
        }),
        createInvoice({ 
          id: 'g2', 
          invoiceNumber: 'INV-001', 
          supplierGstin: '27AABCU9603R1ZN',
        }),
      ];

      const result = matchInvoices(books, gstr2b);

      expect(result.matched.length).toBe(2);
    });

    it('should handle IGST invoices', () => {
      const books = [
        createInvoice({ 
          id: 'b1', 
          invoiceNumber: 'INV-001', 
          cgst: 0,
          sgst: 0,
          igst: 180,
          totalTax: 180,
        }),
      ];
      const gstr2b = [
        createInvoice({ 
          id: 'g1', 
          invoiceNumber: 'INV-001', 
          cgst: 0,
          sgst: 0,
          igst: 180,
          totalTax: 180,
        }),
      ];

      const result = matchInvoices(books, gstr2b);

      expect(result.matched.length).toBe(1);
    });
  });
});
