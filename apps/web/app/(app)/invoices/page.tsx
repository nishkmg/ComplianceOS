"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  date: string;
  due_date: string;
  grand_total: number;
  status: string;
}

const columns: ColumnDef<Invoice>[] = [
  { key: "invoice_number", header: "Invoice #", sortable: true, width: "180px",
    render: (row) => <Link href={`/invoices/${row.id}`} className="font-mono text-[13px] text-amber-text hover:underline no-underline">{row.invoice_number}</Link> },
  { key: "customer_name", header: "Customer", sortable: true,
    render: (row) => <span className="font-ui text-[13px] text-dark">{row.customer_name}</span> },
  { key: "date", header: "Date", sortable: true, width: "130px",
    render: (row) => <span className="font-mono text-[12px] text-mid">{new Date(row.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span> },
  { key: "grand_total", header: "Amount (₹)", align: "right", sortable: true, width: "150px",
    render: (row) => <span className="font-mono text-[13px] font-semibold tabular-nums">{formatIndianNumber(Number(row.grand_total), { currency: true, decimals: 2 })}</span> },
  { key: "status", header: "Status", align: "center", width: "100px",
    render: (row) => <Badge variant={row.status === "posted" ? "success" : row.status === "draft" ? "amber" : "gray"}>{row.status}</Badge> },
];

export default function InvoicesPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        const res = await fetch(`/api/invoices?tenantId=${encodeURIComponent(tenantId)}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setInvoices(data.invoices || []);
      } catch {
        showToast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId]);

  if (loading) return <TableSkeleton rows={5} columns={5} />;
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-display-lg font-semibold text-dark">Invoices</h1></div>
        <Link href="/invoices/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-all rounded-md shadow-sm no-underline">
          <Icon name="add" size={14} /> New Invoice
        </Link>
      </div>
      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm">
        {invoices.length > 0 ? <DataTable columns={columns} data={invoices} keyExtractor={(r) => r.id} /> :
          <EmptyState icon="receipt_long" title="No invoices yet" description="Create your first invoice to get started." />}
      </div>
    </div>
  );
}
