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
import { deleteBanner } from "@/actions/admin";

type BannerItem = { id: string; title: string; active: boolean };

export function AdminBannersList({ banners }: { banners: BannerItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<BannerItem | null>(null);
  const getSearchText = useCallback((item: BannerItem) => item.title, []);
  const list = useAdminList(banners, getSearchText);

  return (
    <>
      <AdminPageHeader title="배너" subtitle={`총 ${banners.length}건`} />
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
        searchPlaceholder="제목 검색..."
        actions={
          <Link href="/admin/banners/new">
            <Button size="sm">배너 등록</Button>
          </Link>
        }
      />
      <AdminTableShell>
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">제목</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">상태</th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">관리</th>
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
                  <Link href={`/admin/banners/${item.id}`} className="font-medium hover:text-brand hover:underline">{item.title}</Link>
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.active ? "활성" : "비활성"}</td>
                <td className="px-3 py-3 text-center">
                  <button type="button" disabled={isPending} onClick={() => setDeleteTarget(item)} className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40">삭제</button>
                </td>
              </tr>
            ))}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={4}
                message={
                  banners.length === 0 ? "등록된 배너가 없습니다." : "검색 결과가 없습니다."
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
      <AdminConfirmDialog open={deleteTarget !== null} title="배너 삭제" description={deleteTarget ? `「${deleteTarget.title}」 배너를 삭제합니다.` : ""} confirmLabel="삭제" destructive loading={isPending} onConfirm={() => { if (!deleteTarget) return; startTransition(async () => { await deleteBanner(deleteTarget.id); setDeleteTarget(null); router.refresh(); }); }} onCancel={() => setDeleteTarget(null)} />
    </>
  );
}
