"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NewPostForm({ boardSlug }: { boardSlug: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      alert("로그인이 필요합니다.");
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
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용"
        rows={4}
        className="mb-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand/50"
        required
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "등록 중..." : "등록"}
      </Button>
    </form>
  );
}
