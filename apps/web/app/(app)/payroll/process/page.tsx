"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

export default function ProcessPayrollPage() {
  const router = useRouter();

  return (
    <div className="max-w-[600px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer"><Icon name="arrow_back" size={20} /></button>
        <h1 className="font-display text-display-lg font-semibold text-dark">Process Payroll</h1>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
        <p className="font-ui text-sm text-text-mid">Payroll processing will be available once the payroll module is fully implemented.</p>
      </div>
    </div>
  );
}
