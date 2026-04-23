// @ts-nocheck
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

// Types
interface InvoiceLineData {
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

interface InvoiceWithLines {
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

interface InvoiceConfig {
  company: {
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
  };
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function PdfLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-pulse space-y-4 w-full max-w-2xl">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-32 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF Preview Component
// ---------------------------------------------------------------------------

interface PdfPreviewProps {
  invoice: InvoiceWithLines;
  config: InvoiceConfig;
  pdfUrl: string | null;
  filename: string;
  onDownload: () => void;
  onPrint: () => void;
}

function PdfPreview({ invoice, config, pdfUrl, filename, onDownload, onPrint }: PdfPreviewProps) {
  const handlePrint = useCallback(() => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, "_blank");
      printWindow?.print();
    }
  }, [pdfUrl]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onDownload}
          disabled={!pdfUrl}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          disabled={!pdfUrl}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Print
        </button>
      </div>

      {/* PDF Preview */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-[600px]"
            title="Invoice PDF Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Unable to generate preview</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

function InvoicePdfPageContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [config, setConfig] = useState<InvoiceConfig | null>(null);
  const [pdfData, setPdfData] = useState<{ url: string; filename: string } | null>(null);

  // Fetch invoice data
  const { data: invoice, isLoading: isLoadingInvoice, error: invoiceError } = api.invoices.get.useQuery({ id });

  // Generate PDF mutation
  const { mutateAsync: generatePdf, isPending: isGeneratingPdf } = api.invoices.generatePdf.useMutation();

  // Load config and generate PDF on mount
  useEffect(() => {
    if (invoice) {
      // Build config from invoice data
      const configData: InvoiceConfig = {
        company: {
          name: "ComplianceOS Demo",
          address: invoice.customerAddress || "123 Business Park, Suite 100",
          city: "Chennai",
          state: "IN-TN",
          gstin: "33AAAAA0000A1ZA",
          pan: "AAAAA0000A",
          email: "billing@example.com",
          phone: "+91 98765 43210",
          bankName: "HDFC Bank",
          bankAccount: "XXXXXXXX1234",
          bankIfsc: "HDFC0001234",
        },
      };
      setConfig(configData);

      // Generate PDF
      generatePdf({ id }).then((result) => {
        setPdfData({ url: result.pdfUrl, filename: result.filename });
      }).catch((err) => {
        console.error("PDF generation failed:", err);
      });
    }
  }, [invoice, id, generatePdf]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleDownload = useCallback(() => {
    if (pdfData?.url) {
      const a = document.createElement("a");
      a.href = pdfData.url;
      a.download = pdfData.filename;
      a.click();
    }
  }, [pdfData]);

  const isLoading = isLoadingInvoice || isGeneratingPdf || !config;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <PdfLoadingSkeleton />
      </div>
    );
  }

  if (invoiceError || !invoice) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          {invoiceError?.message || "Failed to load invoice"}
        </div>
        <div className="mt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Invoice Preview</h1>
          <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>
        </div>
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
        >
          Close
        </button>
      </div>

      {/* PDF Preview */}
      {config && pdfData && (
        <PdfPreview
          invoice={invoice}
          config={config}
          pdfUrl={pdfData.url}
          filename={pdfData.filename}
          onDownload={handleDownload}
          onPrint={() => {}}
        />
      )}

      {/* Invoice Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Invoice Summary</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Customer</span>
            <p className="font-medium">{invoice.customerName}</p>
          </div>
          <div>
            <span className="text-gray-500">Date</span>
            <p className="font-medium">{invoice.date}</p>
          </div>
          <div>
            <span className="text-gray-500">Grand Total</span>
            <p className="font-medium">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(invoice.grandTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePdfPage() {
  return (
    <Suspense fallback={<PdfLoadingSkeleton />}>
      <InvoicePdfPageContent />
    </Suspense>
  );
}
