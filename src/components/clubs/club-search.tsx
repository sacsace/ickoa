"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function ClubSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const trimmed = q.trim();
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    router.push(qs ? `/clubs?${qs}` : "/clubs");
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xl">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="동호회명, 소개, 그룹장 검색..."
        className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-24 text-sm outline-none focus:border-foreground/30"
        autoComplete="off"
        suppressHydrationWarning
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-[3px] bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-dark"
      >
        검색
      </button>
    </form>
  );
}
