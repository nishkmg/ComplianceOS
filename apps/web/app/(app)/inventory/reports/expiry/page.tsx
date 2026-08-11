"use client";

import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function InventoryExpiryPage() {
  return (
    <div className="space-y-6 text-left">
      <header className="flex justify-between items-start px-8 py-6 border-b border-border bg-surface/80 -mx-8 -mt-8 mb-8">
        <div>
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">Inventory Reports</p>
          <PageHeader title="Inventory Expiry Report" />
        </div>
      </header>
      <EmptyState
        icon="hourglass_empty"
        title="Expiry tracking not implemented yet"
        description="Batch-level expiry dates are not tracked in the current build. This report will populate once batch/expiry data lands on stock movements."
        action={{ label: "Back to Inventory Reports", onClick: () => { window.location.href = "/inventory/reports"; } }}
      />
    </div>
  );
}
