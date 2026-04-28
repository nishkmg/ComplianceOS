// @ts-nocheck
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface DiscardChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DiscardChangesDialog({
  isOpen,
  onClose,
  onConfirm,
}: DiscardChangesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-[0.5px] border-border-subtle rounded-sm shadow-2xl bg-[#F9F7F2]">
        <div className="h-1 w-full bg-[#C8860A]"></div>
        <div className="p-6">
          <div className="flex items-start mb-4 text-left">
            <div className="flex-shrink-0 mr-4">
              <span className="material-symbols-outlined text-[#C8860A] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 leading-tight">
                Discard unsaved changes?
              </h3>
            </div>
          </div>
          
          <div className="ml-12 mb-6 text-left">
            <p className="text-sm text-stone-600 leading-relaxed">
              Any information you entered will be lost. This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-3 mt-4 pt-4 border-t-[0.5px] border-stone-200">
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-semibold text-stone-700 bg-transparent border border-stone-300 rounded-sm hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Discard Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#C8860A] rounded-sm hover:bg-[#9A6605] transition-colors shadow-sm border-none cursor-pointer"
            >
              Keep Editing
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
