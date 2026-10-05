"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Flag } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import {
  createComment,
  toggleLike,
  createReport,
  deleteOwnPost,
} from "@/actions/community";
import { isHtmlContent, sanitizePostHtml } from "@/lib/sanitize-html";

function PostBody({ content }: { content: string }) {
  if (isHtmlContent(content)) {
    return (
      <div
        className="post-body text-sm leading-relaxed [&_a]:text-brand [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: sanitizePostHtml(content) }}
      />
    );
  }
  return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
}

type PostData = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author: { id: string; name: string | null; image: string | null };
  board: { slug: string; name: string };
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    author: { id: string; name: string | null; image: string | null };
  }[];
  attachments: { id: string; url: string; filename: string }[];
  _count: { likes: number };
};

export function PostDetailClient({
  post,
  currentUserId,
}: {
  post: PostData;
  currentUserId?: string | null;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [liked, setLiked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const canManage = !!currentUserId && post.author.id === currentUserId;
  const isLoggedIn = !!currentUserId;
  const loginHref = `/login?callbackUrl=${encodeURIComponent(`/community/${post.board.slug}/${post.id}`)}`;

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }
    startTransition(async () => {
      try {
        await createComment(post.id, comment);
        setComment("");
        router.refresh();
      } catch {
        router.push(loginHref);
      }
    });
  }

  function handleLike() {
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }
    startTransition(async () => {
      try {
        const result = await toggleLike(post.id);
        setLiked(result.liked);
        setLikeCount((c) => (result.liked ? c + 1 : c - 1));
      } catch {
        router.push(loginHref);
      }
    });
  }

  function handleReport() {
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }
    const reason = prompt("신고 사유를 입력하세요:");
    if (!reason) return;
    startTransition(async () => {
      try {
        await createReport(post.id, reason);
        alert("신고가 접수되었습니다.");
      } catch {
        router.push(loginHref);
      }
    });
  }

  return (
    <>
      <PageHeader title={post.title} backHref={`/community/${post.board.slug}`} />
      <div className="mx-auto max-w-[1356px] px-4 py-8 md:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-border bg-card px-4 py-3 text-sm">
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{post.author.name}</span>
            <span className="mx-2">·</span>
            <span>{post.createdAt.toLocaleDateString("ko-KR")}</span>
            <span className="mx-2">·</span>
            <span>{post.board.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              disabled={isPending}
              className={`flex items-center gap-1 px-2 py-1 transition-colors ${liked ? "text-brand" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-brand" : ""}`} />
              {likeCount}
            </button>
            <button
              type="button"
              onClick={handleReport}
              className="flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-foreground"
            >
              <Flag className="h-4 w-4" />
              신고
            </button>
            {canManage ? (
              <>
                <Link href={`/community/${post.board.slug}/${post.id}/edit`}>
                  <Button type="button" variant="outline" size="sm">
                    수정
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteOpen(true)}
                >
                  삭제
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="border border-border bg-card p-5 md:p-6">
          <PostBody content={post.content} />
          {post.attachments.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {post.attachments.map((a) => (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-brand hover:underline"
                >
                  {a.filename}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Link href={`/community/${post.board.slug}`}>
            <Button type="button" variant="outline" size="sm">
              목록
            </Button>
          </Link>
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-sm font-bold">댓글 ({post.comments.length})</h3>
          <div className="space-y-2">
            {post.comments.map((c) => (
              <div key={c.id} className="border border-border bg-card p-4">
                <p className="text-sm font-medium">{c.author.name}</p>
                <p className="mt-1 text-sm text-foreground">{c.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.createdAt.toLocaleDateString("ko-KR")}
                </p>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                등록된 댓글이 없습니다.
              </p>
            )}
          </div>

          {isLoggedIn ? (
            <form onSubmit={handleComment} className="mt-3 flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                className="h-11 flex-1 border border-border bg-card px-4 text-sm outline-none focus:border-brand"
                required
              />
              <Button type="submit" size="sm" disabled={isPending}>
                등록
              </Button>
            </form>
          ) : (
            <div className="mt-3 flex items-center justify-between gap-3 border border-border bg-muted/40 px-4 py-3 text-sm">
              <span className="text-muted-foreground">로그인 후 댓글을 작성할 수 있습니다.</span>
              <Link href={loginHref}>
                <Button type="button" size="sm" variant="outline">
                  로그인
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <AdminConfirmDialog
        open={deleteOpen}
        title="게시글 삭제"
        description={`「${post.title}」 게시글을 삭제합니다.`}
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          startTransition(async () => {
            try {
              const result = await deleteOwnPost(post.id);
              setDeleteOpen(false);
              router.push(`/community/${result.boardSlug}`);
              router.refresh();
            } catch {
              alert("삭제 권한이 없거나 로그인 상태가 아닙니다.");
              setDeleteOpen(false);
            }
          });
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
