'use client';

import { Icon } from '@/components/ui/icon';

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
      <DialogContent className="max-w-sm p-0 overflow-hidden border border-border-subtle rounded-sm shadow-2xl bg-section-muted">
        <div className="h-1 w-full bg-primary-container"></div>
        <div className="p-6">
          <div className="flex items-start mb-4 text-left">
            <div className="flex-shrink-0 mr-4">
              <Icon name="warning" className="text-primary-container" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dark leading-tight">
                Discard unsaved changes?
              </h3>
            </div>
          </div>
          
          <div className="ml-12 mb-6 text-left">
            <p className="text-sm text-mid leading-relaxed">
              Any information you entered will be lost. This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-3 mt-4 pt-4 border-t-[0.5px] border-stone-200">
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-semibold text-dark bg-transparent border border-stone-300 rounded-sm hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Discard Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-container rounded-sm hover:bg-primary transition-colors shadow-sm border-none cursor-pointer"
            >
              Keep Editing
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
