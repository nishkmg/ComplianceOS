// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      router.push("/login");
    } else {
      setError("Registration failed");
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-surface rounded-lg">
      <h1 className="font-display text-display-lg text-dark mb-2">Create Account</h1>
      <p className="font-ui text-ui-sm text-light mb-6">Set up your business account</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-name" className="block font-ui text-ui-sm font-medium text-dark mb-1">
            Business Name
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md font-ui text-ui-md"
            autoComplete="organization"
            required
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="block font-ui text-ui-sm font-medium text-dark mb-1">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md font-ui text-ui-md"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block font-ui text-ui-sm font-medium text-dark mb-1">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md font-ui text-ui-md"
            autoComplete="new-password"
            required
          />
        </div>
        {error && (
          <p className="font-ui text-ui-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-amber text-white font-ui text-ui-sm font-medium rounded-md hover:bg-amber-hover transition-colors"
        >
          Create Account
        </button>
      </form>
      <p className="mt-6 text-center font-ui text-ui-sm">
        <span className="text-light">Already have an account?</span>{' '}
        <a href="/login" className="text-amber hover:underline">Sign in</a>
      </p>
    </div>
  );
}
