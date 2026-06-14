"use client";

import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  grandTotal: string | number;
  status: string;
}

export default function InvoiceDetailPage() {
  const params = useParams(); const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const { data: invoice, isLoading } = api.invoices.get.useQuery({ id }, { enabled: !!id });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  if (!invoice) return <div className="text-center py-20 text-mid font-ui">Invoice not found.</div>;

  const inv = invoice as Invoice;
  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer"><Icon name="arrow_back" size={20} /></button>
          <div><h1 className="font-ui text-display-lg font-semibold text-dark">{inv.invoiceNumber}</h1></div>
        </div>
        <Badge variant={inv.status === "posted" ? "success" : "amber"}>{inv.status}</Badge>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm grid grid-cols-2 gap-6">
        <div><span className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Customer</span><p className="font-ui text-[13px] text-dark mt-1">{inv.customerName}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Date</span><p className="font-mono text-[13px] text-dark mt-1">{new Date(inv.date).toLocaleDateString("en-IN")}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Due Date</span><p className="font-mono text-[13px] text-dark mt-1">{new Date(inv.dueDate).toLocaleDateString("en-IN")}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Total</span><p className="font-mono text-lg font-bold text-dark mt-1">{formatIndianNumber(Number(inv.grandTotal), { currency: true })}</p></div>
      </div>
      <div className="flex gap-3">
        <Link href={`/invoices/${inv.id}/edit`} className="px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline">Edit</Link>
        <Link href={`/invoices/${inv.id}/pdf`} className="px-4 py-2 border border-border text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-surface-muted rounded-md no-underline">View PDF</Link>
      </div>
    </div>
  );
}
