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

interface CriticalActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText: string;
  consequences: string[];
  onConfirm: () => void;
}

export function CriticalActionDialog({
  isOpen,
  onClose,
  title,
  description,
  confirmText,
  consequences,
  onConfirm,
}: CriticalActionDialogProps) {
  const [inputValue, setInputValue] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-8 overflow-hidden border-[0.5px] border-border-subtle rounded-sm shadow-lg text-left">
        <DialogHeader className="mb-8">
          <div className="flex flex-col gap-2">
            <DialogTitle className="font-display-lg text-2xl text-red-600 font-bold">{title}</DialogTitle>
            <p className="font-ui-md text-sm text-text-mid leading-relaxed">{description}</p>
          </div>
        </DialogHeader>

        <div className="bg-stone-50 border-[0.5px] border-border-subtle p-6 mb-10 rounded-sm">
          <h3 className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest mb-4 font-bold">Consequences of Action</h3>
          <ul className="space-y-3 font-ui-sm text-[13px] text-on-surface-variant list-none p-0">
            {consequences.map((c, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-text-mid text-[18px] mt-0.5">remove</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-12">
          <label className="block font-ui-xs text-[10px] text-on-surface mb-2 uppercase tracking-widest font-bold">
            Type <span className="font-mono text-red-600 bg-red-50 px-1 py-0.5">{confirmText}</span> to confirm
          </label>
          <input 
            autoComplete="off" 
            className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-mono text-lg text-on-surface uppercase tracking-widest focus:border-red-600 outline-none" 
            placeholder={`Type ${confirmText} here...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
          />
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row justify-end gap-4 border-t border-border-subtle pt-6">
          <button onClick={onClose} className="px-6 py-3 font-ui-sm text-sm text-text-mid hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer">
            Cancel Operation
          </button>
          <button 
            onClick={onConfirm}
            disabled={inputValue !== confirmText}
            className="bg-red-600 text-white font-ui-sm text-sm px-8 py-3 rounded-sm hover:bg-red-700 transition-colors shadow-sm border-none cursor-pointer disabled:opacity-30"
          >
            Confirm & Proceed
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
