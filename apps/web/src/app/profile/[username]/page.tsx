"use client";

import React, { use, useEffect, useState } from "react";
import { api, type ApiPostListItem, type ApiUser } from "@/lib/api";
import { MasonryGrid } from "@/components/MasonryGrid";
import { useAuth } from "@/lib/auth";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user: me } = useAuth();

  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [tab, setTab] = useState<"created" | "saved">("created");
  const [items, setItems] = useState<ApiPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const u = await api.getUser(username);
        if (cancelled) return;
        setProfile(u.user);

        // created posts use the global feed API response shape, so reuse it
        const created = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${encodeURIComponent(username)}/posts?page=1&limit=60`, {
          cache: "no-store"
        }).then((r) => r.json());

        if (!cancelled) setItems(created.items ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  async function loadCreated() {
    setLoading(true);
    setError(null);
    try {
      const created = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${encodeURIComponent(username)}/posts?page=1&limit=60`,
        { cache: "no-store" }
      ).then((r) => r.json());
      setItems(created.items ?? []);
      setTab("created");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  async function loadSaved() {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      const token = window.localStorage.getItem("pb_token");
      if (token) headers.Authorization = `Bearer ${token}`;

      const saved = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${encodeURIComponent(username)}/saved?page=1&limit=60`,
        { cache: "no-store", headers }
      ).then((r) => r.json());
      setItems(saved.items ?? []);
      setTab("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load saved");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !profile) return <div className="text-sm text-zinc-400">Loading…</div>;
  if (error && !profile) return <div className="card p-4 text-sm text-red-200">{error}</div>;
  if (!profile) return <div className="text-sm text-zinc-400">Not found</div>;

  const isMe = me?.username === profile.username;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-semibold">{profile.name}</div>
            <div className="text-sm text-zinc-400">@{profile.username}</div>
            {profile.bio ? <div className="mt-2 text-sm text-zinc-200">{profile.bio}</div> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={tab === "created" ? "btn-primary" : "btn-ghost"} onClick={() => void loadCreated()}>
              Created
            </button>
            <button className={tab === "saved" ? "btn-primary" : "btn-ghost"} onClick={() => void loadSaved()} disabled={!isMe}>
              Saved
            </button>
            {!isMe ? <div className="text-xs text-zinc-500 self-center">Saved pins visible only to owner.</div> : null}
          </div>
        </div>
      </div>

      {error ? <div className="card p-4 text-sm text-red-200">{error}</div> : null}

      <MasonryGrid items={items} />
    </div>
  );
}

