"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { showToast } from "@/lib/toast";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { api } from "@/lib/api";

const ROLES = ["owner", "accountant", "manager", "employee"] as const;

interface MemberRow {
  userId: string;
  name: string | null;
  email: string;
  role: string;
  joinedAt: string;
  active: boolean;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function TeamSettingsPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "accountant" });
  const [busy, setBusy] = useState(false);

  const utils = api.useUtils();
  const { data: members, isLoading } = api.team.list.useQuery(undefined, { staleTime: 15_000 });
  const rows: MemberRow[] = (members ?? []) as MemberRow[];

  const inviteMutation = api.team.invite.useMutation({
    onSuccess: (res) => {
      setBusy(false);
      if (res.alreadyMember) {
        showToast.error("That user is already a member of this workspace.");
        return;
      }
      setInviteOpen(false);
      showToast.success("Invitation sent.");
      if (res.inviteLink) {
        // SMTP may not be configured — offer the link directly.
        navigator.clipboard?.writeText(res.inviteLink).catch(() => {});
        showToast.info("Invite link copied — share it if the email doesn't arrive.");
      }
      void utils.team.list.invalidate();
    },
    onError: (e) => {
      setBusy(false);
      showToast.error(e.message);
    },
  });

  const roleMutation = api.team.updateRole.useMutation({
    onSuccess: () => {
      showToast.success("Role updated.");
      void utils.team.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const removeMutation = api.team.remove.useMutation({
    onSuccess: () => {
      showToast.success("Member removed.");
      void utils.team.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const confirmInvite = () => {
    if (!inviteForm.email.includes("@")) {
      showToast.error("Enter a valid email address.");
      return;
    }
    setBusy(true);
    inviteMutation.mutate({ email: inviteForm.email, role: inviteForm.role as typeof ROLES[number] });
  };

  return (
    <div className="space-y-10 text-left">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="text-left">
          <PageHeader
            eyebrow="Settings · Team"
            title="Team & Users"
            description="Invite teammates, assign roles and control access to this workspace."
          />
        </div>
        <Button onClick={() => setInviteOpen(true)} className="group">
          Invite Member <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
        </Button>
      </header>

      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
        <div className="p-6 border-b border-border-subtle bg-surface-muted/50 flex justify-between items-center">
          <div>
            <h3 className="font-ui text-lg font-bold text-dark">Members</h3>
            <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">
              {isLoading ? "Loading…" : `${rows.length} member${rows.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle text-light font-ui text-ui-2xs uppercase tracking-widest">
                <th className="py-4 px-6">Member</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Joined</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-ui text-ui-sm">
              {rows.map((m) => (
                <tr key={m.userId} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber text-white dark:text-amber-ink flex items-center justify-center font-bold text-xs shrink-0">
                        {(m.name ?? m.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-dark truncate">{m.name ?? "Pending user"}</p>
                        <p className="text-ui-2xs text-light truncate">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`inline-block px-2 py-0.5 text-ui-2xs uppercase font-bold tracking-widest border rounded-md ${
                      m.active ? "bg-success-bg text-success-deep border-success/20" : "bg-amber-soft text-amber border-amber/30"
                    }`}>
                      {m.active ? "Active" : "Pending"}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <select
                      value={m.role}
                      onChange={(e) => roleMutation.mutate({ userId: m.userId, role: e.target.value as typeof ROLES[number] })}
                      aria-label={`Role for ${m.email}`}
                      className="rounded-md border border-border-strong bg-surface px-2 py-1 text-ui-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="py-5 px-6 font-mono text-ui-xs text-mid">{fmtDate(m.joinedAt)}</td>
                  <td className="py-5 px-6 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${m.email} from this workspace?`)) removeMutation.mutate({ userId: m.userId });
                      }}
                      className="text-danger hover:text-danger-bg font-bold uppercase text-ui-2xs tracking-widest border-none bg-transparent cursor-pointer"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-mid font-ui text-ui-sm">
                    No members yet — invite your team to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
      <DialogContent className="max-w-md">
            <h3 className="font-ui text-base font-semibold text-dark flex items-center gap-2">
              <Icon name="person_add" size={18} /> Invite a teammate
            </h3>
            <p className="mt-1 font-ui text-ui-sm text-mid">
              They'll get a link to set their own password. If email isn't configured yet, the invite link is copied instead.
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="invite-email" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Email address</label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="teammate@company.com"
                  className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                />
              </div>
              <div>
                <label htmlFor="invite-role" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Role</label>
                <select
                  id="invite-role"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={confirmInvite} disabled={busy}>Send Invite</Button>
            </div>
      </DialogContent>
      </Dialog>
    </div>
  );
}
