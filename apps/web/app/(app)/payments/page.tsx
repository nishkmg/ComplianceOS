"use client";

import { useState, useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { Badge, DataTable, type ColumnDef } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  id: string;
  paymentNumber: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: "recorded" | "voided";
  type: "received" | "paid";
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockPayments: Payment[] = [
  { id: "1", paymentNumber: "PAY-2026-27-001", customerName: "Acme Corp",   date: "2026-04-10", amount: 50000,  paymentMethod: "bank",   status: "recorded", type: "received" },
  { id: "2", paymentNumber: "PAY-2026-27-002", customerName: "Beta Ltd",    date: "2026-04-12", amount: 25000,  paymentMethod: "cash",   status: "recorded", type: "received" },
  { id: "3", paymentNumber: "PAY-2026-27-003", customerName: "Vendor X",    date: "2026-04-14", amount: 120000, paymentMethod: "online", status: "recorded", type: "paid" },
  { id: "4", paymentNumber: "PAY-2026-27-004", customerName: "Gamma Pvt",   date: "2026-04-15", amount: 75000,  paymentMethod: "cheque", status: "recorded", type: "received" },
  { id: "5", paymentNumber: "PAY-2026-27-005", customerName: "Acme Corp",   date: "2026-04-08", amount: 30000,  paymentMethod: "online", status: "voided",   type: "paid" },
];

const typeOptions = ["all", "received", "paid"] as const;

// ─── Column defs ──────────────────────────────────────────────────────────────

const columns: ColumnDef<Payment>[] = [
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
    key: "paymentNumber",
    header: "Payment #",
    width: "160px",
    render: (row) => (
      <span className="font-mono text-[13px] text-amber-text font-medium">{row.paymentNumber}</span>
    ),
  },
  {
    key: "customerName",
    header: "From / To",
    sortable: true,
    render: (row) => <span className="font-ui-sm text-[13px] text-dark">{row.customerName}</span>,
  },
  {
    key: "paymentMethod",
    header: "Method",
    render: (row) => <span className="font-ui-sm text-[12px] text-mid capitalize">{row.paymentMethod}</span>,
  },
  {
    key: "type",
    header: "Type",
    sortable: true,
    width: "100px",
    render: (row) => (
      <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider border rounded-sm ${
        row.type === "received"
          ? "bg-success-bg text-success border-green-200"
          : "bg-danger-bg text-danger border-red-200"
      }`}>
        {row.type}
      </span>
    ),
  },
  {
    key: "amount",
    header: "Amount (₹)",
    align: "right",
    sortable: true,
    width: "150px",
    render: (row) => (
      <span className="font-mono text-[13px] font-semibold tabular-nums">
        ₹{row.amount.toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    width: "100px",
    render: (row) => <Badge variant={row.status === "recorded" ? "success" : "gray"}>{row.status}</Badge>,
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      mockPayments.filter(p => {
        if (typeFilter !== "all" && p.type !== typeFilter) return false;
        if (search && !p.customerName.toLowerCase().includes(search.toLowerCase()) && !p.paymentNumber.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [typeFilter, search]
  );

  const totalAmount = filtered.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-amber-text font-ui-xs text-[10px] uppercase tracking-[0.2em] mb-1 block">
            Treasury
          </span>
          <h1 className="font-display-lg text-display-lg text-dark leading-tight">Payment Ledger</h1>
          <p className="font-ui-sm text-sm text-mid mt-1">
            High-density overview of all incoming and outgoing fiscal transactions.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-ui-xs uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1.5">
            <Icon name="download" size={14} /> Export CSV
          </button>
          <Link
            href="/payments/new"
            className="px-4 py-2 bg-primary-container text-white text-[10px] font-ui-xs uppercase tracking-widest hover:bg-amber-hover transition-colors no-underline rounded-sm flex items-center gap-1.5"
          >
            <Icon name="add" size={14} /> New Entry
          </Link>
        </div>
      </div>

      {/* Filter + search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 bg-section-muted rounded-sm p-0.5 border border-border-subtle">
          {typeOptions.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-[11px] font-ui-sm font-medium capitalize transition-colors cursor-pointer border-none rounded-sm ${
                typeFilter === t
                  ? "bg-white text-dark shadow-sm"
                  : "text-mid hover:text-dark bg-transparent"
              }`}
            >
              {t === "all" ? "All" : t}
              <span className="ml-1.5 text-[10px] text-light">
                ({t === "all" ? mockPayments.length : mockPayments.filter(p => p.type === t).length})
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
          <input
            className="bg-white border border-border-subtle text-[12px] font-ui px-8 py-1.5 w-56 rounded-sm focus:ring-1 focus:ring-primary-container outline-none placeholder:text-light"
            placeholder="Search entries…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable<Payment>
        data={filtered}
        columns={columns}
        keyExtractor={row => row.id}
        pageSize={15}
        emptyState={
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Icon name="account_balance_wallet" className="text-4xl text-lighter mb-4" />
            <p className="font-ui-sm text-sm text-mid">No payments found.</p>
          </div>
        }
        footer={
          <tr className="bg-stone-50 border-t-2 border-border-subtle">
            <td colSpan={5} className="px-4 py-3 font-ui-xs text-[10px] uppercase tracking-widest text-mid font-bold">
              Total ({filtered.length} entries)
            </td>
            <td className="px-4 py-3 font-mono text-[13px] text-dark tabular-nums text-right font-semibold">
              ₹{totalAmount.toLocaleString("en-IN")}
            </td>
            <td />
          </tr>
        }
      />
    </div>
  );
}
