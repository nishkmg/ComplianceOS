"use client";

import { useState, useMemo, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  amount: string;
  status: "draft" | "sent" | "partially_paid" | "paid" | "voided" | "overdue";
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockInvoices: Invoice[] = [
  { id: "1", invoiceNumber: "INV-2026-27-001", customerName: "Acme Corp",           date: "2026-04-15", dueDate: "2026-05-15", amount: "1,18,000", status: "sent" },
  { id: "2", invoiceNumber: "INV-2026-27-002", customerName: "TechStart Ltd",       date: "2026-04-18", dueDate: "2026-05-18", amount: "59,000",   status: "draft" },
  { id: "3", invoiceNumber: "INV-2026-27-003", customerName: "Global Traders",      date: "2026-04-10", dueDate: "2026-05-10", amount: "2,36,000", status: "partially_paid" },
  { id: "4", invoiceNumber: "INV-2026-27-004", customerName: "Alpha Industries",    date: "2026-04-05", dueDate: "2026-05-05", amount: "3,54,000", status: "paid" },
  { id: "5", invoiceNumber: "INV-2026-27-005", customerName: "Delayed Payments Co", date: "2026-03-20", dueDate: "2026-04-19", amount: "5,90,000", status: "overdue" },
];

const tabs = ["all", "draft", "sent", "partially_paid", "paid", "voided", "overdue"] as const;

// ─── Column defs ──────────────────────────────────────────────────────────────

const columns: ColumnDef<Invoice>[] = [
  {
    key: "invoiceNumber",
    header: "Invoice #",
    width: "160px",
    render: (row) => (
      <Link href={`/invoices/${row.id}`} className="font-mono text-[13px] text-amber-text hover:underline no-underline">
        {row.invoiceNumber}
      </Link>
    ),
  },
  {
    key: "customerName",
    header: "Customer",
    sortable: true,
    render: (row) => <span className="font-ui text-[13px] text-dark font-medium">{row.customerName}</span>,
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    width: "120px",
    render: (row) => (
      <span className="font-mono text-[12px] text-mid">
        {new Date(row.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
    ),
  },
  {
    key: "dueDate",
    header: "Due Date",
    sortable: true,
    width: "120px",
    render: (row) => (
      <span className="font-mono text-[12px] text-mid">
        {new Date(row.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
    ),
  },
  {
    key: "amount",
    header: "Amount (₹)",
    align: "right",
    sortable: true,
    width: "140px",
    render: (row) => <span className="font-mono text-[13px] tabular-nums font-semibold">₹{row.amount}</span>,
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    width: "130px",
    render: (row) => <InvoiceStatusBadge status={row.status} />,
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const filtered = useMemo(
    () =>
      mockInvoices.filter(inv => {
        if (statusFilter !== "all" && inv.status !== statusFilter) return false;
        if (search && !inv.customerName.toLowerCase().includes(search.toLowerCase()) && !inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [statusFilter, search]
  );

  const totalAmount = filtered.reduce((s, inv) => s + parseFloat(inv.amount.replace(/,/g, "")), 0);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: mockInvoices.length };
    for (const tab of tabs) if (tab !== "all") c[tab] = mockInvoices.filter(i => i.status === tab).length;
    return c;
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-1">
            Billing
          </p>
          <h1 className="font-display text-display-lg font-semibold text-dark leading-tight">Invoices</h1>
          <p className="font-ui text-[13px] text-secondary mt-1">Manage and track your fiscal billing documents.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-border text-mid text-[10px] font-ui text-[11px] uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-md flex items-center gap-1.5">
            <Icon name="download" size={14} /> Export List
          </button>
          <Link
            href="/invoices/scan"
            className="px-4 py-2 border border-border text-mid text-[10px] font-ui text-[11px] uppercase tracking-widest hover:bg-surface-muted transition-colors no-underline rounded-md"
          >
            Scan
          </Link>
          <Link
            href="/invoices/new"
            className="px-4 py-2 bg-amber text-white text-[10px] font-ui text-[11px] uppercase tracking-widest hover:bg-amber-hover transition-colors no-underline rounded-md flex items-center gap-1.5"
          >
            <Icon name="add" size={14} /> New Invoice
          </Link>
        </div>
      </div>

      {/* Filter + search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 bg-surface-muted rounded-md p-0.5 border border-border overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-[11px] font-ui text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer border-none rounded-md ${
                statusFilter === tab
                  ? "bg-surface text-dark shadow-sm"
                  : "text-mid hover:text-dark bg-transparent"
              }`}
            >
              {tab === "all" ? "All" : tab.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              <span className="ml-1.5 text-[10px] text-light">({counts[tab]})</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
          <input
            className="bg-surface border border-border text-[12px] font-ui px-8 py-1.5 w-56 rounded-md focus:ring-1 focus:ring-amber outline-none placeholder:text-light"
            placeholder="Search invoices…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* DataTable */}
      {loading ? (
        <TableSkeleton rows={10} columns={6} />
      ) : (
        <DataTable<Invoice>
          data={filtered}
          columns={columns}
          keyExtractor={row => row.id}
          pageSize={15}
          emptyState={
            <EmptyState
              title="No invoices found"
              description={search || statusFilter !== "all" ? "Try adjusting your search or filter." : "Create your first invoice to start billing customers."}
              action={{ label: "New Invoice", onClick: () => window.location.href = "/invoices/new" }}
              icon="receipt_long"
            />
          }
          footer={
            <tr className="bg-surface-muted border-t-2 border-border">
              <td colSpan={5} className="px-4 py-3 font-ui text-[10px] uppercase tracking-widest text-mid font-bold">
                Total ({filtered.length} invoices)
              </td>
              <td className="px-4 py-3 font-mono text-[13px] text-dark tabular-nums text-right font-semibold">
                ₹{totalAmount.toLocaleString("en-IN")}
              </td>
            </tr>
          }
        />
      )}
    </div>
  );
}
