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
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { deleteActivityReport } from "@/actions/about";

type ReportItem = {
  id: string;
  year: number | null;
  title: string;
  published: boolean;
  order: number;
};

export function AdminReportsAboutList({ items }: { items: ReportItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReportItem | null>(null);
  const getSearchText = useCallback(
    (item: ReportItem) => `${item.year ?? ""} ${item.title}`,
    [],
  );
  const list = useAdminList(items, getSearchText);

  return (
    <>
      <AdminPageHeader title="활동 보고서" subtitle={`총 ${items.length}건`} />
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
          <Link href="/admin/about/reports/new">
            <Button size="sm">보고서 등록</Button>
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
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">공개</th>
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
                <td className="px-3 py-3 text-center font-medium">{item.year ?? "—"}</td>
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/about/reports/${item.id}`}
                    className="hover:text-brand hover:underline"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {item.published ? "공개" : "비공개"}
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="inline-flex justify-center gap-2">
                    <Link href={`/admin/about/reports/${item.id}`}>
                      <Button size="sm" variant="outline">
                        수정
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending && deletingId === item.id}
                      onClick={() => setDeleteTarget(item)}
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
                  items.length === 0
                    ? "등록된 활동 보고서가 없습니다."
                    : "검색 결과가 없습니다."
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
        title="활동 보고서 삭제"
        description={
          deleteTarget
            ? `「${deleteTarget.title}」을(를) 삭제합니다. 삭제 후 복구할 수 없습니다.`
            : ""
        }
        confirmLabel="삭제"
        destructive
        loading={isPending && deletingId === deleteTarget?.id}
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          setDeletingId(id);
          startTransition(async () => {
            await deleteActivityReport(id);
            setDeleteTarget(null);
            router.refresh();
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
