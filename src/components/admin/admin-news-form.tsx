"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { createNews } from "@/actions/admin";

export function AdminNewsForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "경제",
    region: "Chennai",
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const news = await createNews(form);
        router.push(`/admin/news/${news.id}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title="뉴스 등록" subtitle="새 뉴스 글을 작성합니다" />

      <div className="mb-4">
        <Link
          href="/admin/news"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          ← 목록으로
        </Link>
      </div>

      <form onSubmit={handleCreate} className="space-y-4 border border-border p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">제목</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">내용</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={12}
            className="w-full border border-border bg-background px-4 py-3 text-sm leading-relaxed"
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">카테고리</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">지역</label>
            <input
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "등록 중..." : "등록"}
          </Button>
          <Link href="/admin/news">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
