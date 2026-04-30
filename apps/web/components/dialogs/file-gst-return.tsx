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

interface FileGstReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  returnType: string;
  period: string;
  onConfirm: (arn: string, date: string) => void;
}

export function FileGstReturnDialog({
  isOpen,
  onClose,
  returnType,
  period,
  onConfirm,
}: FileGstReturnDialogProps) {
  const [arn, setArn] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-[0.5px] border-border-subtle rounded-lg shadow-sm">
        <DialogHeader className="px-6 py-5 border-b-[0.5px] border-border-subtle flex flex-row items-center justify-between">
          <DialogTitle className="font-ui-lg text-lg font-normal text-on-surface">
            File {returnType} — {period}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 text-left">
          <div className="space-y-2">
            <label className="block font-ui-xs text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              ARN (Acknowledgement Reference Number)
            </label>
            <div className="relative">
              <input
                className="w-full bg-stone-50 border-[0.5px] border-border-subtle rounded-sm px-4 py-3 font-mono text-sm text-on-surface placeholder:text-text-light outline-none focus:border-primary transition-shadow"
                placeholder="Enter 15-digit ARN"
                value={arn}
                onChange={(e) => setArn(e.target.value.toUpperCase())}
                maxLength={15}
              />
              <Icon name="numbers" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light" />
            </div>
            <p className="font-ui-xs text-[11px] text-text-light mt-1 italic">Found on your GST portal acknowledgement receipt.</p>
          </div>

          <div className="space-y-2">
            <label className="block font-ui-xs text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              Filing Date
            </label>
            <div className="relative">
              <input
                className="w-full bg-stone-50 border-[0.5px] border-border-subtle rounded-sm px-4 py-3 font-mono text-sm text-on-surface outline-none focus:border-primary transition-shadow"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Icon name="calendar_today" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-5 bg-stone-50 border-t-[0.5px] border-border-subtle flex flex-row items-center justify-end gap-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="font-ui-sm text-sm text-text-mid hover:text-on-surface transition-colors px-4 py-2 border-none bg-transparent cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(arn, date)}
            className="bg-primary-container text-white font-ui-sm text-sm px-6 py-3 flex items-center gap-2 rounded-sm hover:bg-primary transition-opacity shadow-sm group border-none cursor-pointer"
          >
            <span>Commit to Ledger</span>
            <Icon name="arrow_forward" className="text-sm group-hover:translate-x-1 transition-transform" />
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
