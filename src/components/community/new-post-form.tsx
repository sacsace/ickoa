"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "@/components/community/content-editor";
import { useAlert } from "@/components/providers/alert-provider";
import { plainTextFromHtml } from "@/lib/sanitize-html";

export function NewPostForm({ boardSlug }: { boardSlug: string }) {
  const router = useRouter();
  const alert = useAlert();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !plainTextFromHtml(content)) {
      await alert({
        title: "입력 확인",
        message: "제목과 내용을 입력해 주세요.",
        variant: "error",
      });
      return;
    }
    setLoading(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardSlug, title, content }),
    });

    setLoading(false);
    if (res.ok) {
      setTitle("");
      setContent("");
      router.refresh();
    } else if (res.status === 401) {
      await alert({
        title: "로그인 필요",
        message: "로그인이 필요합니다.",
        variant: "error",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-bold">새 글 작성</h3>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="mb-3 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brand/50"
        required
      />
      <div className="mb-3">
        <ContentEditor
          value={content}
          onChange={setContent}
          placeholder="내용"
          minHeight={200}
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "등록 중..." : "등록"}
      </Button>
    </form>
  );
}
