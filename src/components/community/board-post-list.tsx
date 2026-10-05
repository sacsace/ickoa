"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AuthWriteLink } from "@/components/ui/auth-write-link";
import { deleteOwnPost } from "@/actions/community";

export type BoardPostItem = {
  id: string;
  title: string;
  createdAt: Date | string;
  author: { id: string; name: string | null };
  _count: { comments: number; likes: number };
};

function formatKoDate(date: Date | string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

/** 작성자 표시용: 첫 단어만, 길면 말줄임 */
function shortAuthorName(name: string | null | undefined) {
  const trimmed = name?.trim();
  if (!trimmed) return "—";
  const first = trimmed.split(/\s+/)[0] ?? trimmed;
  return first.length > 8 ? `${first.slice(0, 8)}…` : first;
}

export function BoardPostList({
  boardSlug,
  posts,
  currentUserId,
}: {
  boardSlug: string;
  posts: BoardPostItem[];
  currentUserId?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<BoardPostItem | null>(null);

  return (
    <>
      <div className="mb-3 flex justify-end">
        <AuthWriteLink href={`/community/${boardSlug}/new`} label="글쓰기" />
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[640px] border-collapse text-[13px] leading-snug">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-12 px-2 py-1.5 text-center font-medium text-muted-foreground">
                번호
              </th>
              <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">제목</th>
              <th className="w-20 px-2 py-1.5 text-center font-medium text-muted-foreground">
                작성자
              </th>
              <th className="w-24 px-2 py-1.5 text-center font-medium text-muted-foreground">
                작성일
              </th>
              <th className="w-12 px-2 py-1.5 text-center font-medium text-muted-foreground">
                댓글
              </th>
              <th className="w-20 px-2 py-1.5 text-center font-medium text-muted-foreground">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => {
              const canManage = !!currentUserId && post.author.id === currentUserId;
              const authorLabel = shortAuthorName(post.author.name);
              return (
                <tr
                  key={post.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/40"
                >
                  <td className="whitespace-nowrap px-2 py-2 text-center text-muted-foreground">
                    {posts.length - index}
                  </td>
                  <td className="max-w-0 px-2 py-2">
                    <Link
                      href={`/community/${boardSlug}/${post.id}`}
                      title={post.title}
                      className="block truncate font-medium hover:text-brand hover:underline"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td
                    className="max-w-[5rem] px-2 py-2 text-center text-muted-foreground"
                    title={post.author.name ?? undefined}
                  >
                    <span className="block truncate">{authorLabel}</span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-center text-muted-foreground">
                    {formatKoDate(post.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-center text-muted-foreground">
                    {post._count.comments}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-center">
                    {canManage ? (
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/community/${boardSlug}/${post.id}/edit`}
                          className="text-xs text-brand hover:underline"
                        >
                          수정
                        </Link>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setDeleteTarget(post)}
                          className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40"
                        >
                          삭제
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-2 py-8 text-center text-sm text-muted-foreground"
                >
                  등록된 게시글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="게시글 삭제"
        description={
          deleteTarget ? `「${deleteTarget.title}」 게시글을 삭제합니다.` : ""
        }
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            try {
              await deleteOwnPost(deleteTarget.id);
              setDeleteTarget(null);
              router.refresh();
            } catch {
              alert("삭제 권한이 없거나 로그인 상태가 아닙니다.");
              setDeleteTarget(null);
            }
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
