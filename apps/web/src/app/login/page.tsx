"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api, setToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <div className="text-xl font-semibold">Welcome back</div>
        <div className="mt-1 text-sm text-zinc-400">Log in to save and manage your pins.</div>

        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              const res = await api.login({ emailOrUsername, password });
              setToken(res.token);
              await login(res.token);
              router.push("/");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Login failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <input className="input" placeholder="Email or username" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          {error ? <div className="text-sm text-red-200">{error}</div> : null}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-400">
          New here?{" "}
          <Link className="text-zinc-100 underline" href="/register">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

