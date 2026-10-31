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
import { deletePost } from "@/actions/admin";

type PostItem = {
  id: string;
  title: string;
  author: { name: string | null };
  board: { name: string; slug: string };
};

export function AdminPostsList({ posts }: { posts: PostItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<PostItem | null>(null);
  const getSearchText = useCallback(
    (item: PostItem) =>
      `${item.title} ${item.board.name} ${item.author.name ?? ""}`,
    [],
  );
  const list = useAdminList(posts, getSearchText);

  return (
    <>
      <AdminPageHeader title="게시글" subtitle={`총 ${posts.length}건`} />
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
        searchPlaceholder="제목, 게시판, 작성자 검색..."
        actions={
          <Link href="/admin/boards">
            <Button size="sm" variant="outline">
              게시판 카테고리 관리
            </Button>
          </Link>
        }
      />
      <AdminTableShell>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">제목</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">게시판</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">작성자</th>
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
                  <Link href={`/admin/posts/${item.id}`} className="font-medium hover:text-brand hover:underline">{item.title}</Link>
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.board.name}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.author.name ?? "—"}</td>
                <td className="px-3 py-3 text-center">
                  <button type="button" disabled={isPending} onClick={() => setDeleteTarget(item)} className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40">삭제</button>
                </td>
              </tr>
            ))}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={5}
                message={posts.length === 0 ? "게시글이 없습니다." : "검색 결과가 없습니다."}
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
      <AdminConfirmDialog open={deleteTarget !== null} title="게시글 삭제" description={deleteTarget ? `「${deleteTarget.title}」 게시글을 삭제합니다.` : ""} confirmLabel="삭제" destructive loading={isPending} onConfirm={() => { if (!deleteTarget) return; startTransition(async () => { await deletePost(deleteTarget.id); setDeleteTarget(null); router.refresh(); }); }} onCancel={() => setDeleteTarget(null)} />
    </>
  );
}
