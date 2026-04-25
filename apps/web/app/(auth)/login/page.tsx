// @ts-nocheck
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-surface rounded-lg">
      <h1 className="font-display text-display-lg text-dark mb-2">Sign In</h1>
      <p className="font-ui text-ui-sm text-light mb-6">Enter your credentials to continue</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block font-ui text-ui-sm font-medium text-dark mb-1">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md font-ui text-ui-md"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block font-ui text-ui-sm font-medium text-dark mb-1">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md font-ui text-ui-md"
            autoComplete="current-password"
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
          Sign In
        </button>
      </form>
      <p className="mt-6 text-center font-ui text-ui-sm">
        <span className="text-light">Don&apos;t have an account?</span>{' '}
        <a href="/signup" className="text-amber hover:underline">Sign up</a>
      </p>
    </div>
  );
}
