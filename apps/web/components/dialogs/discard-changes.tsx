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
        <div className="h-1 w-full bg-amber"></div>
        <div className="p-6">
          <div className="flex items-start mb-4 text-left">
            <div className="flex-shrink-0 mr-4">
              <Icon name="warning" className="text-amber" size={32} />
            </div>
            <div>
              <h3 className="font-ui text-ui-lg font-semibold text-dark">
                Discard unsaved changes?
              </h3>
            </div>
          </div>
          
          <div className="ml-12 mb-6 text-left">
            <p className="text-sm text-mid leading-relaxed">
              Any information you entered will be lost. This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="flex items-center justify-end gap-3 border-t border-border-subtle bg-section-muted px-6 py-4 rounded-b-sm">
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-semibold text-dark bg-transparent border border-border rounded-sm hover:bg-lighter transition-colors cursor-pointer"
            >
              Discard Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-white bg-amber rounded-sm hover:bg-amber-hover transition-colors shadow-sm border-none cursor-pointer"
            >
              Keep Editing
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
