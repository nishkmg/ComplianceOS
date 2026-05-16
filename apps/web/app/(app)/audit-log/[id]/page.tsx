"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AuditLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<any>(null); const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        // No dedicated audit entry API yet — show summary view
        setEntry({ id: params.id });
      } catch {} finally { setLoading(false); }
    })();
  }, [params.id]);

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer"><Icon name="arrow_back" size={20} /></button>
        <div><h1 className="font-display text-display-lg font-semibold text-dark">Audit Entry</h1><p className="font-mono text-[12px] text-mid mt-0.5">{params.id}</p></div>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
        <p className="font-ui text-sm text-text-mid">Audit entry details are not available in this view. See the full audit log for all entries.</p>
      </div>
      <Link href="/audit-log" className="text-amber text-[12px] font-bold uppercase tracking-wider hover:underline no-underline">← Back to Audit Log</Link>
    </div>
  );
}
