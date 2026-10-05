"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminBackLink, formatKoDateTime } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { deletePost } from "@/actions/admin";

type PostDetail = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author: { name: string | null };
  board: { name: string; slug: string };
};

export function AdminPostsDetail({ post }: { post: PostDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <AdminPageHeader title="게시글 상세" />
      <AdminBackLink href="/admin/posts" />
      <div className="mb-4">
        <Link href={`/community/${post.board.slug}/${post.id}`} target="_blank" className="text-sm text-brand hover:underline">사이트에서 보기</Link>
      </div>
      <article className="border border-border">
        <header className="border-b border-border px-4 py-5 md:px-6">
          <h2 className="text-lg font-semibold">{post.title}</h2>
          <p className="mt-2 text-xs text-muted-foreground">{post.board.name} · {post.author.name ?? "—"} · {formatKoDateTime(post.createdAt)}</p>
        </header>
        <div className="whitespace-pre-wrap px-4 py-6 text-sm leading-relaxed md:px-6">{post.content}</div>
      </article>
      <div className="mt-4 flex gap-2">
        <Link href="/admin/posts"><Button size="sm" variant="outline">목록</Button></Link>
        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" disabled={isPending} onClick={() => setDeleteOpen(true)}>삭제</Button>
      </div>
      <AdminConfirmDialog open={deleteOpen} title="게시글 삭제" description={`「${post.title}」 게시글을 삭제합니다.`} confirmLabel="삭제" destructive loading={isPending} onConfirm={() => startTransition(async () => { await deletePost(post.id); router.push("/admin/posts"); router.refresh(); })} onCancel={() => setDeleteOpen(false)} />
    </>
  );
}
