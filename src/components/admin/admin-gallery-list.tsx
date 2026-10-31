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
import { deleteGalleryAlbum } from "@/actions/admin";

type AlbumItem = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  _count?: { photos: number };
  photos?: { id: string }[];
};

export function AdminGalleryList({ albums }: { albums: AlbumItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<AlbumItem | null>(null);
  const getSearchText = useCallback(
    (item: AlbumItem) => `${item.title} ${item.slug}`,
    [],
  );
  const list = useAdminList(albums, getSearchText);

  return (
    <>
      <AdminPageHeader title="갤러리" subtitle={`총 ${albums.length}개 앨범`} />
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
        searchPlaceholder="제목, 슬러그 검색..."
        actions={
          <>
            <Link href="/admin/gallery/categories">
              <Button size="sm" variant="outline">
                카테고리 관리
              </Button>
            </Link>
            <Link href="/admin/gallery/new">
              <Button size="sm">앨범 등록</Button>
            </Link>
          </>
        }
      />
      <AdminTableShell>
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">제목</th>
              <th className="w-32 px-3 py-2.5 text-center font-medium text-muted-foreground">슬러그</th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">사진</th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">상태</th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody>
            {list.visible.map((item, index) => {
              const photoCount = item._count?.photos ?? item.photos?.length ?? 0;
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
                  <td className="px-3 py-3">
                    <Link href={`/admin/gallery/${item.id}`} className="font-medium hover:text-brand hover:underline">{item.title}</Link>
                  </td>
                  <td className="px-3 py-3 text-center text-muted-foreground">{item.slug}</td>
                  <td className="px-3 py-3 text-center text-muted-foreground">{photoCount}</td>
                  <td className="px-3 py-3 text-center text-muted-foreground">{item.published ? "공개" : "비공개"}</td>
                  <td className="px-3 py-3 text-center">
                    <button type="button" disabled={isPending} onClick={() => setDeleteTarget(item)} className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40">삭제</button>
                  </td>
                </tr>
              );
            })}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={6}
                message={
                  albums.length === 0 ? "등록된 앨범이 없습니다." : "검색 결과가 없습니다."
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
      <AdminConfirmDialog open={deleteTarget !== null} title="앨범 삭제" description={deleteTarget ? `「${deleteTarget.title}」 앨범과 모든 사진을 삭제합니다.` : ""} confirmLabel="삭제" destructive loading={isPending} onConfirm={() => { if (!deleteTarget) return; startTransition(async () => { await deleteGalleryAlbum(deleteTarget.id); setDeleteTarget(null); router.refresh(); }); }} onCancel={() => setDeleteTarget(null)} />
    </>
  );
}
