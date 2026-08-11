"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { showToast } from "@/lib/toast";
import { apiPost } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!token) {
      showToast.error("This link is missing its token. Use the full link from the email.");
      return;
    }
    if (password.length < 8) {
      showToast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      showToast.error("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await apiPost("/api/auth/reset-password", { token, password });
      setDone(true);
    } catch (e) {
      showToast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-surface-muted min-h-screen flex items-center justify-center p-6">
      <main className="w-full max-w-[440px]">
        <div className="bg-surface border border-border rounded-xl px-8 py-12 shadow-md">
          {done ? (
            <>
              <h1 className="font-display text-2xl font-semibold text-dark mb-4">Password set</h1>
              <p className="text-ui-sm text-secondary font-ui mb-6">
                Your password has been updated. You can now sign in with it.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md bg-amber px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-amber-bright transition-colors"
              >
                Sign in →
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-dark mb-4">Set your password</h1>
              <p className="text-ui-sm text-secondary font-ui mb-6">
                Choose a strong password for your Arthvahi account. This link works once.
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="rp-password" className="mb-1.5 block text-ui-xs font-medium text-dark font-ui">
                    New password
                  </label>
                  <input
                    id="rp-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  />
                </div>
                <div>
                  <label htmlFor="rp-confirm" className="mb-1.5 block text-ui-xs font-medium text-dark font-ui">
                    Confirm password
                  </label>
                  <input
                    id="rp-confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  />
                </div>
              </div>
              <button
                onClick={submit}
                disabled={busy}
                className="mt-6 w-full rounded-md bg-amber px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-bright transition-colors disabled:opacity-60"
              >
                {busy ? "Saving…" : "Set password"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="bg-surface-muted min-h-screen" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
