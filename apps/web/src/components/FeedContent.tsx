"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api, type ApiPostListItem } from "@/lib/api";
import { MasonryGrid } from "@/components/MasonryGrid";
import { InfiniteSentinel } from "@/components/InfiniteSentinel";
import { useSearchParams } from "next/navigation";

export function FeedContent() {
  const sp = useSearchParams();
  const q = useMemo(() => (sp.get("q") ?? "").trim(), [sp]);
  const tag = useMemo(() => (sp.get("tag") ?? "").trim(), [sp]);

  const [items, setItems] = useState<ApiPostListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (nextPage: number) => {
      if (loading) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.listFeed({ page: nextPage, limit: 18, q: q || undefined, tag: tag || undefined });
        setItems((prev) => (nextPage === 1 ? res.items : [...prev, ...res.items]));
        setHasMore(res.hasMore);
        setPage(nextPage);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load feed");
      } finally {
        setLoading(false);
      }
    },
    [loading, q, tag]
  );

  useEffect(() => {
    void loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tag]);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xl font-semibold tracking-tight">Discover ideas</div>
            <div className="text-sm text-zinc-400">A Pinterest-inspired feed with fast infinite scrolling.</div>
          </div>
          <div className="text-xs text-zinc-500">
            {q ? (
              <>
                Searching for <span className="text-zinc-300">“{q}”</span>
              </>
            ) : tag ? (
              <>
                Tag <span className="text-zinc-300">#{tag}</span>
              </>
            ) : (
              <>Latest</>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="card p-4 text-sm text-red-200 ring-1 ring-red-500/30">{error}</div>
      ) : null}

      <MasonryGrid items={items} />

      <div className="flex items-center justify-center py-6">
        {loading ? <div className="text-sm text-zinc-400">Loading…</div> : null}
      </div>

      <InfiniteSentinel
        disabled={!hasMore || loading}
        onVisible={() => {
          if (!hasMore || loading) return;
          void loadPage(page + 1);
        }}
      />
    </div>
  );
}
