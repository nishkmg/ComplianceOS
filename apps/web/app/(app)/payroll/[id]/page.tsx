"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import "next/link";

export default function PayrollDetailPage() {
  const params = useParams(); const router = useRouter();
  const [loading] = useState(false);

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer"><Icon name="arrow_back" size={20} /></button>
        <div><h1 className="font-ui text-display-lg font-semibold text-dark">Payroll Run</h1><p className="font-mono text-ui-xs text-mid mt-0.5">{params.id}</p></div>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
        <p className="font-ui text-sm text-text-mid">Payroll run details will be available once the payroll module is fully implemented.</p>
      </div>
    </div>
  );
}
