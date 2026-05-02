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
import { formatIndianNumber } from '@/lib/format';

interface PaymentAllocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  totalAmount: number;
  invoices: any[];
  onConfirm: (allocations: any) => void;
}

export function PaymentAllocationDialog({
  isOpen,
  onClose,
  customerName,
  totalAmount,
  invoices,
  onConfirm,
}: PaymentAllocationDialogProps) {
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const unallocated = totalAmount - totalAllocated;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border border-border-subtle shadow-lg rounded-sm flex flex-col max-h-[90vh]">
        <DialogHeader className="px-8 py-6 border-b border-border-subtle flex flex-row items-start justify-between bg-section-muted">
          <div className="text-left">
            <DialogTitle className="font-display-lg text-lg font-normal text-dark mb-2">Allocate Payment</DialogTitle>
            <p className="font-ui-sm text-sm text-mid">Assign recorded funds to outstanding invoices for {customerName}.</p>
          </div>
        </DialogHeader>

        <div className="px-8 py-4 bg-section-amber border-b border-border-subtle flex justify-between items-center text-left">
          <div className="flex flex-col">
            <span className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest mb-1 font-bold">Total to Allocate</span>
            <span className="font-mono text-lg text-dark font-bold">₹ {formatIndianNumber(totalAmount)}</span>
          </div>
          <div className="flex items-center gap-4">
            <Icon name="arrow_right_alt" className="text-light" />
          </div>
          <div className="flex flex-col text-right">
            <span className="font-ui-xs text-[10px] text-mid uppercase tracking-widest mb-1 font-bold">Unallocated Balance</span>
            <span className={`font-mono text-lg font-bold ${unallocated > 0 ? 'text-primary' : 'text-success'}`}>₹ {formatIndianNumber(unallocated)}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 text-left">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-ui-lg text-md font-bold text-dark">Outstanding Invoices</h3>
            <div className="flex items-center gap-2">
              <Icon name="filter_list" className="text-light text-sm" />
              <span className="font-ui-sm text-xs text-mid uppercase tracking-widest font-bold">Oldest First</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 pb-3 border-b border-border-subtle mb-4">
            <div className="col-span-1"></div>
            <div className="col-span-2 font-ui-xs text-[10px] text-light uppercase tracking-widest font-bold">Date</div>
            <div className="col-span-3 font-ui-xs text-[10px] text-light uppercase tracking-widest font-bold">Invoice #</div>
            <div className="col-span-3 font-ui-xs text-[10px] text-light uppercase tracking-widest font-bold text-right">Open Balance</div>
            <div className="col-span-3 font-ui-xs text-[10px] text-light uppercase tracking-widest font-bold text-right">Payment</div>
          </div>

          <div className="space-y-1">
            {invoices.map((inv) => (
              <div key={inv.id} className="grid grid-cols-12 gap-4 py-4 border-b border-border-subtle items-center hover:bg-section-muted transition-colors group">
                <div className="col-span-1 flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="rounded-sm border-stone-300 accent-primary w-4 h-4 cursor-pointer"
                    checked={!!allocations[inv.id]}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const amount = Math.min(inv.balance, unallocated);
                        setAllocations({ ...allocations, [inv.id]: amount });
                      } else {
                        const next = { ...allocations };
                        delete next[inv.id];
                        setAllocations(next);
                      }
                    }}
                  />
                </div>
                <div className="col-span-2 font-mono text-[12px] text-mid">{inv.date}</div>
                <div className="col-span-3 font-ui-sm text-sm text-dark font-medium">{inv.number}</div>
                <div className="col-span-3 font-mono text-[13px] text-mid text-right">₹ {formatIndianNumber(inv.balance)}</div>
                <div className="col-span-3 flex justify-end">
                  <div className="relative w-full max-w-[140px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-light">₹</span>
                    <input 
                      className="w-full bg-white border border-stone-300 rounded-sm py-2 pl-8 pr-3 font-mono text-[13px] text-right text-dark focus:border-primary outline-none" 
                      type="number"
                      value={allocations[inv.id] || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setAllocations({ ...allocations, [inv.id]: Math.min(val, inv.balance) });
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="px-8 py-6 border-t border-border-subtle bg-section-muted flex flex-row items-center justify-between">
          <button className="font-ui-sm text-xs text-mid hover:text-dark transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer font-bold uppercase tracking-widest">
            <Icon name="auto_fix_high" className="text-sm" />
            Auto-Allocate (FIFO)
          </button>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-2 border border-border-subtle text-dark font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors cursor-pointer bg-transparent">
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(allocations)}
              className="px-6 py-2 bg-primary-container text-white font-ui-sm text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-colors group border-none cursor-pointer shadow-sm"
            >
              Save Allocation
              <Icon name="arrow_forward" className="text-sm group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
