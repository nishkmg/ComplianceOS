"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
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

const columns: ColumnDef<Invoice>[] = [
  { key: "invoiceNumber", header: "Invoice #", sortable: true, width: "180px",
    render: (row) => <Link href={`/invoices/${row.id}`} className="font-mono text-[13px] text-amber-text hover:underline no-underline">{row.invoiceNumber}</Link> },
  { key: "customerName", header: "Customer", sortable: true,
    render: (row) => <span className="font-ui text-[13px] text-dark">{row.customerName}</span> },
  { key: "date", header: "Date", sortable: true, width: "130px",
    render: (row) => <span className="font-mono text-[12px] text-mid">{new Date(row.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span> },
  { key: "grandTotal", header: "Amount (₹)", align: "right", sortable: true, width: "150px",
    render: (row) => <span className="font-mono text-[13px] font-semibold tabular-nums">{formatIndianNumber(Number(row.grandTotal), { currency: true, decimals: 2 })}</span> },
  { key: "status", header: "Status", align: "center", width: "100px",
    render: (row) => <Badge variant={row.status === "posted" ? "success" : row.status === "draft" ? "amber" : "gray"}>{row.status}</Badge> },
];

export default function InvoicesPage() {
  const { data, isLoading } = api.invoices.list.useQuery({ page: 1, pageSize: 50 });
  const invoices = (data?.invoices ?? []) as Invoice[];

  if (isLoading) return <TableSkeleton rows={5} columns={5} />;
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <div><h1 className="font-ui text-display-lg font-semibold text-dark">Invoices</h1></div>
        <Link href="/invoices/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors rounded-md shadow-sm no-underline">
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
