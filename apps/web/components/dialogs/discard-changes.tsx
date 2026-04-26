// @ts-nocheck
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DiscardChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  message?: string;
}

export function DiscardChangesDialog({
  open,
  onOpenChange,
  onDiscard,
  message = "You have unsaved changes. Are you sure you want to discard them?",
}: DiscardChangesDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 space-y-4">
        <h2 className="font-display text-[18px] font-normal text-dark">Discard Changes?</h2>
        <p className="font-ui text-[13px] text-light">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Keep Editing</Button>
          <Button onClick={() => { onDiscard(); onOpenChange(false); }} className="bg-danger hover:bg-danger/90">
            Discard
          </Button>
        </div>
      </div>
    </div>
  );
}
