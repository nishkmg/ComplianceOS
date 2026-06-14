"use client";

import { useState, useMemo, useCallback } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Payment {
  id: string;
  paymentNumber: string;
  customerName: string;
  date: string;
  amount: string | number;
  paymentMethod: string;
  status: "recorded" | "voided";
}

const columns: ColumnDef<Payment>[] = [
  {
    key: "paymentNumber",
    header: "Payment #",
    sortable: true,
    width: "180px",
    render: (row) => (
      <Link href={`/payments/${row.id}`} className="font-mono text-[13px] text-amber-text hover:underline no-underline">
        {row.paymentNumber}
      </Link>
    ),
  },
  {
    key: "customerName",
    header: "From / To",
    sortable: true,
    render: (row) => <span className="font-ui text-[13px] text-dark">{row.customerName}</span>,
  },
  {
    key: "paymentMethod",
    header: "Method",
    render: (row) => <span className="font-ui text-[13px] text-[12px] text-mid capitalize">{row.paymentMethod}</span>,
  },
  {
    key: "amount",
    header: "Amount (₹)",
    align: "right",
    sortable: true,
    width: "150px",
    render: (row) => <span className="font-mono text-[13px] font-semibold tabular-nums">₹{Number(row.amount).toLocaleString("en-IN")}</span>,
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    width: "100px",
    render: (row) => <Badge variant={row.status === "recorded" ? "success" : "gray"}>{row.status}</Badge>,
  },
];

export default function PaymentsPage() {
  const { activeFy } = useFiscalYear();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = api.payments.list.useQuery({ page: 1, pageSize: 100 });

  if (error) {
    showToast.error("Failed to load payments");
  }

  const payments = (data?.items ?? []) as Payment[];

  const filtered = useMemo(
    () => payments.filter(p => !search || p.customerName.toLowerCase().includes(search.toLowerCase()) || p.paymentNumber.toLowerCase().includes(search.toLowerCase())),
    [search, payments]
  );

  const totalAmount = filtered.reduce((s, p) => s + Number(p.amount), 0);

  const handleExport = useCallback(() => {
    if (filtered.length === 0) { showToast.error("No payments to export."); return; }
    const header = "Payment #,Date,Customer,Amount,Method,Status";
    const rows = filtered.map(p => `${p.paymentNumber},${p.date},"${p.customerName}",${p.amount},${p.paymentMethod},${p.status}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `payments-${activeFy}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [filtered, activeFy]);

  if (isLoading) return <TableSkeleton rows={5} columns={5} />;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-ui text-display-lg font-semibold text-dark">Payments</h1>
          <p className="text-[13px] text-secondary font-ui mt-1">FY {activeFy}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-mid text-[16px]" />
            <input className="pl-8 pr-3 py-2 w-48 bg-surface border border-border rounded-md text-[12px] font-ui outline-none focus:border-amber transition-colors" placeholder="Search payments…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 border border-border text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-md">
            <Icon name="download" size={14} /> Export
          </button>
          <Link href="/payments/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors rounded-md shadow-sm no-underline">
            <Icon name="add" size={14} /> Record Payment
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm">
        <div className="p-4 bg-surface-muted border-b border-border flex items-center justify-between">
          <span className="font-ui text-[11px] text-text-mid">{filtered.length} payment{filtered.length !== 1 ? "s" : ""}</span>
          <span className="font-mono text-[13px] font-bold tabular-nums">₹{totalAmount.toLocaleString("en-IN")}</span>
        </div>
        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} keyExtractor={(r) => r.id} />
        ) : (
          <EmptyState icon="payments" title="No payments yet" description="Record your first payment or receipt to get started." />
        )}
      </div>
    </div>
  );
}
