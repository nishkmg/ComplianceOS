"use client";

import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";

export default function InvoicePdfPage() {
  const params = useParams(); const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const { data: invoice, isLoading } = api.invoices.get.useQuery({ id }, { enabled: !!id });
  const { data: pdfData } = api.invoices.getPdfSignedUrl.useQuery({ id }, { enabled: !!id });

  const generatePdfMutation = api.invoices.generatePdf.useMutation();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  if (!invoice) return <div className="text-center py-20 text-mid font-ui">Invoice not found.</div>;

  const inv = invoice as Record<string, unknown>;
  const invNum = String(inv.invoiceNumber ?? "");
  const customerName = String(inv.customerName ?? "");
  const date = String(inv.date ?? "");
  const grandTotal = Number(inv.grandTotal ?? 0);
  const lines = (inv.lines ?? []) as Array<Record<string, unknown>>;
  const status = String(inv.status ?? "");

  const signedUrl = pdfData?.url;

  async function handleGenerate() {
    try {
      const result = await generatePdfMutation.mutateAsync({ id });
      if (result?.pdfUrl) {
        window.open(result.pdfUrl, "_blank");
      }
    } catch { /* ignore */ }
  }

  if (signedUrl) {
    return (
      <div className="max-w-[900px] mx-auto space-y-4 pb-40">
        <div className="flex justify-between items-center no-print">
          <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer flex items-center gap-1"><Icon name="arrow_back" size={16} /> Back</button>
          <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer inline-flex items-center gap-1"><Icon name="download" size={14} /> Download</a>
        </div>
        <iframe src={signedUrl} className="w-full h-[calc(100vh-120px)] border border-border rounded-md" title="Invoice PDF" />
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto space-y-6 pb-40">
      <div className="flex justify-between items-center no-print">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer flex items-center gap-1"><Icon name="arrow_back" size={16} /> Back</button>
        <div className="flex gap-2">
          <button onClick={handleGenerate} disabled={generatePdfMutation.isPending} className="px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer disabled:opacity-50">
            {generatePdfMutation.isPending ? "Generating..." : "Generate PDF"}
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 border border-border text-dark text-[10px] font-bold uppercase tracking-widest hover:bg-offwhite rounded-md cursor-pointer"><Icon name="print" size={14} className="inline mr-1" /> Print</button>
        </div>
      </div>
      <div className="bg-white border border-border rounded-md p-10 shadow-sm" id="invoice-pdf">
        <div className="flex justify-between items-start mb-10">
          <div><h1 className="font-display text-2xl font-bold text-dark">INVOICE</h1><p className="font-mono text-sm text-mid mt-1">{invNum}</p></div>
          <div className="text-right"><p className="font-ui text-sm font-bold text-dark">Arthvahi</p></div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-10 pb-6 border-b border-border">
          <div><p className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Bill To</p><p className="font-ui text-sm text-dark mt-1">{customerName}</p></div>
          <div className="text-right"><p className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Date</p><p className="font-mono text-sm text-dark mt-1">{new Date(date).toLocaleDateString("en-IN")}</p></div>
        </div>

        {lines.length > 0 && (
          <div className="mb-8">
            <p className="font-ui text-[10px] text-light uppercase tracking-widest font-bold mb-3">Line Items</p>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 font-ui text-[10px] text-light uppercase">Description</th>
                  <th className="pb-2 font-ui text-[10px] text-light uppercase text-right">Qty</th>
                  <th className="pb-2 font-ui text-[10px] text-light uppercase text-right">Rate</th>
                  <th className="pb-2 font-ui text-[10px] text-light uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 font-ui text-sm text-dark">{String(line.description ?? "")}</td>
                    <td className="py-2 font-ui text-sm text-dark text-right">{String(line.quantity ?? "")}</td>
                    <td className="py-2 font-ui text-sm text-dark text-right">{formatIndianNumber(Number(line.unitPrice ?? 0), { currency: true })}</td>
                    <td className="py-2 font-ui text-sm text-dark text-right">{formatIndianNumber(Number(line.amount ?? 0), { currency: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {status !== "draft" && <div className="text-center py-6 text-mid font-ui">PDF generated — <button onClick={() => window.location.reload()} className="text-amber underline border-none bg-transparent cursor-pointer">refresh</button> to view</div>}

        <div className="mt-6 pt-6 border-t border-border text-right">
          <p className="font-ui text-sm text-mid">Total</p>
          <p className="font-display text-3xl font-bold text-dark">{formatIndianNumber(grandTotal, { currency: true })}</p>
        </div>
      </div>
    </div>
  );
}
