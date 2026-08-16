'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';

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
        <div className="h-1 w-full bg-danger"></div>
        <div className="p-8 border-b-[0.5px] border-border-subtle flex items-start gap-4 bg-section-muted">
          <Icon name="warning" className="text-danger text-3xl shrink-0 mt-1" />
          <div className="text-left">
            <DialogTitle className="font-ui text-ui-lg font-semibold text-dark mb-2">Close Fiscal Year — {fiscalYear}</DialogTitle>
            <p className="font-ui text-sm text-mid leading-relaxed">Closing a fiscal year is an <span className="font-bold text-dark italic underline decoration-danger/30 decoration-2">irreversible action</span> that freezes all ledger entries for the period.</p>
          </div>
        </div>

        <div className="p-8 space-y-8 text-left bg-surface">
          <div>
             <h3 className="font-ui text-ui-2xs text-amber uppercase tracking-widest font-bold mb-4">What Closing Does</h3>
             <ul className="space-y-4 font-ui text-ui-sm text-dark-variant list-none p-0">
               <li className="flex items-start gap-3">
                 <Icon name="check_circle" className="text-success text-ui-xl" />
                 <span>A snapshot of the ledger is taken at close, preserving every posted entry for the period.</span>
               </li>
               <li className="flex items-start gap-3">
                 <Icon name="check_circle" className="text-success text-ui-xl" />
                 <span>GSTR-1, 2B, and 3B returns for the period are locked; post-close entries are routed to the next financial year.</span>
               </li>
               <li className="flex items-start gap-3">
                 <Icon name="check_circle" className="text-success text-ui-xl" />
                 <span>Inventory valuation (FIFO) is frozen at the closing values.</span>
               </li>
             </ul>
          </div>

          <div className="bg-danger-bg p-6 border border-danger/20">
             <p className="font-ui text-sm text-danger-deep leading-relaxed font-medium">By proceeding, you acknowledge that no further entries or modifications can be made to this period. All opening balances for the next period will be automatically initialized.</p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-3 border-t border-border-subtle bg-section-muted px-6 py-4 rounded-b-sm">
          <button onClick={onClose} className="font-ui text-xs font-bold uppercase tracking-widest text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer">Cancel</button>
          <button 
            onClick={onConfirm}
            className="bg-danger text-white font-ui text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-danger/90 transition-colors shadow-sm border-none cursor-pointer"
          >
            I Understand, Close Year
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
