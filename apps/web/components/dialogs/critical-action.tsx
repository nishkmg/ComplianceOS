// @ts-nocheck
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CriticalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionLabel: string;
  risk?: "high" | "critical";
  confirmText?: string;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export function CriticalActionDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  risk = "high",
  confirmText,
  onConfirm,
  children,
}: CriticalActionDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const isCritical = risk === "critical" && !!confirmText;
  const canConfirm = !isCritical || inputValue === confirmText;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
        <h2 className="font-display text-[18px] font-normal text-dark">{title}</h2>
        <p className="font-ui text-[13px] text-light">{description}</p>

        {children}

        {isCritical && (
          <div>
            <label className="block font-ui text-[12px] text-light mb-2">
              Type "<span className="font-mono font-medium text-dark">{confirmText}</span>" to confirm:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="input-field w-full font-ui"
              placeholder={`Type "${confirmText}"`}
              autoFocus
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => { onConfirm(); onOpenChange(false); setInputValue(""); }}
            disabled={!canConfirm}
            className={risk === "critical" ? "bg-danger hover:bg-danger/90" : ""}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
