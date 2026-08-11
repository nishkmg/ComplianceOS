"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

type ReportType = "valuation" | "movement" | "expiry";

const reportMeta: Record<ReportType, { label: string; desc: string }> = {
  valuation: { label: "Valuation Summary (FIFO)", desc: "Current stock levels, weighted-average cost and inventory value per product." },
  movement: { label: "Stock Movement Log", desc: "Recent receipts, issues and adjustments recorded against products." },
  expiry: { label: "Expiry & Obsolescence", desc: "Batch-level expiry tracking." },
};

export default function InventoryReportsPage() {
  const { activeFy } = useFiscalYear();
  const [reportType, setReportType] = useState<ReportType>("valuation");

  const valuation = api.stockReports.valuationReport.useQuery(undefined, {
    enabled: reportType === "valuation",
    staleTime: 15_000,
  });
  const movements = api.inventory.movements.useQuery(
    { page: 1, pageSize: 100 },
    { enabled: reportType === "movement", staleTime: 15_000 },
  );

  const valuationRows = valuation.data ?? [];
  const movementRows = movements.data?.movements ?? [];
  const totalValue = valuationRows.reduce((s, r) => s + r.totalValue, 0);

  const handleExportCSV = () => {
    if (reportType === "valuation") {
      if (valuationRows.length === 0) { showToast.error("No data to export."); return; }
      const header = "SKU,Product Name,Qty on Hand,Avg Cost (₹),Inventory Value (₹)";
      const rows = valuationRows.map((r) => `"${r.sku}","${r.productName}",${r.quantity},${r.averageCost},${r.totalValue}`);
      const csv = [header, ...rows, `,,,,"${totalValue}"`].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory-valuation-${activeFy}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast.success(`Exported ${valuationRows.length} products.`);
      return;
    }
    if (reportType === "movement") {
      if (movementRows.length === 0) { showToast.error("No data to export."); return; }
      const header = "Product,Type,Qty,Unit Cost,Created";
      const rows = movementRows.map((m) => `"${m.productId}",${m.movementType ?? ""},${m.quantity ?? 0},${m.unitCost ?? 0},${m.createdAt ?? ""}`);
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stock-movements-${activeFy}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast.success(`Exported ${movementRows.length} movements.`);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8 mt-0 mb-8">
        <div className="text-left">
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">Inventory Reports · FY {activeFy}</p>
          <PageHeader title="Inventory Reports" />
          <p className="text-ui-sm text-secondary font-ui mt-1 max-w-2xl leading-relaxed">{reportMeta[reportType].desc}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="btn btn-secondary flex items-center gap-2">
            <Icon name="print" className="text-ui-xl" /> Print Report
          </button>
          <button onClick={handleExportCSV} className="btn btn-primary flex items-center gap-2">
            <Icon name="download" className="text-ui-xl" /> Export CSV
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-surface border border-border p-6 shadow-sm border-t-2 border-t-amber flex flex-col lg:flex-row gap-6 items-end">
        <div className="w-full lg:w-1/3 text-left">
          <label className="block font-ui text-ui-2xs uppercase tracking-widest text-amber mb-2 font-bold" htmlFor="report-type">Report Type</label>
          <div className="relative">
            <select
              id="report-type"
              className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-ui text-ui-sm text-dark focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface appearance-none"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
            >
              <option value="valuation">{reportMeta.valuation.label}</option>
              <option value="movement">{reportMeta.movement.label}</option>
              <option value="expiry">{reportMeta.expiry.label}</option>
            </select>
            <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
          </div>
        </div>
      </div>

      {reportType === "expiry" ? (
        <EmptyState
          icon="hourglass_empty"
          title="Expiry tracking not implemented yet"
          description="Batch-level expiry dates are not tracked in the current build. This report will populate once batch/expiry data lands on stock movements."
        />
      ) : reportType === "valuation" && (valuation.isLoading || valuationRows.length === 0) ? (
        valuation.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
          </div>
        ) : (
          <EmptyState icon="inventory_2" title="No stock on hand" description="Products will appear here once purchase receipts or stock adjustments are recorded." />
        )
      ) : reportType === "movement" && (movements.isLoading || movementRows.length === 0) ? (
        movements.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
          </div>
        ) : (
          <EmptyState icon="swap_vert" title="No stock movements yet" description="Receipts, sales deliveries and adjustments will appear here as they are recorded." />
        )
      ) : (
        <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
          {reportType === "valuation" && (
            <>
              <div className="px-6 py-4 bg-surface-muted border-b border-border flex justify-between items-center">
                <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">Valuation Summary</h3>
                <span className="font-mono text-ui-sm font-bold text-dark">Total Value: {formatIndianNumber(totalValue)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-surface-muted border-b-[0.5px] border-border text-light font-ui text-ui-2xs uppercase tracking-widest">
                      <th className="py-4 px-6">SKU</th>
                      <th className="py-4 px-6">Product Name</th>
                      <th className="py-4 px-6 text-right">Qty on Hand</th>
                      <th className="py-4 px-6 text-right">Avg Cost (₹)</th>
                      <th className="py-4 px-6 text-right">Inventory Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                    {valuationRows.map((r) => (
                      <tr key={r.productId} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="py-4 px-6 text-amber font-medium">{r.sku}</td>
                        <td className="py-4 px-6 font-ui text-ui-sm font-bold text-dark">{r.productName}</td>
                        <td className="py-4 px-6 text-right text-dark tabular-nums">{r.quantity}</td>
                        <td className="py-4 px-6 text-right text-mid">{formatIndianNumber(r.averageCost)}</td>
                        <td className="py-4 px-6 text-right font-bold text-dark">{formatIndianNumber(r.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {reportType === "movement" && (
            <>
              <div className="px-6 py-4 bg-surface-muted border-b border-border">
                <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">Recent Movements</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-surface-muted border-b-[0.5px] border-border text-light font-ui text-ui-2xs uppercase tracking-widest">
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6 text-right">Qty</th>
                      <th className="py-4 px-6 text-right">Unit Cost (₹)</th>
                      <th className="py-4 px-6">Recorded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                    {movementRows.map((m) => (
                      <tr key={m.id} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="py-4 px-6 text-amber font-medium">{String(m.productId).slice(0, 8)}</td>
                        <td className="py-4 px-6 font-ui text-ui-sm font-bold text-dark">{m.movementType ?? "—"}</td>
                        <td className="py-4 px-6 text-right text-dark tabular-nums">{Number(m.quantity ?? 0)}</td>
                        <td className="py-4 px-6 text-right text-mid">{formatIndianNumber(Number(m.unitCost ?? 0))}</td>
                        <td className="py-4 px-6 text-mid">{m.createdAt ? String(m.createdAt).slice(0, 10) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
