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

interface DeleteEntityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  onConfirm: () => void;
}

export function DeleteEntityDialog({
  isOpen,
  onClose,
  entityName,
  onConfirm,
}: DeleteEntityDialogProps) {
  const [input, setInput] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border border-border-subtle shadow-xl flex flex-col relative text-left">
        <div className="h-[2px] w-full bg-red-600 absolute top-0 left-0"></div>
        
        <div className="p-10 flex flex-col gap-6">
          <DialogHeader className="flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 bg-red-50 text-red-600 flex items-center justify-center rounded-sm">
              <Icon name="warning" />
            </div>
            <div>
              <DialogTitle className="font-display-lg text-lg font-bold text-on-surface mb-2">Delete Entity</DialogTitle>
              <p className="font-ui-sm text-sm text-text-mid leading-relaxed">
                You are about to delete <strong className="text-on-surface">{entityName}</strong> and all associated records. This action is irreversible.
              </p>
            </div>
          </DialogHeader>

          <div className="bg-stone-50 border border-red-200/30 p-6 pl-10 rounded-sm">
            <ul className="list-disc text-red-600 font-ui-sm text-sm flex flex-col gap-3">
              <li>Permanent erasure of all voucher entries for this entity.</li>
              <li>Invalidation of attached GST reconciliation reports.</li>
              <li>Removal of all associated audit trails for this period.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <label className="font-ui-xs text-[10px] uppercase tracking-widest text-text-mid font-bold" htmlFor="delete-confirmation">
              To verify, type <span className="font-mono font-bold text-on-surface bg-stone-100 px-2 py-1 border border-border-subtle">DELETE</span> below:
            </label>
            <input 
              autoComplete="off" 
              className="w-full bg-white border border-border-subtle font-mono text-sm text-on-surface px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors rounded-sm" 
              id="delete-confirmation" 
              placeholder="Type here..." 
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="bg-stone-50 px-10 py-6 border-t-[0.5px] border-border-subtle flex flex-row items-center justify-end gap-4">
          <button onClick={onClose} className="font-ui-sm text-sm text-text-mid hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer">Cancel</button>
          <button 
            onClick={onConfirm}
            disabled={input !== 'DELETE'}
            className="bg-red-600 text-white px-8 py-3 font-ui-sm text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-red-700 transition-all border-none shadow-sm cursor-pointer disabled:opacity-30"
          >
            Permanently Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
