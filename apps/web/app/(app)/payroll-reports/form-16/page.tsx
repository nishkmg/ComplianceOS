"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function Form16Page() {
  return (
    <div className="space-y-8 text-left">
      <header className="flex justify-between items-start px-8 py-6 border-b border-border bg-surface/80 -mx-8 -mt-8 mb-8">
        <div>
          <div className="flex items-center gap-2 text-ui-2xs font-bold text-amber uppercase tracking-widest mb-2">
            <Icon name="description" className="text-sm" /> Form 16 Data Export
          </div>
          <PageHeader title="Employee Tax Report" />
          <p className="text-ui-sm text-secondary font-ui mt-1">Under Section 203 of the Income-tax Act, 1961</p>
        </div>
      </header>

      <EmptyState
        icon="description"
        title="Form 16 export not available yet"
        description="Form 16 is generated per employee from annual TDS data. It will become available once payroll runs and TDS summaries are finalized for the financial year."
        action={{ label: "View Payroll Reports", onClick: () => { window.location.href = "/payroll-reports"; } }}
      />
    </div>
  );
}
