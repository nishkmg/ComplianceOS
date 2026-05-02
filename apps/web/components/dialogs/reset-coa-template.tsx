'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';

interface ResetCoaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetCoaDialog({
  isOpen,
  onClose,
  onConfirm,
}: ResetCoaDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border border-border-subtle shadow-xl flex flex-col items-center text-center rounded-sm">
        <div className="p-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-danger-bg text-danger flex items-center justify-center mb-6">
            <Icon name="warning" className="text-4xl" />
          </div>
          
          <DialogTitle className="font-display text-lg font-bold text-dark mb-3">Reset to Template?</DialogTitle>
          
          <p className="font-ui text-sm text-mid leading-relaxed mb-8">
            Are you sure you want to reset to the template? All your customizations to the Chart of Accounts will be lost.
          </p>
          
          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={onConfirm}
              className="w-full bg-red-600 text-white font-label font-medium text-sm py-3 rounded-sm transition-opacity hover:opacity-90 border-none cursor-pointer font-bold uppercase tracking-widest"
            >
              Reset to Template
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-transparent border border-border-subtle text-dark-variant font-label font-medium text-sm py-3 rounded-sm transition-colors hover:bg-section-muted border-none cursor-pointer font-bold uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
