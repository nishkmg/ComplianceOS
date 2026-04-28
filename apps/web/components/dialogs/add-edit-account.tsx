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

interface AddAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export function AddAccountDialog({
  isOpen,
  onClose,
  onConfirm,
}: AddAccountDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    parentId: '',
    type: 'asset',
    description: '',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-[0.5px] border-border-subtle rounded-sm shadow-lg">
        <DialogHeader className="px-8 py-6 border-b-[0.5px] border-border-subtle flex flex-row items-center justify-between bg-stone-50">
          <div className="text-left">
            <DialogTitle className="font-display-lg text-lg font-normal text-on-surface">Add Account</DialogTitle>
            <p className="font-ui-sm text-[13px] text-text-mid mt-1">Configure a new entry in the Chart of Accounts.</p>
          </div>
        </DialogHeader>

        <div className="px-8 py-8 flex flex-col gap-6 max-h-[70vh] overflow-y-auto text-left">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block font-ui-xs text-[10px] text-on-surface mb-2 tracking-widest uppercase font-bold">Account Name</label>
              <input 
                className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-md text-sm text-on-surface focus:outline-none focus:border-primary-container outline-none transition-all" 
                placeholder="e.g. ICICI Corporate Account"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block font-ui-xs text-[10px] text-on-surface mb-2 tracking-widest uppercase font-bold">Account Code</label>
              <input 
                className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-mono text-sm text-on-surface focus:outline-none focus:border-primary-container outline-none" 
                placeholder="1000"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-ui-xs text-[10px] text-on-surface mb-2 tracking-widest uppercase font-bold">Parent Account</label>
              <div className="relative">
                <select 
                  className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-sm text-sm text-on-surface appearance-none focus:outline-none focus:border-primary-container outline-none"
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                >
                  <option value="">None (Top Level)</option>
                  <option value="1">1000 - Assets</option>
                  <option value="2">2000 - Liabilities</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-text-mid">
                  <span className="material-symbols-outlined">expand_more</span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-ui-xs text-[10px] text-on-surface mb-2 tracking-widest uppercase font-bold">Account Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['asset', 'liability', 'equity', 'revenue'].map((t) => (
                <label key={t} className={`flex flex-col p-4 border-[0.5px] rounded-sm cursor-pointer transition-colors ${formData.type === t ? 'bg-[#fff8f4] border-amber' : 'bg-white border-border-subtle hover:bg-stone-50'}`}>
                  <input type="radio" className="sr-only" name="type" checked={formData.type === t} onChange={() => setFormData({ ...formData, type: t })} />
                  <span className="font-ui-sm font-bold text-on-surface capitalize">{t}</span>
                  <span className="font-ui-xs text-[10px] text-text-light">{t === 'asset' || t === 'expense' ? 'Debit normal' : 'Credit normal'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-stone-50 border-l-2 border-primary-container rounded-r-sm">
            <span className="material-symbols-outlined text-primary-container mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div>
              <p className="font-ui-sm text-sm font-bold text-on-surface">Account Type Immutability</p>
              <p className="font-ui-sm text-[12px] text-text-mid mt-1">Once transactions are posted to this account, its fundamental type cannot be altered to maintain ledger integrity.</p>
            </div>
          </div>

          <div>
            <label className="block font-ui-xs text-[10px] text-on-surface mb-2 tracking-widest uppercase font-bold">Description (Optional)</label>
            <textarea 
              className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-md text-sm text-on-surface focus:outline-none focus:border-primary-container outline-none resize-none" 
              placeholder="Provide context for this ledger..." 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="px-8 py-6 border-t-[0.5px] border-border-subtle bg-stone-50 flex flex-row items-center justify-end gap-4">
          <button onClick={onClose} className="font-ui-sm text-sm text-text-mid hover:text-on-surface transition-colors px-4 py-2 border-none bg-transparent cursor-pointer">Cancel</button>
          <button 
            onClick={() => onConfirm(formData)}
            className="bg-primary-container text-white font-ui-sm text-sm px-8 py-3 rounded-sm hover:bg-primary transition-all shadow-sm border-none cursor-pointer"
          >
            Create Ledger
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
