"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
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
import { deleteHistoryEntry } from "@/actions/about";

type HistoryItem = {
  id: string;
  year: string;
  title: string;
  description: string | null;
  order: number;
};

export function AdminHistoryList({ items }: { items: HistoryItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const getSearchText = useCallback(
    (item: HistoryItem) =>
      `${item.year} ${item.title} ${item.description ?? ""}`,
    [],
  );
  const list = useAdminList(items, getSearchText);

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
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">연도</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">제목</th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">순서</th>
              <th className="w-40 px-3 py-2.5 text-center font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody>
            {list.visible.map((item, index) => (
              <tr key={item.id} className={ADMIN_TABLE_ROW_CLASS}>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {adminListRowNumber(
                    list.filteredCount,
                    index,
                    list.viewMode,
                    list.page,
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
                <td className="px-3 py-3 text-center text-muted-foreground">{item.order}</td>
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
            ))}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={5}
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
