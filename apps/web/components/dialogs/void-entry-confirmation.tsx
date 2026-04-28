// @ts-nocheck
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface VoidEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entryNumber: string;
  onConfirm: (reason: string) => void;
}

export function VoidEntryDialog({
  isOpen,
  onClose,
  entryNumber,
  onConfirm,
}: VoidEntryDialogProps) {
  const [reason, setReason] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 overflow-hidden border border-border-subtle shadow-sm rounded-sm">
        <DialogHeader className="flex flex-row items-start justify-between mb-6">
          <div className="text-left">
            <DialogTitle className="font-display-lg text-lg font-normal text-on-surface mb-1">Void Journal Entry</DialogTitle>
            <p className="font-ui-sm text-sm text-text-mid">Entry #{entryNumber}</p>
          </div>
        </DialogHeader>

        <div className="bg-red-50 text-red-800 p-4 mb-6 border border-red-100 flex gap-3 text-left">
          <span className="material-symbols-outlined text-red-600 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <p className="font-ui-sm text-[13px] leading-relaxed">This action cannot be undone. Voiding this entry will reverse its financial impact across all associated ledgers.</p>
        </div>

        <div className="mb-6 text-left">
          <label className="block font-ui-xs text-[10px] text-on-surface uppercase tracking-widest mb-2 font-bold" htmlFor="reason">Reason for Voiding</label>
          <textarea 
            className="w-full bg-stone-50 border border-border-subtle font-ui-sm text-sm p-3 focus:outline-none focus:border-primary outline-none resize-none placeholder:text-text-light" 
            id="reason" 
            minlength={10} 
            placeholder="Enter a detailed reason (minimum 10 characters)..." 
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-4">
          <button onClick={onClose} className="font-ui-sm text-sm text-text-mid hover:text-on-surface transition-colors px-4 py-2 border-none bg-transparent cursor-pointer">Cancel</button>
          <button 
            onClick={() => onConfirm(reason)}
            disabled={reason.length < 10}
            className="bg-red-600 text-white font-ui-sm text-sm px-6 py-2 border border-red-600 hover:bg-red-700 transition-colors flex items-center gap-2 group cursor-pointer disabled:opacity-30"
          >
            Confirm Void
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
