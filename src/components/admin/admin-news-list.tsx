"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminEmptyRow } from "@/components/admin/admin-board-ui";
import {
  AdminListControls,
  AdminListPaginationFooter,
  AdminTableShell,
  ADMIN_TABLE_ROW_CLASS,
  adminListRowNumber,
  useAdminList,
} from "@/components/admin/admin-list-controls";
import { Button } from "@/components/ui/button";
import { deleteNews } from "@/actions/admin";

type NewsItem = {
  id: string;
  title: string;
  category: string;
  region: string;
  createdAt: Date;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export function AdminNewsList({ news }: { news: NewsItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const getSearchText = useCallback(
    (item: NewsItem) => `${item.title} ${item.category} ${item.region}`,
    [],
  );
  const list = useAdminList(news, getSearchText);

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startTransition(async () => {
      await deleteNews(id);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <>
      <AdminPageHeader title="뉴스" subtitle={`총 ${news.length}건`} />
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
        searchPlaceholder="제목, 카테고리, 지역 검색..."
        actions={
          <Link href="/admin/news/new">
            <Button size="sm">글쓰기</Button>
          </Link>
        }
      />
      <AdminTableShell>
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">
                번호
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">제목</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">
                카테고리
              </th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">
                지역
              </th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">
                등록일
              </th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">
                관리
              </th>
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
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/news/${item.id}`}
                    className="font-medium text-foreground hover:text-brand hover:underline"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.category}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.region}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/admin/news/${item.id}`}
                      className="text-xs text-brand hover:underline"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setDeleteTarget(item)}
                      className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={6}
                message={
                  news.length === 0 ? "등록된 뉴스가 없습니다." : "검색 결과가 없습니다."
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
      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="뉴스 삭제"
        description={
          deleteTarget
            ? `「${deleteTarget.title}」 뉴스를 삭제합니다. 삭제 후에는 복구할 수 없습니다.`
            : ""
        }
        confirmLabel="삭제"
        cancelLabel="취소"
        destructive
        loading={isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
