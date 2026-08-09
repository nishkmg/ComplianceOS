"use client";

import { EmptyState } from "@/components/ui/empty-state";

export default function MyPayslipsPage() {
  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">My Payslips</h1>
      <EmptyState icon="description" title="No payslips yet" description="Payslips will appear here once payroll is processed." />
    </div>
  );
}
