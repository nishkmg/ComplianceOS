'use client';

import { formatIndianNumber } from '@/lib/format';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';

interface AccountPreviewSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  account: any;
}

export function AccountPreviewSlideOver({
  isOpen,
  onClose,
  account,
}: AccountPreviewSlideOverProps) {
  if (!isOpen || !account) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-on-background/20 backdrop-blur-sm z-[60] transition-opacity" onClick={onClose}></div>
      
      {/* Slide-over Panel */}
      <aside className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-[70] flex flex-col border-l border-border-subtle transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <header className="px-8 py-6 border-b border-border-subtle flex justify-between items-start bg-section-muted">
          <div className="text-left">
            <span className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest font-bold mb-1 block">Account Quick View</span>
            <h2 className="font-display-lg text-lg font-bold text-dark">{account.name}</h2>
            <p className="font-mono text-[11px] text-light uppercase tracking-wider mt-1">{account.code} · {account.kind}</p>
          </div>
          <button onClick={onClose} className="text-light hover:text-dark transition-colors cursor-pointer border-none bg-transparent">
            <Icon name="close" className="text-2xl" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 text-left">
          {/* Quick Metrics */}
          <section className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-section-muted border border-border-subtle rounded-sm">
              <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-3">Current Balance</p>
              <p className="font-mono text-xl font-bold text-dark">₹ {formatIndianNumber(account.balance || 0)}</p>
            </div>
            <div className="p-6 bg-section-muted border border-border-subtle rounded-sm">
              <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-3">Pending Vouchers</p>
              <p className="font-mono text-xl font-bold text-dark">04</p>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h3 className="font-ui-md font-bold text-dark uppercase tracking-wider text-[11px] text-light mb-6">Recent Ledger Entries</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-stone-50 hover:bg-section-muted transition-colors cursor-pointer group">
                  <div>
                    <p className="font-ui-sm font-bold text-dark text-sm">JV-24-00{12 + i}</p>
                    <p className="text-[11px] text-light mt-1">Payment received · 12 Oct 23</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-dark">₹ {formatIndianNumber(45000 * i)}</p>
                    <span className="font-ui-xs text-[9px] uppercase font-bold text-success">Cleared</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Statutory Mapping */}
          <section className="bg-section-amber border border-amber/30 p-6 rounded-sm">
             <h4 className="font-ui-sm font-bold text-amber-900 mb-4 uppercase tracking-widest text-[10px]">Statutory Mapping</h4>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-amber-800 uppercase mb-1">GST Treatment</p>
                  <p className="font-ui-sm text-sm text-dark">Taxable Inward</p>
                </div>
                <div>
                  <p className="text-[10px] text-amber-800 uppercase mb-1">Schedule III</p>
                  <p className="font-ui-sm text-sm text-dark">Other Assets</p>
                </div>
             </div>
          </section>
        </div>

        {/* Footer Actions */}
        <footer className="px-8 py-6 border-t border-border-subtle bg-section-muted flex gap-4">
// @ts-ignore
          <Link href={`/accounts/${account.id}`} className="flex-1 bg-white border border-border-subtle text-dark py-3 text-center font-ui-sm text-xs font-bold uppercase tracking-widest no-underline hover:bg-stone-100 transition-colors rounded-sm shadow-sm">
            Full History
// @ts-ignore
          </Link>
          <button className="flex-1 bg-primary-container text-white py-3 font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all rounded-sm border-none cursor-pointer shadow-sm">
            New Journal
          </button>
        </footer>
      </aside>
    </>
  );
}
