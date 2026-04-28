// @ts-nocheck
'use client';

import { useState } from 'react';
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
        <DialogHeader className="px-6 py-4 border-b border-border-subtle flex flex-row items-center justify-between bg-stone-50">
          <div className="text-left">
            <DialogTitle className="font-display-lg text-lg font-normal text-on-surface mb-1">Amend GST Return</DialogTitle>
            <p className="font-ui-sm text-sm text-text-mid">Modify previously filed return data for FY 23-24 Q2.</p>
          </div>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-y-auto text-left">
          <label className="block font-ui-xs text-[10px] text-amber-text uppercase tracking-widest mb-2 font-bold">Amendment Data (JSON)</label>
          <div className="border border-border-subtle rounded-sm relative bg-white">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-stone-50">
              <span className="font-mono text-[12px] text-text-mid">return_payload.json</span>
              <div className="flex gap-2">
                <button className="text-text-mid hover:text-primary transition-colors border-none bg-transparent cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
              </div>
            </div>
            <textarea 
              className="w-full p-4 font-mono text-sm text-on-surface bg-transparent border-none focus:ring-0 resize-y outline-none block" 
              rows={14} 
              spellCheck="false"
              value={jsonData}
              onChange={e => setJsonData(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="mt-4 p-4 border border-red-100 bg-red-50 rounded-sm">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600 text-sm">error</span>
                <p className="font-ui-xs text-[12px] text-red-800 leading-relaxed">{error}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border-subtle bg-stone-50 flex flex-row items-center justify-between rounded-b-sm">
          <button onClick={onClose} className="font-ui-sm text-sm text-text-mid hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer">Cancel</button>
          <button 
            onClick={handleUpdate}
            className="bg-primary-container text-white px-8 py-3 font-ui-sm text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-primary transition-all border-none shadow-sm cursor-pointer flex items-center gap-2"
          >
            Update Return <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
