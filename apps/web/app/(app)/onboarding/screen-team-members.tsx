"use client";

import { useState } from "react";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { TEAM_ROLES } from "@/lib/constants";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface TeamMember {
  name: string;
  email: string;
  role: string;
}

interface ScreenTeamMembersProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ScreenTeamMembers({ tenantId, onComplete, onBack }: ScreenTeamMembersProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState<TeamMember>({ name: "", email: "", role: "accountant" });
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const addMember = () => {
    if (!newMember.name.trim()) {
      showToast.error("Name is required");
      return;
    }
    if (!newMember.email.trim() || !EMAIL_REGEX.test(newMember.email)) {
      showToast.error("Valid email is required");
      return;
    }
    if (teamMembers.some((m) => m.email.toLowerCase() === newMember.email.toLowerCase())) {
      showToast.error("Member with this email already added");
      return;
    }
    setTeamMembers([...teamMembers, { ...newMember, email: newMember.email.toLowerCase() }]);
    setNewMember({ name: "", email: "", role: "accountant" });
  };

  const removeMember = (email: string) => {
    setMemberToRemove(email);
  };

  const confirmRemove = () => {
    if (memberToRemove) {
      setTeamMembers(teamMembers.filter((m) => m.email !== memberToRemove));
      setMemberToRemove(null);
    }
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 13,
        data: { teamMembers },
      });
      showToast.success("Team members saved");
      onComplete();
    } catch (error: any) {
      showToast.error(error?.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      <div>
        <h1 className="font-ui text-display-xl text-on-surface mb-3">
          Team Members
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Invite your accountant, CA, or team members to collaborate.
        </p>
      </div>

      {/* Add Member Form */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm text-on-surface focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
            placeholder="Name"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
          />
          <input
            className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm text-on-surface focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
            placeholder="Email"
            type="email"
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
          />
          <div className="relative">
            <select
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm text-on-surface appearance-none focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            >
              {TEAM_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-mid pointer-events-none" />
          </div>
          <button
            type="button"
            onClick={addMember}
            className="bg-surface border border-border rounded-md px-4 py-3 font-ui text-[13px] font-bold text-on-surface hover:bg-surface-muted transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icon name="add" className="text-[18px]" />
            Add
          </button>
        </div>
      </section>

      {/* Team Members List */}
      {teamMembers.length > 0 && (
        <section className="space-y-4">
          <div className="bg-surface border-[0.5px] border-border shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b-[0.5px] border-border">
                  <th className="py-3 px-6 font-ui text-[11px] text-text-light uppercase tracking-widest">Name</th>
                  <th className="py-3 px-6 font-ui text-[11px] text-text-light uppercase tracking-widest">Email</th>
                  <th className="py-3 px-6 font-ui text-[11px] text-text-light uppercase tracking-widest">Role</th>
                  <th className="py-3 px-6 font-ui text-[11px] text-text-light uppercase tracking-widest w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle">
                {teamMembers.map((m) => (
                  <tr key={m.email} className="hover:bg-surface-muted transition-colors">
                    <td className="py-4 px-6 font-ui text-[13px] font-bold text-on-surface">{m.name}</td>
                    <td className="py-4 px-6 font-ui text-[13px] text-text-mid">{m.email}</td>
                    <td className="py-4 px-6">
                      <span className="font-ui text-[10px] uppercase tracking-widest bg-amber-50 text-amber px-2 py-1 rounded-md font-bold">
                        {TEAM_ROLES.find((r) => r.value === m.role)?.label || m.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => removeMember(m.email)}
                        className="text-text-light hover:text-danger transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <Icon name="close" className="text-[18px]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="flex justify-between items-center mt-6 pt-8 border-t border-border">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="font-ui text-[13px] text-text-mid hover:text-on-surface transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer disabled:opacity-50"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              Back
            </button>
          )}
          <p className="font-ui text-[11px] text-text-light uppercase tracking-wider italic">
            You can add more team members later in Settings.
          </p>
        </div>
        <button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="bg-amber text-white font-ui text-[13px] text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Continue"}
          <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>

      <ConfirmDialog
        open={memberToRemove !== null}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${memberToRemove || ""}? They will not be notified.`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={confirmRemove}
        onCancel={() => setMemberToRemove(null)}
      />
    </div>
  );
}
