"use client";

import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api, type ApiPostDetail } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [post, setPost] = useState<ApiPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getPost(id);
        if (!cancelled) setPost(res.post);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load post");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="text-sm text-zinc-400">Loading…</div>;
  if (error) return <div className="card p-4 text-sm text-red-200">{error}</div>;
  if (!post) return <div className="text-sm text-zinc-400">Not found</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
        <Image src={post.imageUrl} alt={post.title} width={1400} height={1400} className="h-auto w-full object-cover" />
      </div>

      <div className="space-y-4">
        <div className="card p-6">
          <div className="text-2xl font-semibold tracking-tight">{post.title}</div>
          <div className="mt-1 text-sm text-zinc-400">
            by{" "}
            <Link className="text-zinc-100 underline" href={`/profile/${encodeURIComponent(post.user.username)}`}>
              {post.user.username}
            </Link>
          </div>
          {post.description ? <div className="mt-4 text-sm text-zinc-200">{post.description}</div> : null}

          {post.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/?tag=${encodeURIComponent(t)}`}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-200 ring-1 ring-white/10 hover:bg-white/10"
                >
                  #{t}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              className="btn-ghost"
              disabled={!user || busy}
              onClick={async () => {
                if (!user) return;
                setBusy(true);
                try {
                  const res = await api.toggleLike(post.id);
                  setPost((p) => (p ? { ...p, likesCount: res.likesCount } : p));
                } finally {
                  setBusy(false);
                }
              }}
            >
              Like ({post.likesCount})
            </button>
            <button
              className="btn-ghost"
              disabled={!user || busy}
              onClick={async () => {
                if (!user) return;
                setBusy(true);
                try {
                  const res = await api.toggleSave(post.id);
                  setPost((p) => (p ? { ...p, savesCount: res.savesCount } : p));
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save ({post.savesCount})
            </button>
            {!user ? <div className="text-xs text-zinc-500">Login to like/save/comment.</div> : null}
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm font-semibold">Comments</div>
          <div className="mt-3 space-y-3">
            {post.comments.length ? (
              post.comments.slice().reverse().map((c) => (
                <div key={c.id} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-sm text-zinc-200">{c.text}</div>
                  <div className="mt-1 text-xs text-zinc-500">{new Date(c.createdAt).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-500">No comments yet.</div>
            )}
          </div>

          {user ? (
            <form
              className="mt-4 flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!comment.trim()) return;
                setBusy(true);
                try {
                  await api.addComment(post.id, comment.trim());
                  const res = await api.getPost(post.id);
                  setPost(res.post);
                  setComment("");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <input className="input" placeholder="Write a comment…" value={comment} onChange={(e) => setComment(e.target.value)} />
              <button className="btn-primary" disabled={busy}>
                Post
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

