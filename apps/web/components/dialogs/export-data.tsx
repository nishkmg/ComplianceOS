'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ExportDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: any) => void;
}

export function ExportDataDialog({
  isOpen,
  onClose,
  onExport,
}: ExportDataDialogProps) {
  const [fiscalYear, setFiscalYear] = useState('2024-25');
  const [format, setFormat] = useState('xlsx');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border border-border-subtle rounded-sm shadow-lg">
        <DialogHeader className="px-8 py-6 border-b-[0.5px] border-border-subtle flex flex-row items-start justify-between bg-section-muted">
          <div className="text-left">
            <DialogTitle className="font-display-lg text-lg font-normal text-dark mb-1">Export Data</DialogTitle>
            <p className="font-ui-sm text-sm text-mid">Generate ledgers and compliance reports for offline review.</p>
          </div>
        </DialogHeader>

        <div className="p-8 flex flex-col gap-8 bg-white overflow-y-auto max-h-[70vh] text-left">
          {/* Section: FY */}
          <div className="flex flex-col gap-4">
            <label className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest font-bold">Select Period</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <select 
                  className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-sm text-sm text-dark appearance-none focus:outline-none focus:border-primary outline-none"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                >
                  <option value="2024-25">FY 2024-25</option>
                  <option value="2023-24">FY 2023-24</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-mid">
                  <Icon name="expand_more" />
                </span>
              </div>
            </div>
          </div>

          <hr className="border-t-[0.5px] border-border-subtle m-0" />

          {/* Section: Modules */}
          <div className="flex flex-col gap-4">
            <label className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest font-bold">Select Modules</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['General Ledger', 'GST Data', 'Employee Records', 'ITR Computation'].map((m) => (
                <label key={m} className="flex items-start gap-3 p-4 border border-border-subtle rounded-sm hover:bg-section-muted cursor-pointer transition-colors has-[:checked]:border-primary-container has-[:checked]:bg-section-amber">
                  <input type="checkbox" className="mt-1 accent-primary" defaultChecked={m === 'General Ledger'} />
                  <div className="flex flex-col">
                    <span className="font-ui-sm font-bold text-dark">{m}</span>
                    <span className="font-ui-xs text-[11px] text-mid">Full historical logs and balance summaries.</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-t-[0.5px] border-border-subtle m-0" />

          {/* Section: Format */}
          <div className="flex flex-col gap-4">
            <label className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest font-bold">Export Format</label>
            <div className="flex gap-4">
              {[
                { id: 'xlsx', name: 'Excel (.xlsx)', icon: 'table' },
                { id: 'pdf', name: 'PDF Document', icon: 'description' },
              ].map((f) => (
                <label key={f.id} className="cursor-pointer flex-1">
                  <input type="radio" className="sr-only peer" name="format" checked={format === f.id} onChange={() => setFormat(f.id)} />
                  <div className="border border-border-subtle rounded-sm p-4 text-center peer-checked:border-primary-container peer-checked:bg-section-amber hover:bg-section-muted transition-colors flex flex-col items-center gap-2">
                    <Icon name={f.icon} className="text-mid ${format === f.id ? 'text-primary-container' : ''}" />
                    <span className={`font-ui-sm text-xs ${format === f.id ? 'font-bold' : ''}`}>{f.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 border-t-[0.5px] border-border-subtle bg-section-muted flex flex-row items-center justify-end gap-4">
          <button onClick={onClose} className="font-ui-sm text-sm text-mid hover:text-dark transition-colors px-4 py-2 border-none bg-transparent cursor-pointer">Cancel</button>
          <button 
            onClick={() => onExport({ fiscalYear, format })}
            className="bg-primary-container text-white font-ui-sm text-sm px-8 py-3 rounded-sm hover:bg-primary transition-all shadow-sm border-none cursor-pointer flex items-center gap-2"
          >
            <Icon name="download" className="text-sm" />
            Generate Report
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
