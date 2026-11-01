"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink, AdminEmptyRow } from "@/components/admin/admin-board-ui";
import {
  AdminListControls,
  AdminListPaginationFooter,
  AdminTableShell,
  ADMIN_TABLE_ROW_CLASS,
  adminListRowNumber,
  useAdminList,
} from "@/components/admin/admin-list-controls";
import { Button } from "@/components/ui/button";
import {
  deleteHistoryEntry,
  moveHistoryEntry,
  setHistoryEntryOrder,
} from "@/actions/about";

type HistoryItem = {
  id: string;
  year: string;
  title: string;
  description: string | null;
  image?: string | null;
  order: number;
};

function OrderControls({
  item,
  canMoveUp,
  canMoveDown,
  disabled,
  busy,
  maxOrder,
  onMove,
  onSetOrder,
}: {
  item: HistoryItem;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled: boolean;
  busy: boolean;
  maxOrder: number;
  onMove: (direction: "up" | "down") => void;
  onSetOrder: (order: number) => void;
}) {
  const [value, setValue] = useState(String(item.order));

  useEffect(() => {
    setValue(String(item.order));
  }, [item.order]);

  function commit() {
    const next = Number.parseInt(value, 10);
    if (!Number.isFinite(next) || next < 1) {
      setValue(String(item.order));
      return;
    }
    if (next === item.order) return;
    onSetOrder(next);
  }

  return (
    <div className="inline-flex items-center justify-center gap-1">
      <input
        type="number"
        min={1}
        max={maxOrder}
        value={value}
        disabled={disabled}
        aria-label={`${item.title} 순서`}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="h-7 w-12 border border-border bg-background px-1 text-center text-sm tabular-nums disabled:opacity-50"
      />
      <button
        type="button"
        aria-label="순서 위로"
        disabled={!canMoveUp || disabled}
        onClick={() => onMove("up")}
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
      >
        <ChevronUp className={`h-4 w-4 ${busy ? "opacity-50" : ""}`} />
      </button>
      <button
        type="button"
        aria-label="순서 아래로"
        disabled={!canMoveDown || disabled}
        onClick={() => onMove("down")}
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
      >
        <ChevronDown className={`h-4 w-4 ${busy ? "opacity-50" : ""}`} />
      </button>
    </div>
  );
}

export function AdminHistoryList({ items }: { items: HistoryItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const getSearchText = useCallback(
    (item: HistoryItem) =>
      `${item.year} ${item.title} ${item.description ?? ""}`,
    [],
  );
  const list = useAdminList(items, getSearchText);

  const orderedIds = useMemo(
    () =>
      [...items]
        .sort((a, b) => a.order - b.order || a.year.localeCompare(b.year))
        .map((item) => item.id),
    [items],
  );

  function handleMove(id: string, direction: "up" | "down") {
    setMovingId(id);
    startTransition(async () => {
      await moveHistoryEntry(id, direction);
      router.refresh();
      setMovingId(null);
    });
  }

  function handleSetOrder(id: string, order: number) {
    setMovingId(id);
    startTransition(async () => {
      await setHistoryEntryOrder(id, order);
      router.refresh();
      setMovingId(null);
    });
  }

  return (
    <>
      <AdminPageHeader title="연혁" subtitle={`총 ${items.length}건`} />
      <AdminBackLink href="/admin/about" />
      <AdminListControls
        query={list.query}
        onQueryChange={list.setQuery}
        viewMode={list.viewMode}
        onViewModeChange={list.setViewMode}
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
        filteredCount={list.filteredCount}
        totalCount={list.totalCount}
        searchPlaceholder="연도, 제목 검색..."
        actions={
          <Link href="/admin/about/history/new">
            <Button size="sm">연혁 추가</Button>
          </Link>
        }
      />
      <AdminTableShell>
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">사진</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">연도</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">제목</th>
              <th className="w-36 px-3 py-2.5 text-center font-medium text-muted-foreground">순서</th>
              <th className="w-40 px-3 py-2.5 text-center font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody>
            {list.visible.map((item, index) => {
              const orderIndex = orderedIds.indexOf(item.id);
              const canMoveUp = orderIndex > 0;
              const canMoveDown = orderIndex >= 0 && orderIndex < orderedIds.length - 1;
              const busy = isPending && movingId === item.id;

              return (
                <tr key={item.id} className={ADMIN_TABLE_ROW_CLASS}>
                  <td className="px-3 py-3 text-center text-muted-foreground">
                    {adminListRowNumber(
                      list.filteredCount,
                      index,
                      list.viewMode,
                      list.page,
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt=""
                        className="mx-auto h-10 w-14 object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center font-medium">{item.year}</td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/about/history/${item.id}`}
                      className="hover:text-brand hover:underline"
                    >
                      {item.title}
                    </Link>
                    {item.description ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <OrderControls
                      item={item}
                      canMoveUp={canMoveUp}
                      canMoveDown={canMoveDown}
                      disabled={isPending}
                      busy={busy}
                      maxOrder={items.length}
                      onMove={(direction) => handleMove(item.id, direction)}
                      onSetOrder={(order) => handleSetOrder(item.id, order)}
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="inline-flex justify-center gap-2">
                      <Link href={`/admin/about/history/${item.id}`}>
                        <Button size="sm" variant="outline">
                          수정
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending && deletingId === item.id}
                        onClick={() => {
                          if (!confirm(`「${item.title}」을(를) 삭제할까요?`)) return;
                          setDeletingId(item.id);
                          startTransition(async () => {
                            await deleteHistoryEntry(item.id);
                            router.refresh();
                          });
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={6}
                message={
                  items.length === 0 ? "등록된 연혁이 없습니다." : "검색 결과가 없습니다."
                }
              />
            )}
          </tbody>
        </table>
      </AdminTableShell>
      <AdminListPaginationFooter
        viewMode={list.viewMode}
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
      />
    </>
  );
}
