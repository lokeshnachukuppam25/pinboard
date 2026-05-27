import { Suspense } from "react";
import { FeedContent } from "@/components/FeedContent";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-400">Loading feed…</div>}>
      <FeedContent />
    </Suspense>
  );
}
