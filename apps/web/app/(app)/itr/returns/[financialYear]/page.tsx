"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/lib/toast";

export default function ItrReturnsPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const params = useParams();
  const [returns, setReturns] = useState<any[]>([]); const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        // ITR returns are not yet stored in a dedicated table
        // For now, show empty state
      } catch {} finally { setLoading(false); }
    })();
  }, [tenantId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <Link href="/itr/returns" className="text-mid hover:text-dark"><Icon name="arrow_back" size={20} /></Link>
        <h1 className="font-display text-display-lg font-semibold text-dark">ITR Returns — {params.financialYear}</h1>
      </div>
      <EmptyState icon="description" title="No returns yet" description="ITR returns for this year will appear once they are prepared." />
    </div>
  );
}
