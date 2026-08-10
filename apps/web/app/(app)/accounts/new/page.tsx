"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { ACCOUNT_KINDS, ACCOUNT_SUB_TYPES } from "@/lib/constants";
import { api } from "@/lib/api";

export default function NewAccountPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const [code, setCode] = useState(""); const [name, setName] = useState(""); const [kind, setKind] = useState("Asset"); const [subType, setSubType] = useState("CurrentAsset"); const [saving, setSaving] = useState(false);

  const createAccount = api.accounts.create.useMutation();

  const handleSubmit = async () => {
    if (!code || !name) { showToast.error("Code and name are required."); return; }
    setSaving(true);
    const accListInput = undefined;
    const previousAccList = utils.accounts.list.getData(accListInput);
    const tempAccId = `temp-${Date.now()}`;
    await utils.accounts.list.cancel(accListInput);
    const accApply = (old: unknown) => {
      const arr = (old as Array<Record<string, unknown>> | undefined) ?? [];
      const tempRow: Record<string, unknown> = {
        id: tempAccId, code, name, kind, subType, isLeaf: true, isActive: true,
      };
      return [tempRow, ...arr];
    };
    utils.accounts.list.setData(accListInput, accApply as never);
    try {
      await createAccount.mutateAsync({ code, name, kind, subType } as Parameters<typeof createAccount.mutateAsync>[0]);
      showToast.success("Account created");
      await utils.accounts.list.invalidate(accListInput);
      router.refresh();
      router.push("/accounts");
    } catch (err: unknown) {
      utils.accounts.list.setData(accListInput, (() => previousAccList) as never);
      showToast.error(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer" aria-label="Go back"><Icon name="arrow_back" size={20} /></button>
        <h1 className="font-ui text-display-lg font-semibold text-dark">New Account</h1>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5"><label htmlFor="account-code" className="font-ui text-ui-2xs text-light uppercase font-bold">Code</label><input id="account-code" className="w-full border border-border rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={code} onChange={e => setCode(e.target.value)} /></div>
          <div className="space-y-1.5"><label htmlFor="account-name" className="font-ui text-ui-2xs text-light uppercase font-bold">Name</label><input id="account-name" className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={name} onChange={e => setName(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="account-kind" className="font-ui text-ui-2xs text-light uppercase font-bold">Kind</label>
            <select id="account-kind" className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={kind} onChange={e => { setKind(e.target.value); setSubType(ACCOUNT_SUB_TYPES[e.target.value]?.[0] || ""); }}>
              {ACCOUNT_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="account-subtype" className="font-ui text-ui-2xs text-light uppercase font-bold">Sub Type</label>
            <select id="account-subtype" className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={subType} onChange={e => setSubType(e.target.value)}>
              {(ACCOUNT_SUB_TYPES[kind] || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="w-full py-3 bg-amber text-white text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer disabled:opacity-50">{saving ? "Creating…" : "Create Account"}</button>
      </div>
    </div>
  );
}
