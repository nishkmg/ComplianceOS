// @ts-nocheck
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface CloseFiscalYearDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fiscalYear: string;
  onConfirm: () => void;
}

export function CloseFiscalYearDialog({
  isOpen,
  onClose,
  fiscalYear,
  onConfirm,
}: CloseFiscalYearDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border border-border-subtle shadow-2xl rounded-sm flex flex-col text-left">
        <div className="h-1 w-full bg-red-600"></div>
        <div className="p-8 border-b-[0.5px] border-border-subtle flex items-start gap-4 bg-stone-50">
          <span className="material-symbols-outlined text-red-600 text-3xl shrink-0 mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <div className="text-left">
            <DialogTitle className="font-display-lg text-lg font-bold text-on-surface mb-2">Close Fiscal Year — {fiscalYear}</DialogTitle>
            <p className="font-ui-sm text-sm text-text-mid leading-relaxed">Closing a fiscal year is an <span className="font-bold text-on-surface italic underline decoration-red-600/30 decoration-2">irreversible action</span> that freezes all ledger entries for the period.</p>
          </div>
        </div>

        <div className="p-8 space-y-8 text-left bg-white">
          <div>
             <h3 className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest font-bold mb-4">Finalization Checklist</h3>
             <ul className="space-y-4 font-ui-sm text-[13px] text-on-surface-variant list-none p-0">
               <li className="flex items-start gap-3">
                 <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                 <span>All 2,481 journal entries have been posted or cleared.</span>
               </li>
               <li className="flex items-start gap-3">
                 <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                 <span>GSTR-1, 2B, and 3B reconciliations are finalized for all 12 months.</span>
               </li>
               <li className="flex items-start gap-3">
                 <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                 <span>Inventory valuation (FIFO) has been computed and audited.</span>
               </li>
             </ul>
          </div>

          <div className="bg-red-50 p-6 border border-red-100">
             <p className="font-ui-sm text-sm text-red-800 leading-relaxed font-medium">By proceeding, you acknowledge that no further entries or modifications can be made to this period. All opening balances for the next period will be automatically initialized.</p>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 border-t border-border-subtle bg-stone-50 flex flex-row items-center justify-end gap-4 rounded-b-sm">
          <button onClick={onClose} className="font-ui-sm text-xs font-bold uppercase tracking-widest text-text-mid hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer">Cancel</button>
          <button 
            onClick={onConfirm}
            className="bg-red-600 text-white font-ui-sm text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-red-700 transition-all shadow-sm border-none cursor-pointer"
          >
            I Understand, Close Year
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
