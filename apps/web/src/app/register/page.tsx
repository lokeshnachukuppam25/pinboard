"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api, setToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <div className="text-xl font-semibold">Create account</div>
        <div className="mt-1 text-sm text-zinc-400">Start uploading and saving ideas.</div>

        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              const res = await api.register({ email, username, name, password });
              setToken(res.token);
              await login(res.token);
              router.push("/");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Registration failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Password (min 8 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          {error ? <div className="text-sm text-red-200">{error}</div> : null}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating…" : "Register"}
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-400">
          Already have an account?{" "}
          <Link className="text-zinc-100 underline" href="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

