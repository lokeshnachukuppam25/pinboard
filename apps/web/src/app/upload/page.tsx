"use client";

import React, { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => !!user && !!file && title.trim().length > 0, [user, file, title]);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-6">
          <div className="text-xl font-semibold">Upload a pin</div>
          <div className="mt-2 text-sm text-zinc-400">You need to be logged in to upload.</div>
          <div className="mt-6">
            <button className="btn-primary" onClick={() => router.push("/login")}>
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="card p-6">
        <div className="text-xl font-semibold">Upload a pin</div>
        <div className="mt-1 text-sm text-zinc-400">Share an image with a title, description and tags.</div>

        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!file) return;
            setLoading(true);
            setError(null);
            try {
              const res = await api.createPost({ title: title.trim(), description: description.trim(), tags: tags.trim(), file });
              router.push(`/p/${encodeURIComponent(res.id)}`);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            className="input min-h-[110px] resize-none"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input className="input" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />

          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
              }}
            />
            {file ? <div className="mt-2 text-xs text-zinc-400">Selected: {file.name}</div> : null}
          </div>

          {error ? <div className="text-sm text-red-200">{error}</div> : null}

          <button className="btn-primary w-full" disabled={!canSubmit || loading}>
            {loading ? "Uploading…" : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}

