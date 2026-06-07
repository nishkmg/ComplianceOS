"use client";

import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  grandTotal: string | number;
}

export default function InvoicePdfPage() {
  const params = useParams(); const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const { data: invoice, isLoading } = api.invoices.get.useQuery({ id }, { enabled: !!id });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  if (!invoice) return <div className="text-center py-20 text-mid font-ui">Invoice not found.</div>;

  const inv = invoice as Invoice;
  return (
    <div className="max-w-[800px] mx-auto space-y-6 pb-40">
      <div className="flex justify-between items-center no-print">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer flex items-center gap-1"><Icon name="arrow_back" size={16} /> Back</button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer"><Icon name="print" size={14} className="inline mr-1" /> Print</button>
      </div>
      <div className="bg-white border border-border rounded-md p-10 shadow-sm" id="invoice-pdf">
        <div className="flex justify-between items-start mb-10">
          <div><h1 className="font-display text-2xl font-bold text-dark">INVOICE</h1><p className="font-mono text-sm text-mid mt-1">{inv.invoiceNumber}</p></div>
          <div className="text-right"><p className="font-ui text-sm font-bold text-dark">Arthvahi</p></div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-10 pb-6 border-b border-border">
          <div><p className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Bill To</p><p className="font-ui text-sm text-dark mt-1">{inv.customerName}</p></div>
          <div className="text-right"><p className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Date</p><p className="font-mono text-sm text-dark mt-1">{new Date(inv.date).toLocaleDateString("en-IN")}</p></div>
        </div>
        <div className="text-center py-12 text-mid font-ui">PDF preview — full layout coming soon</div>
        <div className="mt-10 pt-6 border-t border-border text-right">
          <p className="font-ui text-sm text-mid">Total</p>
          <p className="font-display text-3xl font-bold text-dark">{formatIndianNumber(Number(inv.grandTotal), { currency: true })}</p>
        </div>
      </div>
    </div>
  );
}
