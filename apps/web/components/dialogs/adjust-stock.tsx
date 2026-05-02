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

interface AdjustStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onConfirm: (data: any) => void;
}

export function AdjustStockDialog({
  isOpen,
  onClose,
  product,
  onConfirm,
}: AdjustStockDialogProps) {
  const [formData, setFormData] = useState({
    quantity: 0,
    warehouse: 'Main Depot',
    reason: 'correction',
    notes: '',
  });

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border border-border-subtle shadow-2xl rounded-sm flex flex-col text-left">
        <DialogHeader className="px-8 pt-8 pb-6 border-b-[0.5px] border-border-subtle flex flex-row items-start justify-between">
          <div className="text-left">
            <DialogTitle className="font-display-lg text-lg font-bold text-dark">Adjust Stock</DialogTitle>
            <p className="font-ui-sm text-sm text-mid">Record inventory corrections or shrinkage.</p>
          </div>
        </DialogHeader>

        <div className="p-8 flex flex-col gap-8">
          <div className="bg-section-muted border border-border-subtle p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="text-left">
                <div className="font-ui-sm font-bold text-dark">{product.name}</div>
                <div className="font-mono text-[11px] text-light mt-0.5 uppercase tracking-wider">SKU: {product.sku}</div>
              </div>
              <div className="text-right">
                <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold mb-1">Current Stock</label>
                <div className="font-mono text-lg text-dark font-bold">{product.available?.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 text-left">
            <div className="flex gap-6">
              <div className="flex-1">
                <label className="block font-ui-xs text-[10px] text-amber-text uppercase tracking-widest font-bold mb-2">Adjustment Qty (+/-)</label>
                <div className="relative flex items-center border border-stone-300 bg-white focus-within:border-primary-container h-12 rounded-sm">
                  <Icon name="calculate" className="text-light pl-4 pr-2 text-[20px]" />
                  <input 
                    className="w-full bg-transparent border-none p-0 font-mono text-sm text-dark focus:ring-0 outline-none" 
                    type="number" 
                    placeholder="0.00"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold mb-2">Warehouse</label>
                <div className="relative h-12">
                  <select 
                    className="w-full h-full bg-white border border-stone-300 rounded-sm px-4 py-2 font-ui-sm text-sm text-dark appearance-none focus:border-primary outline-none"
                    value={formData.warehouse}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  >
                    <option>Main Depot</option>
                    <option>Unit 2 (Pune)</option>
                  </select>
                  <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-mid" />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold mb-2">Reason Code</label>
              <div className="relative h-12">
                <select 
                  className="w-full h-full bg-white border border-stone-300 rounded-sm px-4 py-2 font-ui-sm text-sm text-dark appearance-none focus:border-primary outline-none"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                >
                  <option value="correction">Physical Count Correction</option>
                  <option value="shrinkage">Shrinkage / Damage</option>
                  <option value="return">Customer Return</option>
                </select>
                <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-mid" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 border-t border-border-subtle bg-section-muted flex flex-row items-center justify-end gap-4 rounded-b-sm">
          <button onClick={onClose} className="font-ui-sm text-xs font-bold uppercase tracking-widest text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer">Cancel</button>
          <button 
            onClick={() => onConfirm(formData)}
            className="bg-primary-container text-white font-ui-sm text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-primary transition-all shadow-sm border-none cursor-pointer"
          >
            Apply Adjustment
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
