"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { showToast } from "@/lib/toast";
import { useSession } from "next-auth/react";

export default function SupportPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [subject, setSubject] = useState(""); const [message, setMessage] = useState(""); const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) { showToast.error("Please fill in all fields."); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    showToast.success("Support request sent. We'll get back to you within 24 hours.");
    setSubject(""); setMessage("");
    setSending(false);
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">Support</h1>
      <p className="font-ui text-[13px] text-text-mid">Need help? Send us a message and we'll get back to you.</p>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
        <div className="space-y-1.5">
          <label className="font-ui text-[10px] text-light uppercase font-bold">Subject</label>
          <input className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description of your issue" />
        </div>
        <div className="space-y-1.5">
          <label className="font-ui text-[10px] text-light uppercase font-bold">Message</label>
          <textarea rows={6} className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber resize-none" value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail…" />
        </div>
        <button onClick={handleSubmit} disabled={sending} className="w-full py-3 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer disabled:opacity-50">{sending ? "Sending…" : "Send Message"}</button>
      </div>
    </div>
  );
}
