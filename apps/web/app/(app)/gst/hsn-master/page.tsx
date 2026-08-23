"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { api } from "@/lib/api";

export default function HsnMasterPage() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ code: "", description: "", gstRate: "18", effectiveFrom: new Date().toISOString().slice(0, 10) });
  const [busy, setBusy] = useState(false);

  const utils = api.useUtils();
  const { data: rows, isLoading } = api.hsnMaster.list.useQuery({ search: search || undefined, pageSize: 100 }, { staleTime: 30_000 });

  const createMutation = api.hsnMaster.create.useMutation({
    onSuccess: () => { showToast.success("HSN code added."); setAddOpen(false); setBusy(false); void utils.hsnMaster.list.invalidate(); },
    onError: (e) => { showToast.error(e.message); setBusy(false); },
  });

  const deactivateMutation = api.hsnMaster.deactivate.useMutation({
    onSuccess: () => { showToast.success("HSN code deactivated."); void utils.hsnMaster.list.invalidate(); },
    onError: (e) => showToast.error(e.message),
  });

  const submit = () => {
    if (!form.code.trim() || !form.description.trim()) { showToast.error("Code and description are required."); return; }
    setBusy(true);
    createMutation.mutate({ code: form.code.trim(), description: form.description.trim(), gstRate: Number(form.gstRate) || undefined, effectiveFrom: form.effectiveFrom });
  };

  return (
    <div className="space-y-10 text-left">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="text-left">
          <PageHeader
            eyebrow="GST · HSN Master"
            title="HSN Codes"
            description="Shared GSTN-style harmonized code catalog used by products, invoices and GSTR-1 HSN summaries."
          />
        </div>
        <Button onClick={() => setAddOpen(true)} className="group">
          Add HSN Code <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
        </Button>
      </header>

      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
        <div className="p-6 border-b border-border-subtle bg-surface-muted/50 flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <h3 className="font-ui text-lg font-bold text-dark">Catalog</h3>
            <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">{isLoading ? "Loading…" : `${rows?.length ?? 0} codes`}</p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or description…"
            aria-label="Search HSN codes"
            className="sm:w-64 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle text-light font-ui text-ui-2xs uppercase tracking-widest">
                <th className="py-4 px-6">Code</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">GST rate</th>
                <th className="py-4 px-6">Effective</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-ui text-ui-sm">
              {(rows ?? []).map((r) => (
                <tr key={r.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-5 px-6 font-mono font-bold text-dark">{r.code}</td>
                  <td className="py-5 px-6 text-mid max-w-md">{r.description}</td>
                  <td className="py-5 px-6 font-mono text-mid">{r.gstRate != null ? `${r.gstRate}%` : "—"}</td>
                  <td className="py-5 px-6 font-mono text-ui-xs text-mid">{r.effectiveFrom}{r.effectiveTo ? ` → ${r.effectiveTo}` : ""}</td>
                  <td className="py-5 px-6 text-right">
                    {r.effectiveTo ? (
                      <span className="inline-block px-2 py-0.5 text-ui-2xs uppercase font-bold tracking-widest border rounded-md bg-surface-muted text-light border-border-subtle">Inactive</span>
                    ) : (
                      <button
                        onClick={() => { if (confirm(`Deactivate HSN ${r.code}?`)) deactivateMutation.mutate({ id: r.id, effectiveTo: new Date().toISOString().slice(0, 10) }); }}
                        className="text-danger hover:text-danger-bg font-bold uppercase text-ui-2xs tracking-widest border-none bg-transparent cursor-pointer"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && (rows ?? []).length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-mid font-ui text-ui-sm">No HSN codes found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
      <DialogContent className="max-w-md">
            <h3 className="font-ui text-base font-semibold text-dark">Add HSN code</h3>
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="hsn-code" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Code</label>
                  <input id="hsn-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="8517" className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
                </div>
                <div>
                  <label htmlFor="hsn-rate" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">GST rate %</label>
                  <select id="hsn-rate" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: e.target.value })} className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    {["0", "5", "12", "18", "28"].map((r) => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="hsn-desc" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Description</label>
                <input id="hsn-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mobile phones" className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
              </div>
              <div>
                <label htmlFor="hsn-from" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Effective from</label>
                <input id="hsn-from" type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={submit} disabled={busy}>Add Code</Button>
            </div>
      </DialogContent>
      </Dialog>
    </div>
  );
}
