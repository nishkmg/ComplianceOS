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
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 space-y-4">
        <h2 className="font-display text-[18px] font-normal text-dark">{title}</h2>
        <p className="font-ui text-[13px] text-light">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
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
