"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

export default function ItrReturnsListPage() {
  const { fiscalYears } = useFiscalYear();
  const openFys = fiscalYears.filter(fy => fy.status === "open");

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <h1 className="font-display text-display-lg font-semibold text-dark">ITR Returns</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fiscalYears.map(fy => (
          <Link key={fy.year} href={`/itr/returns/${fy.year}`} className="block bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow no-underline">
            <Icon name="description" className="text-3xl text-amber mb-4" />
            <h3 className="font-ui text-lg font-bold text-dark">{fy.name}</h3>
            <p className="font-ui text-[13px] text-text-mid mt-1">{fy.status === "open" ? `${fy.daysRemaining} days remaining` : "Closed"}</p>
          </Link>
        ))}
      </div>
      {fiscalYears.length === 0 && (
        <EmptyState icon="description" title="No fiscal years" description="Fiscal years will appear once configured." />
      )}
    </div>
  );
}
