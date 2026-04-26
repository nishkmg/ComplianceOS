// @ts-nocheck
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ExportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onExport: (format: string, dateRange: { from: string; to: string }) => void;
}

export function ExportDataDialog({
  open,
  onOpenChange,
  title = "Export Data",
  onExport,
}: ExportDataDialogProps) {
  const [format, setFormat] = useState("csv");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  if (!open) return null;

  const handleExport = () => {
    onExport(format, { from: dateFrom, to: dateTo });
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
        <h2 className="font-display text-[18px] font-normal text-dark">{title}</h2>

        <div className="space-y-3">
          <div>
            <label className="block font-ui text-[12px] text-light mb-1">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="input-field w-full font-ui">
              <option value="csv">CSV</option>
              <option value="xlsx">Excel (XLSX)</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-ui text-[12px] text-light mb-1">From Date</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field w-full font-ui" />
            </div>
            <div>
              <label className="block font-ui text-[12px] text-light mb-1">To Date</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field w-full font-ui" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleExport}>Export</Button>
        </div>
      </div>
    </div>
  );
}
