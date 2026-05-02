"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";

interface ITRReturn {
  id: string;
  financialYear: string;
  formType: string;
  assesseeName: string;
  status: "draft" | "generated" | "filed";
  filedDate?: string;
}

const mockReturns: ITRReturn[] = [
  { id: "1", financialYear: "2024-25", formType: "ITR-3", assesseeName: "TechCorp India Pvt Ltd", status: "draft" },
  { id: "2", financialYear: "2024-25", formType: "ITR-4", assesseeName: "Sharma Associates", status: "generated" },
  { id: "3", financialYear: "2023-24", formType: "ITR-3", assesseeName: "Global Exports LLC", status: "filed", filedDate: "12 Aug 24" },
];

export default function ITRReturnsPage() {
  const [filter, setFilter] = useState("drafts");

  return (
    <div className="space-y-0 text-left">
      {/* Top Navigation */}
      <div className="p-8 max-w-[1200px] mx-auto w-full">
        {/* Local Sub-Nav */}
        <div className="flex justify-between items-center mb-8 border-b border-border-subtle pb-4">
          <nav className="flex gap-8 font-serif text-sm uppercase tracking-[0.15em] font-medium">
            <button onClick={() => setFilter('recent')} className={`border-none bg-transparent cursor-pointer transition-opacity ${filter === 'recent' ? 'text-primary-container border-b-2 border-primary-container pb-4 -mb-[17px]' : 'text-light hover:text-dark'}`}>Recent</button>
            <button onClick={() => setFilter('drafts')} className={`border-none bg-transparent cursor-pointer transition-opacity ${filter === 'drafts' ? 'text-primary-container border-b-2 border-primary-container pb-4 -mb-[17px]' : 'text-light hover:text-dark'}`}>Drafts</button>
            <button onClick={() => setFilter('archived')} className={`border-none bg-transparent cursor-pointer transition-opacity ${filter === 'archived' ? 'text-primary-container border-b-2 border-primary-container pb-4 -mb-[17px]' : 'text-light hover:text-dark'}`}>Archived</button>
          </nav>
          <div className="flex gap-3">
            <button className="font-ui-sm text-dark border border-border-subtle/20 py-2 px-4 hover:bg-surface-variant transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
              Print Ledger
            </button>
            <button className="font-ui-sm bg-primary-container text-white py-2 px-4 hover:bg-primary transition-colors flex items-center gap-2 border-none cursor-pointer">
              Export CSV <Icon name="download" className="text-sm" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-display-lg text-display-lg text-dark mb-2">Income Tax Returns</h2>
            <p className="font-ui-sm text-mid">Manage and compute statutory filings for the current fiscal period.</p>
          </div>
          <button className="bg-primary-container text-white font-ui-md py-3 px-6 hover:bg-primary transition-colors flex items-center gap-2 group border-none cursor-pointer">
            Compute Tax
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </button>
        </div>

        {/* Ledger Table Container */}
        <div className="bg-white border border-border-subtle border-t-2 border-t-amber-text shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 p-4 border-b-[0.5px] border-border-subtle bg-section-muted font-ui-xs text-mid uppercase tracking-widest text-left">
            <div className="col-span-1">Financial Year</div>
            <div className="col-span-1">Form Type</div>
            <div className="col-span-2">Assessee Name</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px] text-dark">
            {mockReturns.map((r) => (
              <div key={r.id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-surface-variant transition-colors cursor-pointer group text-left">
                <div className="col-span-1">{r.financialYear}</div>
                <div className="col-span-1">
                  <span className="bg-stone-100 px-2 py-1 border border-border-subtle font-ui-xs text-[10px] tracking-wider font-bold">{r.formType}</span>
                </div>
                <div className="col-span-2 font-ui-sm font-medium">{r.assesseeName}</div>
                <div className="col-span-1">
                  <span className={`font-ui-xs text-[10px] tracking-wider border-b uppercase ${
                    r.status === 'draft' ? 'text-amber-text border-amber-text/30' :
                    r.status === 'generated' ? 'text-blue-600 border-blue-600/30' :
                    'text-mid border-transparent'
                  }`}>
                    {r.status} {r.filedDate && <span className="font-mono text-light ml-1 lowercase">{r.filedDate}</span>}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-primary-container hover:text-dark font-ui-sm text-xs border-none bg-transparent cursor-pointer border-b-[0.5px] border-transparent hover:border-border-subtle">Compute</button>
                  <button className="text-mid hover:text-dark font-ui-sm text-xs border-none bg-transparent cursor-pointer border-b-[0.5px] border-transparent hover:border-border-subtle">View</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t-[0.5px] border-border-subtle flex justify-between items-center text-mid font-ui-sm text-xs">
            <div>Showing 1-3 of 24 records</div>
            <div className="flex gap-4">
              <button className="hover:text-dark transition-colors disabled:opacity-30 border-none bg-transparent cursor-pointer" disabled>Previous</button>
              <button className="hover:text-dark transition-colors border-none bg-transparent cursor-pointer">Next</button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="font-mono text-light text-[10px] uppercase tracking-widest">ComplianceOS ensures alignment with Income Tax Dept schema updates (v1.2.4).</p>
        </div>
      </div>
    </div>
  );
}
