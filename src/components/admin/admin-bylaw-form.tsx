"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createBylaw, updateBylaw } from "@/actions/about";

type BylawFormProps = {
  initial?: {
    id: string;
    title: string;
    content: string;
    order: number;
    published: boolean;
  };
};

export function AdminBylawForm({ initial }: BylawFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    content: initial?.content ?? "",
    order: String(initial?.order ?? 0),
    published: initial?.published ?? true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      title: form.title,
      content: form.content,
      order: Number(form.order) || 0,
      published: form.published,
    };
    startTransition(async () => {
      try {
        if (initial) await updateBylaw(initial.id, payload);
        else await createBylaw(payload);
        router.push("/admin/about/bylaws");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title={initial ? "정관 수정" : "정관 등록"} />
      <AdminBackLink href="/admin/about/bylaws" />
      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">제목 *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="제1장 총칙"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">표시 순서</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="h-11 w-full border border-border bg-background px-4 text-sm"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                사이트에 공개
              </label>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">내용 *</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={16}
            className="w-full border border-border bg-background px-4 py-3 font-mono text-sm leading-relaxed"
            placeholder="제1조 (명칭) ..."
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : initial ? "수정" : "등록"}
          </Button>
          <Link href="/admin/about/bylaws">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
