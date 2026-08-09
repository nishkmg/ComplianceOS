"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const confirmStyles = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber hover:bg-amber-hover text-white",
    default: "bg-amber hover:bg-amber-hover text-white",
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      className="backdrop:bg-black/50 rounded-lg border border-border shadow-lg p-0 max-w-md w-full"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 ${variant === "danger" ? "text-red-600" : variant === "warning" ? "text-amber" : "text-amber"}`}>
            <Icon name={variant === "danger" ? "warning" : "info"} className="text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-ui text-[15px] font-bold text-on-surface mb-2">{title}</h3>
            <p className="font-ui text-ui-sm text-text-mid leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted rounded-b-lg">
        <button
          onClick={onCancel}
          className="font-ui text-ui-sm text-text-mid hover:text-on-surface transition-colors py-2 px-4 border-none bg-transparent cursor-pointer"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={`font-ui text-ui-sm font-bold py-2 px-6 rounded-md transition-colors border-none cursor-pointer ${confirmStyles[variant]}`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
