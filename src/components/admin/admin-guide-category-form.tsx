"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createGuideCategory, updateGuideCategory } from "@/actions/admin";

type CategoryFormProps = {
  mode: "create" | "edit";
  category?: {
    id: string;
    name: string;
    nameEn: string | null;
    slug: string;
    order: number;
  };
};

export function AdminGuideCategoryForm({ mode, category }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: category?.name ?? "",
    nameEn: category?.nameEn ?? "",
    slug: category?.slug ?? "",
    order: category?.order ?? 0,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        if (mode === "edit" && category) {
          await updateGuideCategory(category.id, {
            name: form.name,
            nameEn: form.nameEn,
            slug: form.slug,
            order: Number(form.order),
          });
        } else {
          await createGuideCategory({
            name: form.name,
            nameEn: form.nameEn,
            slug: form.slug || undefined,
            order: Number(form.order),
          });
        }
        router.push("/admin/guides/categories");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader
        title={mode === "edit" ? "카테고리 수정" : "카테고리 등록"}
        subtitle="생활가이드 분류를 관리합니다"
      />
      <AdminBackLink href="/admin/guides/categories" />

      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">이름 (한국어)</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            placeholder="예: 비자, 게스트하우스"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">이름 (영문, 선택)</label>
          <input
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            placeholder="Visa"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              슬러그 (비우면 자동 생성)
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="visa"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">표시 순서</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : mode === "edit" ? "수정" : "등록"}
          </Button>
          <Link href="/admin/guides/categories">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
