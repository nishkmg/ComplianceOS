export interface ScanResult {
  id: string;
  status: string;
  fileName: string;
  fileUrl: string;
  rawText: string | null;
  parsedVendorName: string | null;
  parsedInvoiceNumber: string | null;
  parsedInvoiceDate: string | null;
  parsedSubtotal: string | null;
  parsedCgstTotal: string | null;
  parsedSgstTotal: string | null;
  parsedIgstTotal: string | null;
  parsedTotal: string | null;
  parsedLineItems: string | null;
  confidenceScore: string | null;
  createdAt: string;
}
