"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function InventoryMovementsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = api.inventory.movements.useQuery({ page, pageSize: 50 }, { staleTime: 15_000 });
  const rows = (data as any)?.movements ?? [];

  return (
    <div className="space-y-10 text-left">
      <header className="mb-8">
        <PageHeader
          eyebrow="Inventory · Movements"
          title="Stock Movements"
          description="Every layer movement: purchases received, sales delivered, adjustments."
        />
      </header>

      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
        <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
          <h3 className="font-ui text-lg font-bold text-dark">Ledger</h3>
          <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">{isLoading ? "Loading…" : `${(rows as any[]).length} movements`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle text-light font-ui text-ui-2xs uppercase tracking-widest">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6 text-right">Qty</th>
                <th className="py-4 px-6 text-right">Unit cost</th>
                <th className="py-4 px-6">Narration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-ui text-ui-sm">
              {(rows as any[]).map((m) => (
                <tr key={m.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-5 px-6 font-mono text-ui-xs text-mid">{fmtDate(m.createdAt ?? m.movementDate ?? "")}</td>
                  <td className="py-5 px-6 font-medium text-dark">{m.productName ?? m.productId?.slice(0, 8)}</td>
                  <td className="py-5 px-6">
                    <span className={`inline-block px-2 py-0.5 text-ui-2xs uppercase font-bold tracking-widest border rounded-md ${
                      (m.type ?? m.movementType ?? "").toLowerCase().includes("in") || (m.type ?? "") === "purchase"
                        ? "bg-success-bg text-success-deep border-success/20"
                        : (m.type ?? "").toLowerCase().includes("adjust")
                          ? "bg-amber-soft text-amber border-amber/30"
                          : "bg-surface-muted text-mid border-border-subtle"
                    }`}>
                      {m.type ?? m.movementType ?? "movement"}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right font-mono text-dark">{m.quantity}</td>
                  <td className="py-5 px-6 text-right font-mono text-mid">{m.unitCost != null ? `₹${m.unitCost}` : "—"}</td>
                  <td className="py-5 px-6 text-mid max-w-xs truncate">{m.narration ?? "—"}</td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-mid font-ui text-ui-sm">No stock movements yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
