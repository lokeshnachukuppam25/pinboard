"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import clsx from "clsx";

export function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState("");

  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

  const active = useMemo(() => pathname ?? "/", [pathname]);

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/70 backdrop-blur">
      <div className="container-page flex items-center gap-3 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Pinboard
        </Link>

        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const url = q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/";
            router.push(url);
          }}
        >
          <input className="input" placeholder="Search pins, tags..." value={q} onChange={(e) => setQ(e.target.value)} />
        </form>

        <Link className={clsx("btn-ghost", active === "/upload" && "bg-zinc-900/5")} href="/upload">
          Upload
        </Link>

        {user ? (
          <>
            <Link className="btn-ghost" href={`/profile/${encodeURIComponent(user.username)}`}>
              {user.username}
            </Link>
            <button
              className="btn-ghost"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className={clsx("btn-ghost", active === "/login" && "bg-zinc-900/5")} href="/login">
              Login
            </Link>
            <Link className="btn-primary" href="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

