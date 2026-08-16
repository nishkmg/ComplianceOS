'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface AmendGstReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export function AmendGstReturnDialog({
  isOpen,
  onClose,
  onConfirm,
}: AmendGstReturnDialogProps) {
  const [jsonData, setJsonData] = useState(`{
  "gstin": "27AADCB2230M1Z2",
  "fp": "072023",
  "gt": 15000000,
  "cur_gt": 2500000,
  "b2b": [{ "ctin": "06BZBPM8991P1ZV", "inv": [{ "inum": "INV-23-441", "idt": "15-07-2023", "val": 45000.50 }] }]
}`);
  const [error, setError] = useState('');

  const handleUpdate = () => {
    try {
      JSON.parse(jsonData);
      setError('');
      onConfirm(JSON.parse(jsonData));
    } catch {
      setError('Invalid JSON format. Please check the payload structure.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border border-border-subtle shadow-lg rounded-sm flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border-subtle flex flex-row items-center justify-between bg-section-muted">
          <div className="text-left">
            <DialogTitle className="font-ui text-ui-lg font-semibold text-dark mb-1">Amend GST Return</DialogTitle>
            <p className="font-ui text-sm text-mid">Modify previously filed return data for FY 23-24 Q2.</p>
          </div>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-y-auto text-left">
          <label className="block font-ui text-ui-2xs text-amber uppercase tracking-widest mb-2 font-bold">Amendment Data (JSON)</label>
          <div className="border border-border-subtle rounded-sm relative bg-surface">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-section-muted">
              <span className="font-mono text-ui-xs text-mid">return_payload.json</span>
              <div className="flex gap-2">
                <button className="text-mid hover:text-primary transition-colors border-none bg-transparent cursor-pointer">
                  <Icon name="content_copy" className="text-ui-lg" />
                </button>
              </div>
            </div>
            <textarea 
              className="w-full p-4 font-mono text-sm text-dark bg-transparent border-none focus:ring-0 resize-y outline-none focus-visible:ring-2 focus-visible:ring-focus block" 
              rows={14} 
              spellCheck="false"
              value={jsonData}
              onChange={e => setJsonData(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="mt-4 p-4 border border-danger/20 bg-danger-bg rounded-sm">
              <div className="flex items-start gap-3">
                <Icon name="error" className="text-danger text-sm" />
                <p className="font-ui text-ui-xs text-danger-deep leading-relaxed">{error}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end gap-3 border-t border-border-subtle bg-section-muted px-6 py-4 rounded-b-sm">
          <button onClick={onClose} className="font-ui text-sm text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer">Cancel</button>
          <button 
            onClick={handleUpdate}
            className="bg-amber text-white dark:text-amber-ink px-8 py-3 font-ui text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-amber-hover transition-colors border-none shadow-sm cursor-pointer flex items-center gap-2"
          >
            Update Return <Icon name="arrow_forward" className="text-sm" />
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
