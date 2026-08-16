"use client";

import { Button } from "@/components/ui/button";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
}: ConfirmActionDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative bg-surface rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 space-y-4">
        <h2 className="font-ui text-ui-lg font-semibold text-dark">{title}</h2>
        <p className="font-ui text-ui-sm text-light">{message}</p>
        <div className="flex items-center justify-end gap-3 border-t border-border-subtle bg-section-muted px-6 py-4 rounded-b-sm">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{cancelLabel}</Button>
          <Button
            onClick={() => { onConfirm(); onOpenChange(false); }}
            className={variant === "danger" ? "bg-danger hover:bg-danger/90" : ""}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
