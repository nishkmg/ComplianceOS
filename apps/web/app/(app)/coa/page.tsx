"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

interface Account { id: string; code: string; name: string; kind: string; sub_type: string; is_leaf: boolean; is_active: boolean; }

export default function CoAPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [accounts, setAccounts] = useState<Account[]>([]); const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try { const r = await fetch(`/api/accounts?tenantId=${encodeURIComponent(tenantId)}`); if (r.ok) setAccounts((await r.json()).accounts || []); } catch {} finally { setLoading(false); }
    })();
  }, [tenantId]);

  const byKind: Record<string, Account[]> = {};
  for (const a of accounts.filter(a => a.is_active !== false)) { (byKind[a.kind] = byKind[a.kind] || []).push(a); }

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <PageHeader title="Chart of Accounts" />
        <Link href="/accounts/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline"><Icon name="add" size={14} /> New Account</Link>
      </div>
      {accounts.length === 0 ? <EmptyState icon="account_tree" title="No accounts" description="Create your first account." /> : (
        <div className="space-y-8">
          {Object.entries(byKind).map(([kind, accts]) => (
            <div key={kind} className="bg-surface border border-border rounded-md shadow-sm">
              <div className="h-[2px] w-full bg-amber" />
              <div className="px-6 py-3 bg-surface-muted border-b border-border"><h2 className="font-ui text-ui-xs text-dark font-bold uppercase tracking-widest">{kind}</h2></div>
              {accts.map(a => (
                <Link key={a.id} href={`/accounts/${a.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-surface-muted transition-colors border-b border-border-subtle last:border-b-0 no-underline">
                  <span className="font-mono text-ui-xs text-mid w-20">{a.code}</span>
                  <span className="font-ui text-ui-sm text-dark flex-1">{a.name}</span>
                  <span className="font-ui text-ui-2xs text-light uppercase tracking-widest">{a.sub_type?.replace(/([A-Z])/g, ' $1').trim() || kind}</span>
                  <span className={`text-ui-2xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${a.is_leaf ? 'bg-success-bg text-success' : 'bg-lighter text-mid'}`}>{a.is_leaf ? 'Leaf' : 'Group'}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
