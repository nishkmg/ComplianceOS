"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useSession } from "next-auth/react";

interface Invoice { id: string; invoice_number: string; customer_name: string; date: string; due_date: string; grand_total: number; status: string; subtotal: number; }

export default function InvoiceDetailPage() {
  const params = useParams(); const router = useRouter();
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [invoice, setInvoice] = useState<Invoice | null>(null); const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/invoices/${params.id}?tenantId=${tenantId || ""}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setInvoice(data.invoice || data || null);
      } catch { setInvoice(null); } finally { setLoading(false); }
    })();
  }, [params.id, tenantId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  if (!invoice) return <div className="text-center py-20 text-mid font-ui">Invoice not found.</div>;

  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer"><Icon name="arrow_back" size={20} /></button>
          <div><h1 className="font-display text-display-lg font-semibold text-dark">{invoice.invoice_number}</h1></div>
        </div>
        <Badge variant={invoice.status === "posted" ? "success" : "amber"}>{invoice.status}</Badge>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm grid grid-cols-2 gap-6">
        <div><span className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Customer</span><p className="font-ui text-[13px] text-dark mt-1">{invoice.customer_name}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Date</span><p className="font-mono text-[13px] text-dark mt-1">{new Date(invoice.date).toLocaleDateString("en-IN")}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Due Date</span><p className="font-mono text-[13px] text-dark mt-1">{new Date(invoice.due_date).toLocaleDateString("en-IN")}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Total</span><p className="font-mono text-lg font-bold text-dark mt-1">{formatIndianNumber(Number(invoice.grand_total), { currency: true })}</p></div>
      </div>
      <div className="flex gap-3">
        <Link href={`/invoices/${invoice.id}/edit`} className="px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline">Edit</Link>
        <Link href={`/invoices/${invoice.id}/pdf`} className="px-4 py-2 border border-border text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-surface-muted rounded-md no-underline">View PDF</Link>
      </div>
    </div>
  );
}
