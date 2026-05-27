"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { ApiPostListItem } from "@/lib/api";

export function MasonryGrid({ items }: { items: ApiPostListItem[] }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((p) => (
        <div key={p.id} className="mb-4 break-inside-avoid">
          <Link
            href={`/p/${encodeURIComponent(p.id)}`}
            className="block overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 shadow-soft transition hover:-translate-y-0.5"
          >
            <div className="relative w-full">
              <Image
                src={p.imageUrl}
                alt={p.title}
                width={900}
                height={900}
                className="h-auto w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          </Link>
          <div className="mt-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{p.title}</div>
              <div className="truncate text-xs text-zinc-500">
                by <span className="text-zinc-700">{p.user.username}</span>
              </div>
            </div>
            <div className="shrink-0 text-xs text-zinc-500">
              {p.likesCount} likes
            </div>
          </div>
          {p.tags?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {p.tags.slice(0, 4).map((t) => (
                <span key={t} className="rounded-full bg-zinc-900/5 px-2 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200">
                  #{t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

