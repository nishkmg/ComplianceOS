'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from '@/lib/format';

interface PostEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  onConfirm: () => void;
}

export function PostEntryDialog({
  isOpen,
  onClose,
  entry,
  onConfirm,
}: PostEntryDialogProps) {
  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-border-subtle shadow-sm rounded-sm text-left">
        <DialogHeader className="flex flex-row items-center p-6 border-b-[0.5px] border-stone-200 bg-section-muted gap-3">
          <div className="flex-shrink-0 bg-section-amber p-2 rounded-full border border-amber-200">
            <Icon name="warning" className="text-primary-container" />
          </div>
          <DialogTitle className="font-display-lg text-lg font-bold text-dark tracking-tight">Confirm Post Entry</DialogTitle>
        </DialogHeader>

        <div className="p-6 flex-grow">
          <p className="text-sm font-ui-sm text-mid mb-6 leading-relaxed">
            Posting is irreversible and will update the general ledger. Ensure all amounts are correct.
          </p>
          
          <div className="bg-section-muted border border-stone-200 rounded-sm p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b-[0.5px] border-stone-200 border-dashed">
              <span className="text-[10px] font-bold text-mid uppercase tracking-widest">Entry Number</span>
              <span className="text-sm font-medium text-dark">{entry.entryNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b-[0.5px] border-stone-200 border-dashed">
              <span className="text-[10px] font-bold text-mid uppercase tracking-widest">Posting Date</span>
              <span className="text-sm font-medium text-dark">{entry.date}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] font-bold text-dark uppercase tracking-widest">Total Amount</span>
              <span className="text-lg font-bold text-primary-container">₹ {formatIndianNumber(entry.amount)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-[11px] text-mid bg-section-muted/50 p-3 rounded-sm border border-stone-100 italic">
            <Icon name="info" className="text-[16px] text-light mt-0.5" />
            <p className="leading-tight">This entry affects multiple accounts and will be logged under fiscal period {entry.period}.</p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t-[0.5px] border-stone-200 bg-section-muted flex flex-row items-center justify-end gap-3 rounded-b-sm">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-mid bg-transparent border border-stone-300 rounded-sm hover:bg-stone-100 hover:text-dark transition-colors border-none cursor-pointer">
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2.5 bg-primary-container text-white font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-amber-hover transition-colors shadow-sm border-none cursor-pointer"
          >
            Post Entry
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
