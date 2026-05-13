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
      <DialogContent className="max-w-2xl p-0 overflow-hidden border border-border-subtle rounded-sm shadow-lg">
        <DialogHeader className="px-8 py-6 border-b-[0.5px] border-border-subtle flex flex-row items-center justify-between bg-section-muted">
          <div className="text-left">
            <DialogTitle className="font-display text-lg font-normal text-dark">Add Account</DialogTitle>
            <p className="font-ui text-[13px] text-mid mt-1">Configure a new entry in the Chart of Accounts.</p>
          </div>
        </DialogHeader>

        <div className="px-8 py-8 flex flex-col gap-6 max-h-[70vh] overflow-y-auto text-left">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block font-ui text-[10px] text-dark mb-2 tracking-widest uppercase font-bold">Account Name</label>
              <input 
                className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui text-sm text-dark focus:outline-none focus:border-amber outline-none transition-all" 
                placeholder="e.g. ICICI Corporate Account"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block font-ui text-[10px] text-dark mb-2 tracking-widest uppercase font-bold">Account Code</label>
              <input 
                className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-mono text-sm text-dark focus:outline-none focus:border-amber outline-none" 
                placeholder="1000"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-ui text-[10px] text-dark mb-2 tracking-widest uppercase font-bold">Parent Account</label>
              <div className="relative">
                <select 
                  className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui text-sm text-dark appearance-none focus:outline-none focus:border-amber outline-none"
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                >
                  <option value="">None (Top Level)</option>
                  <option value="1">1000 - Assets</option>
                  <option value="2">2000 - Liabilities</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-mid">
                  <Icon name="expand_more" />
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-ui text-[10px] text-dark mb-2 tracking-widest uppercase font-bold">Account Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['asset', 'liability', 'equity', 'revenue'].map((t) => (
                <label key={t} className={`flex flex-col p-4 border rounded-sm cursor-pointer transition-colors ${formData.type === t ? 'bg-section-amber border-amber' : 'bg-white border-border-subtle hover:bg-section-muted'}`}>
                  <input type="radio" className="sr-only" name="type" checked={formData.type === t} onChange={() => setFormData({ ...formData, type: t })} />
                  <span className="font-ui font-bold text-dark capitalize">{t}</span>
                  <span className="font-ui text-[10px] text-light">{t === 'asset' || t === 'expense' ? 'Debit normal' : 'Credit normal'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-section-muted border-l-2 border-amber rounded-r-sm">
            <Icon name="warning" className="text-amber mt-0.5" />
            <div>
              <p className="font-ui text-sm font-bold text-dark">Account Type Immutability</p>
              <p className="font-ui text-[12px] text-mid mt-1">Once transactions are posted to this account, its fundamental type cannot be altered to maintain ledger integrity.</p>
            </div>
          </div>

          <div>
            <label className="block font-ui text-[10px] text-dark mb-2 tracking-widest uppercase font-bold">Description (Optional)</label>
            <textarea 
              className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui text-sm text-dark focus:outline-none focus:border-amber outline-none resize-none" 
              placeholder="Provide context for this ledger..." 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="px-8 py-6 border-t-[0.5px] border-border-subtle bg-section-muted flex flex-row items-center justify-end gap-4">
          <button onClick={onClose} className="font-ui text-sm text-mid hover:text-dark transition-colors px-4 py-2 border-none bg-transparent cursor-pointer">Cancel</button>
          <button 
            onClick={() => onConfirm(formData)}
            className="bg-amber text-white font-ui text-sm px-8 py-3 rounded-sm hover:bg-amber-hover transition-all shadow-sm border-none cursor-pointer"
          >
            Create Ledger
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
