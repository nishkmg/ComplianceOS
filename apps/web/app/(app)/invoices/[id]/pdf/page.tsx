"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { pdf } from "@react-pdf/renderer";

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
// API helpers (same pattern as onboarding)
// ---------------------------------------------------------------------------

async function fetchInvoice(id: string): Promise<InvoiceWithLines> {
  const url = `/api/trpc/invoices.get?input=${encodeURIComponent(JSON.stringify({ id }))}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch invoice: ${response.statusText}`);
  const json = await response.json();
  const data = json.result?.data;
  if (!data) throw new Error("Invoice not found");
  return data;
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
  onDownload: () => void;
  onPrint: () => void;
}

const PdfPreviewInner = dynamic(
  () => import("@/components/ui/invoice-pdf").then((mod) => mod.InvoicePDF),
  { ssr: false, loading: () => <PdfLoadingSkeleton /> }
);

function PdfPreview({ invoice, config, onDownload, onPrint }: PdfPreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<ReturnType<typeof pdf> | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  // Generate PDF blob on mount or when invoice/config changes
  useEffect(() => {
    let cancelled = false;
    let currentUrl: string | null = null;

    async function generatePdf() {
      setIsGenerating(true);
      try {
        const { InvoicePDF } = await import("@/components/ui/invoice-pdf");
        const doc = pdf(<InvoicePDF invoice={invoice} config={config} />);
        if (cancelled) return;
        setPdfDoc(doc);

        // Generate blob URL for preview
        const blob = await doc.toBlob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        currentUrl = url;
        setBlobUrl(url);
      } catch (err) {
        console.error("PDF generation failed:", err);
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    }

    generatePdf();

    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [invoice, config]);

  const handleDownload = useCallback(() => {
    if (pdfDoc) {
      pdfDoc.toBlob().then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }, [pdfDoc, invoice.invoiceNumber]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {isGenerating && (
          <span className="text-sm text-gray-500">Generating PDF...</span>
        )}
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download PDF
        </button>
        <button
          onClick={onPrint}
          disabled={isGenerating || !blobUrl}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Print
        </button>
      </div>

      {/* PDF Preview */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {isGenerating ? (
          <PdfLoadingSkeleton />
        ) : blobUrl ? (
          <iframe
            src={blobUrl}
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

  const [invoice, setInvoice] = useState<InvoiceWithLines | null>(null);
  const [config, setConfig] = useState<InvoiceConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load invoice
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const invoiceData = await fetchInvoice(id);
        setInvoice(invoiceData);

        // Build config from invoice data (simplified for now)
        const configData: InvoiceConfig = {
          company: {
            name: "ComplianceOS Demo",
            address: invoiceData.customerAddress || "123 Business Park, Suite 100",
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <PdfLoadingSkeleton />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          {error || "Failed to load invoice"}
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
      {config && (
        <PdfPreview
          invoice={invoice}
          config={config}
          onDownload={() => {}}
          onPrint={handlePrint}
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
