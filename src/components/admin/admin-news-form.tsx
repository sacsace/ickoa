"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createNews, updateNews } from "@/actions/admin";

type NewsFormProps = {
  initial?: {
    id: string;
    title: string;
    content: string;
    category: string;
    region: string;
    image: string | null;
  };
};

export function AdminNewsForm({ initial }: NewsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    content: initial?.content ?? "",
    category: initial?.category ?? "경제",
    region: initial?.region ?? "Chennai",
    image: initial?.image ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      title: form.title,
      content: form.content,
      category: form.category,
      region: form.region,
      image: form.image || undefined,
    };
    startTransition(async () => {
      try {
        if (initial) {
          await updateNews(initial.id, payload);
          router.push("/admin/news");
        } else {
          const news = await createNews(payload);
          router.push(`/admin/news/${news.id}`);
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader
        title={initial ? "뉴스 수정" : "뉴스 등록"}
        subtitle={initial ? "뉴스 내용을 수정합니다" : "새 뉴스 글을 작성합니다"}
      />
      <AdminBackLink href="/admin/news" />

      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">제목 *</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">내용 *</label>
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

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">이미지 URL</label>
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            placeholder="https://... 또는 /image/..."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : initial ? "수정" : "등록"}
          </Button>
          <Link href="/admin/news">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
          {initial ? (
            <Link href={`/news/${initial.id}`} target="_blank">
              <Button type="button" size="sm" variant="outline">
                사이트에서 보기
              </Button>
            </Link>
          ) : null}
        </div>
      </form>
    </>
  );
}
