"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createGuide } from "@/actions/admin";

type CategoryOption = { id: string; name: string };

export function AdminGuidesForm({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    category: categories[0]?.name ?? "",
    region: "Chennai",
    title: "",
    content: "",
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const guide = await createGuide(form);
        router.push(`/admin/guides/${guide.id}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title="가이드 등록" />
      <AdminBackLink href="/admin/guides" />
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
            className="w-full border border-border bg-background px-4 py-3 text-sm"
            required
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">카테고리</label>
            {categories.length > 0 ? (
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-11 w-full border border-border bg-background px-3 text-sm"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-600">
                  등록된 카테고리가 없습니다. 먼저 카테고리를 만들어 주세요.
                </p>
                <Link href="/admin/guides/categories/new" className="text-sm text-brand hover:underline">
                  카테고리 등록하기
                </Link>
              </div>
            )}
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
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={isPending || categories.length === 0}
          >
            {isPending ? "등록 중..." : "등록"}
          </Button>
          <Link href="/admin/guides">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
