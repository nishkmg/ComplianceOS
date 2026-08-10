"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";

const SUPPORT_EMAIL = "support@arthvahi.com";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) return;
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[Support] ${subject.trim()}`)}&body=${encodeURIComponent(message.trim())}`;
    window.location.href = mailto;
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-40">
      <PageHeader title="Support" />
      <p className="font-ui text-ui-sm text-text-mid">
        Need help? Write to us at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-amber hover:underline no-underline">{SUPPORT_EMAIL}</a> — or compose a message below and your email client will open pre-filled.
      </p>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="support-subject" className="font-ui text-ui-2xs text-light uppercase font-bold">Subject</label>
          <input id="support-subject" className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description of your issue" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="support-message" className="font-ui text-ui-2xs text-light uppercase font-bold">Message</label>
          <textarea id="support-message" rows={6} className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber resize-none" value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail…" />
        </div>
        <button onClick={handleSubmit} disabled={!subject.trim() || !message.trim()} className="w-full py-3 bg-amber text-white text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer disabled:opacity-40">
          Compose in Email Client
        </button>
        <p className="font-ui text-ui-2xs text-light">
          This opens your default email app with the message pre-filled — nothing is sent until you press send there.
        </p>
      </div>
    </div>
  );
}
