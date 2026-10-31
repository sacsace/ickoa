"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const GUIDE_PAGE_SIZE = 10;

export type GuideListViewMode = "page" | "all";

export function guideListRowNumber(
  filteredCount: number,
  index: number,
  viewMode: GuideListViewMode,
  page: number,
  pageSize: number = GUIDE_PAGE_SIZE,
) {
  if (viewMode === "all") return filteredCount - index;
  return filteredCount - ((page - 1) * pageSize + index);
}

export function useGuideList<T>(
  items: T[],
  getSearchText: (item: T) => string,
  pageSize: number = GUIDE_PAGE_SIZE,
) {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<GuideListViewMode>("page");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) =>
      getSearchText(item).toLowerCase().includes(keyword),
    );
  }, [items, query, getSearchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [query, viewMode, items.length, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visible =
    viewMode === "all"
      ? filtered
      : filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    query,
    setQuery,
    viewMode,
    setViewMode: (mode: GuideListViewMode) => {
      setViewMode(mode);
      setPage(1);
    },
    page,
    setPage,
    totalPages,
    pageSize,
    filtered,
    visible,
    filteredCount: filtered.length,
    totalCount: items.length,
  };
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="h-8 rounded-sm border border-border px-2.5 text-xs disabled:opacity-40"
      >
        이전
      </button>
      {start > 1 ? (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="h-8 min-w-8 rounded-sm border border-border px-2 text-xs"
          >
            1
          </button>
          {start > 2 ? (
            <span className="px-1 text-xs text-muted-foreground">…</span>
          ) : null}
        </>
      ) : null}
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={cn(
            "h-8 min-w-8 rounded-sm border px-2 text-xs",
            p === page
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:bg-muted",
          )}
        >
          {p}
        </button>
      ))}
      {end < totalPages ? (
        <>
          {end < totalPages - 1 ? (
            <span className="px-1 text-xs text-muted-foreground">…</span>
          ) : null}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="h-8 min-w-8 rounded-sm border border-border px-2 text-xs"
          >
            {totalPages}
          </button>
        </>
      ) : null}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="h-8 rounded-sm border border-border px-2.5 text-xs disabled:opacity-40"
      >
        다음
      </button>
    </div>
  );
}

export function GuideListControls({
  query,
  onQueryChange,
  viewMode,
  onViewModeChange,
  page,
  totalPages,
  onPageChange,
  filteredCount,
  totalCount,
  searchPlaceholder = "검색...",
  actions,
  showSearch = true,
  countLabel = "건",
}: {
  query: string;
  onQueryChange: (value: string) => void;
  viewMode: GuideListViewMode;
  onViewModeChange: (mode: GuideListViewMode) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filteredCount: number;
  totalCount: number;
  searchPlaceholder?: string;
  actions?: ReactNode;
  showSearch?: boolean;
  countLabel?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onViewModeChange("page")}
            className={cn(
              "h-9 rounded-sm px-3 text-xs font-medium transition-colors",
              viewMode === "page"
                ? "bg-foreground text-background"
                : "border border-border bg-white text-muted-foreground hover:text-foreground",
            )}
          >
            페이지로 보기
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("all")}
            className={cn(
              "h-9 rounded-sm px-3 text-xs font-medium transition-colors",
              viewMode === "all"
                ? "bg-foreground text-background"
                : "border border-border bg-white text-muted-foreground hover:text-foreground",
            )}
          >
            전체보기
          </button>
          <span className="ml-1 text-xs text-muted-foreground">
            {filteredCount === totalCount
              ? `총 ${totalCount}${countLabel}`
              : `${filteredCount}${countLabel} / 전체 ${totalCount}${countLabel}`}
            {viewMode === "page" && totalPages > 1
              ? ` · ${page}/${totalPages}페이지`
              : ""}
          </span>
        </div>

        {showSearch || actions ? (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center xl:w-auto xl:max-w-2xl xl:flex-1">
            {showSearch ? (
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-9 w-full rounded-sm border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-foreground/30"
                  autoComplete="off"
                  suppressHydrationWarning
                />
              </div>
            ) : null}
            {actions ? (
              <div className="flex shrink-0 flex-wrap justify-end gap-2">{actions}</div>
            ) : null}
          </div>
        ) : null}
      </div>

      {viewMode === "page" ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      ) : null}
    </div>
  );
}

export function GuideListPaginationFooter({
  viewMode,
  page,
  totalPages,
  onPageChange,
}: {
  viewMode: GuideListViewMode;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (viewMode !== "page" || totalPages <= 1) return null;
  return (
    <div className="mt-4">
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
