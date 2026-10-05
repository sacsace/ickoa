"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "@/components/community/content-editor";
import { createPost, updatePost } from "@/actions/community";
import { plainTextFromHtml, sanitizePostHtml } from "@/lib/sanitize-html";

type PostFormProps = {
  boardSlug: string;
  mode: "create" | "edit";
  post?: { id: string; title: string; content: string };
};

export function PostForm({ boardSlug, mode, post }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!plainTextFromHtml(content)) {
      setError("내용을 입력해 주세요.");
      return;
    }

    const cleanContent = sanitizePostHtml(content);

    startTransition(async () => {
      try {
        if (mode === "edit" && post) {
          await updatePost(post.id, title, cleanContent);
          router.push(`/community/${boardSlug}/${post.id}`);
        } else {
          const created = await createPost(boardSlug, title, cleanContent);
          router.push(`/community/${created.boardSlug}/${created.id}`);
        }
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (message === "Unauthorized") {
          setError("로그인이 필요합니다.");
        } else if (message === "Forbidden") {
          setError("수정 권한이 없습니다.");
        } else {
          setError(message || "저장에 실패했습니다.");
        }
      }
    });
  }

  const listHref = `/community/${boardSlug}`;

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold">{mode === "edit" ? "글 수정" : "글 등록"}</h2>
      </div>
      <div className="space-y-3 p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
          required
        />
        <ContentEditor value={content} onChange={setContent} placeholder="내용" />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Link href={mode === "edit" && post ? `/community/${boardSlug}/${post.id}` : listHref}>
            <Button type="button" variant="outline" size="sm">
              취소
            </Button>
          </Link>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : mode === "edit" ? "수정" : "등록"}
          </Button>
        </div>
      </div>
    </form>
  );
}
