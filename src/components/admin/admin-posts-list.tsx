"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminEmptyRow } from "@/components/admin/admin-board-ui";
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

  return (
    <>
      <AdminPageHeader title="게시글" subtitle={`총 ${posts.length}건`} />
      <div className="overflow-x-auto border border-border">
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
            {posts.map((item, index) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-3 text-center text-muted-foreground">{posts.length - index}</td>
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
            {posts.length === 0 && <AdminEmptyRow colSpan={5} message="게시글이 없습니다." />}
          </tbody>
        </table>
      </div>
      <AdminConfirmDialog open={deleteTarget !== null} title="게시글 삭제" description={deleteTarget ? `「${deleteTarget.title}」 게시글을 삭제합니다.` : ""} confirmLabel="삭제" destructive loading={isPending} onConfirm={() => { if (!deleteTarget) return; startTransition(async () => { await deletePost(deleteTarget.id); setDeleteTarget(null); router.refresh(); }); }} onCancel={() => setDeleteTarget(null)} />
    </>
  );
}
